const { connect } = require('./redis')
module.exports = {
  read,
  write
}

async function read(key) {
  const client = await connect()
  const readValue = await client.getAsync(key)
  const value = readValue || ''
  if (!value.length) {
    return ''
  }
  return value
}

async function write(key, value, options = []) {
  const client = await connect()
  await client.setAsync([key, value].concat(options))
}
