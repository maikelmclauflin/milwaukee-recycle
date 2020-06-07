const cheerio = require('cheerio')
const { v5: uuidV5 } = require('uuid')
const request = require('request-promise-native')
const parser = require('parse-address')
const parsers = {
  milwaukee: milwaukeeParseAndSubmit
}
module.exports = main

async function main(city, address) {
  const parser = parsers[city.toLowerCase()]
  return parser(city, address)
}

async function milwaukeeParseAndSubmit(city, address) {
  const parsed = parser.parseLocation(address)
  const payload = {
    laddr: parsed.number,
    sdir: parsed.prefix.toUpperCase(),
    sname: parsed.street.toUpperCase(),
    stype: parsed.type.toUpperCase()
  }
  return milwaukeeSubmit(city, payload)
}
  
async function milwaukeeSubmit(city, payload) {
  const url = 'https://itmdapps.milwaukee.gov/DpwServletsPublic/garbage_day?embed=Y'
  const res = await request.post(url).form(payload)
  const $ = cheerio.load(res)
  const $header = $('h2')
  const $1header = $header.eq(0)
  const $1headerStrongs = $1header.nextAll('strong')
  const $2header = $header.eq(1)
  const $2headerStrongs = $2header.nextAll('strong')
  const garbageID = $1headerStrongs.eq(0).text()
  const recyclingID = $2headerStrongs.eq(0).text()
  let garbageDate = $1headerStrongs.eq(1).text()
  let recyclingDate = $2headerStrongs.eq(1).text()
  garbageDate = garbageDate.split(' ').slice(1).join(' ')
  recyclingDate = recyclingDate.split(' ').slice(1).join(' ')
  console.log(`
GARBAGE  \tID: ${garbageID}\tDATE: ${garbageDate}
RECYCLING\tID: ${recyclingID}\tDATE: ${recyclingDate}`)
  return {
    id: uuidV5(JSON.stringify(payload), '05e2b50f-d55a-4a52-83bc-012f11efcb41'),
    city,
    address: payload,
    garbage: new Date(garbageDate),
    recycling: new Date(recyclingDate)
  }
}
