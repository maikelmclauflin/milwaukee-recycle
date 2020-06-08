const {
  NODE_ENV
} = require('./config')
const Debug = require('debug')
const debug = new Debug('bat-ratios')
debug('environment', NODE_ENV)
const redis = debug.extend('redis')
const fillCalendar = debug.extend('fill-calendar')
const fetch = debug.extend('fetch')
const auth = debug.extend('auth')
const handling = debug.extend('handling')
const loggers = {
  redis,
  auth,
  fetch,
  handling,
  fillCalendar
}

module.exports = {
  log: debug,
  loggers,
  handlingResponse,
  handlingRequest
}

function handlingRequest (req) {
  const {
    route,
    info,
    originalUrl: url,
    method,
    params,
    query
  } = req
  handling('%o', {
    info,
    url,
    method,
    match: route && route.path,
    params,
    query
  })
}

function handlingResponse (progress, req, res) {
  const {
    info
  } = req
  handling('%o', {
    progress,
    info,
    status: res.statusCode
  })
}
