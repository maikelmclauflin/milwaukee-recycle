const { google } = require('googleapis')
const { loggers } = require('./debug')
const auth = require('./auth')
const fetch = require('./fetch')
const timezoneOffset = {
  'America/Chicago': 300,
}
module.exports = main

async function main(address) {
  const authenticated = await auth()
  const calendar = google.calendar({
    version: 'v3', 
    auth: authenticated,
  })
  loggers.fillCalendar('filling')
  const calendars = await listCalendars(calendar)
  const garbageCalendar = findGarbageCalendar(calendars.items)
  const { id, timeZone } = garbageCalendar
  const { items: events } = await listEvents(calendar, id)
  const nextPickups = await fetch(address)
  const eventsToCreate = collectEvents(events, nextPickups, timeZone)
  await insertMissingEvents(calendar, id, eventsToCreate)
  return nextPickups
}

function collectEvents(events, nextPickups, timeZone) {
  const garbageIsOnCalendar = checkIsOnCalendar(events, nextPickups, 'garbage')
  const recyclingIsOnCalendar = checkIsOnCalendar(events, nextPickups, 'recycling')
  const eventsToCreate = []
  if (+nextPickups.garbage.date === +nextPickups.recycling.date) {
    // event should be joined
    if (!garbageIsOnCalendar) {
      eventsToCreate.push({
        summary: 'garbage + recycling',
        description: 'Pull the garbage and recycling to the curb',
        date: nextPickups.garbage.date,
        timeZone
      })
    }
  } else {
    if (!garbageIsOnCalendar) {
      eventsToCreate.push({
        summary: 'garbage',
        description: 'Pull the garbage to the curb',
        date: nextPickups.garbage.date,
        timeZone
      })
    }
    if (!recyclingIsOnCalendar) {
      eventsToCreate.push({
        summary: 'recycling',
        description: 'Pull the recycling to the curb',
        date: nextPickups.recycling.date,
        timeZone
      })
    }
  }
  return eventsToCreate
}

function checkIsOnCalendar (events, pickupDates, key) {
  return !!events.find(({ summary, start, end }) => {
    if (summary.indexOf(key) >= 0) {
      return new Date(start.dateTime) <= pickupDates[key].date && pickupDates[key].date <= new Date(end.dateTime)
    }
  })
}

async function insertMissingEvents(calendar, id, events) {
  const HOUR = 1000 * 60 * 60
  await Promise.all(events.map(async ({ 
    summary, 
    date, 
    timeZone,
    description
  }) => {
    const start = new Date(adjustTimezone(+date - (6 * HOUR)))
    const end = new Date(adjustTimezone(+date + (9 * HOUR)))
    const payload = {
      calendarId: id,
      resource: {
        summary,
        description,
        start: {
          dateTime: start.toISOString(),
          timeZone
        },
        end: {
          dateTime: end.toISOString(),
          timeZone
        }
      }
    }
    loggers.fillCalendar(payload)
    return calendar.events.insert(payload)
  }))
}

function adjustTimezone (d) {
  return new Date(+d + ((new Date()).getTimezoneOffset()) * 60)
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function listCalendars(calendar) {
  return new Promise((resolve, reject) => {
    calendar.calendarList.list({}, (err, res) => {
      if (err) return reject(err)
      resolve(res.data)
    })
  })
}

function getCalendar(calendar, calendarId) {
  return new Promise((resolve, reject) => {
    calendar.calendars.get({
      calendarId
    }, (err, res) => {
      if (err) return reject(err)
      resolve(res.data)
    })
  })
}

function listEvents(calendar, id) {
  return new Promise((resolve, reject) => {
    calendar.events.list({
      calendarId: id,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) {
        loggers.fillCalendar('The API returned an error: ' + err)
        return reject(err)
      }
      resolve(res.data)
    })
  })
}

function findGarbageCalendar(calendars) {
  return calendars.find(({ summary }) => summary.toLowerCase().indexOf('garbage') >= 0)
}
