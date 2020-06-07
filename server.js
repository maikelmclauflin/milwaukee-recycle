const express = require('express')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/oauth2callback', async (req, res, next) => {
  try {
    await fs.promises.writeFile('./code.txt', req.query.code)
    res.json({})
    return ''
  } catch (e) {
    console.log(e)
  }
})
const port = process.env.PORT || 8080
app.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log(`listening: ${port}`)
})
