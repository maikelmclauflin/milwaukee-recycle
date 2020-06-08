#!/usr/bin/env node
const { argv } = require('yargs')
const fetch = require('../fetch')
main().catch(console.error)

async function main() {
  console.log(await fetch(argv.address))
}
