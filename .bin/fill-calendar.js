#!/usr/bin/env node
const { argv } = require('yargs')
const fillCalendar = require('../fill-calendar')
main().catch(console.error)

async function main() {
  await fillCalendar(argv)
}
