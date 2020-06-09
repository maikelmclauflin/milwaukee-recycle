const fillCalendar = require('./fill-calendar')
const files = require('./files')
const HOUR = 1000 * 60 * 60
module.exports = main

async function main() {
  const lastBuild = await files.read('last-build')
  const now = new Date()
  if (lastBuild && new Date(+lastBuild) > (now - HOUR)) {
    return
  }
  await fillCalendar(process.env.ADDRESS)
  const choppedTime = now - (now % HOUR)
  await files.write('last-build', choppedTime, ['EX', 600])
}