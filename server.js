// npm i --save body-parser connect cookie-session lodash mustache serve-static expand-home-dir

const fs = require('fs');
const http = require('http');
const path = require('path');

const bodyParser = require('body-parser');
const connect = require('connect');
const cookieSession = require('cookie-session')
const lodash = require('lodash');
const mustache = require('mustache');
const serveStatic = require('serve-static');
const expand_home_dir = require('expand-home-dir')


const PORT = (process.argv[2] ? parseInt(process.argv[2]) : 3023)

function timestamped_log() {
  console.log(`${new Date()}:`, Array.prototype.slice.call(arguments).join(' '))
}

const app = connect();

app.use(cookieSession({keys: ['auth_token']}));
app.use(bodyParser.urlencoded({extended: false}));

function render_page(req, res, page, page_data) {
  const template_html = fs.readFileSync(`page_templates/${page}.html`, 'utf8')
  const response_string = mustache.render(template_html, page_data)
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(response_string)
}

// respond to all requests

let form_responses = []
const DATABASE_PATH = expand_home_dir('~/my_database.json')
if(fs.existsSync(DATABASE_PATH)) {
  const responses_json = fs.readFileSync(DATABASE_PATH, 'utf8')
  form_responses = JSON.parse(responses_json)
}

app.use(function(req, res, next) {
  const ip_address = req.connection.remoteAddress
  timestamped_log(`${new Date().toUTCString()} request from: ${ip_address}, ${req.url}`)
  const url = req.url.split('?')[0]

  if(url == '/')
    render_page(req, res, 'index', {})
  else {
    // static file
    next()
    return
  }
});

// refer to assets in this url by their path relative to static; e.g. static/graph.png -> graph.png
const static = serveStatic('static')
app.use(function(req, res, next) {
  static(req, res, next)
})

timestamped_log(`listening on port ${PORT}...`)
http.createServer(app).listen(PORT)


// Run with auto restart on change:
// nodemon server.js

// Run with debugger:
// node --inspect-brk server.js