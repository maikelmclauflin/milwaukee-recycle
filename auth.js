const files = require('./files')
const { google } = require('googleapis')
const { timeout } = require('./utils')
const { loggers } = require('./debug')

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const {
  SCOPES,
  TOKEN_PATH,
  CODE_PATH,
} = require('./config')

module.exports = auth

async function auth() {
  const creds = await readCredentials()
  const auth = createClient(creds)
  await authorize(auth)
  return auth
}

async function readCredentials() {
  // Load client secrets from a local file.
  // const file = await files.read('credentials.json')
  return JSON.parse(process.env.CREDENTIALS)
}

function createClient(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.web
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0])
  return oAuth2Client
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(oAuth2Client) {
  // Check if we have previously stored a token.
  try {
    const token = JSON.parse(await files.read(TOKEN_PATH))
    oAuth2Client.setCredentials(token)
  } catch (e) {
    await getAccessToken(oAuth2Client)
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  let code
  while (!code) {
    await timeout(1000)
    try {
      const file = await files.read(CODE_PATH)
      code = file
    } catch (e) {}
  }
  return new Promise((resolve, reject) => {
    oAuth2Client.getToken(code, async (err, token) => {
      if (err) {
        loggers.auth({ message: 'Error retrieving access token', err })
        return reject(err)
      }
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      try {
        await files.write(TOKEN_PATH, JSON.stringify(token))
        loggers.auth(`Token stored to ${TOKEN_PATH}`)
        resolve()
      } catch (err) {
        loggers.auth(err)
        reject(err)
      }
    })
  })
}
