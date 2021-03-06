const express = require('express')
const request = require('request')
const files = require('./files')
const { loggers } = require('./debug')
const { CODE_PATH, PORT, HOST } = require('./config')
const app = express()
const bodyParser = require('body-parser')
const build = require('./build')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/wake-up', (req, res, next) => res.send('.'))
app.use('/oauth2callback', async (req, res, next) => {
  await files.write(CODE_PATH, req.query.code)
  res.send('you can close this window. app has completed authenticatication')
  return ''
})
app.listen(PORT, (err) => {
  if (err) {
    return console.error(err)
  }
  loggers.server(`listening: ${PORT}`)
  worker()
  setInterval(worker, 30000)
})

async function worker() {
  const url = `${HOST}/wake-up`
  await request.get(url)
  build()
}
