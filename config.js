const {
  NODE_ENV,
  PORT = 8080,
  DEBUG,
  HOST = 'localhost:8080',
  REDIS_URL
} = process.env
const TOKEN_PATH = 'token.json'
const CODE_PATH = 'code.txt'
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
]
module.exports = {
  REDIS_URL,
  PORT,
  HOST,
  NODE_ENV,
  DEBUG,
  // use filepath + scopes to make sure a new one 
  // is created each time scopes change
  TOKEN_PATH: TOKEN_PATH + SCOPES,
  CODE_PATH,
  SCOPES
}
