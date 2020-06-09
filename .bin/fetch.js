#!/usr/bin/env node
const { argv } = require('yargs')
const fetch = require('../fetch')
main().catch(console.error)

async function main() {
  await fetch(argv.address)
}
