const fillCalendar = require('./fill-calendar')
const files = require('./files')
const HOUR = 1000 * 60 * 60
module.exports = main

async function main() {
  const lastBuild = await files.read('last-build')
  const now = new Date()
  if (lastBuild) {
    return
  }
  await fillCalendar(process.env.ADDRESS)
  const ttl = Math.round((HOUR - (+now % HOUR)) / 1000)
  await files.write('last-build', now.toISOString(), ['EX', ttl])
}
