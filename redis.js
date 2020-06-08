const redis = require('redis')
const { REDIS_URL } = require('./config')
const { loggers } = require('./debug')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient(REDIS_URL, {
  socket_keepalive: true
})
let connected
 
client.on('error', loggers.redis)

module.exports = {
  redis,
  client,
  connect
}

function connect() {
  if (connected) {
    return connected
  }
  connected = new Promise((resolve, reject) => {
    client.on('ready', () => resolve(client))
    client.on('error', reject)
  })
  return connected
}
