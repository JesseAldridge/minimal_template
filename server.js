// npm i --save connect mustache serve-static expand-home-dir

const fs = require('fs');
const http = require('http');
const path = require('path');

const connect = require('connect');
const mustache = require('mustache');
const serveStatic = require('serve-static');
const expand_home_dir = require('expand-home-dir')


const PORT = (process.argv[2] ? parseInt(process.argv[2]) : 3023)

function timestamped_log() {
  console.log(`${new Date()}:`, Array.prototype.slice.call(arguments).join(' '))
}

const app = connect();

function render_page(req, res, page, page_data) {
  const template_html = fs.readFileSync(`page_templates/${page}.html`, 'utf8')
  const response_string = mustache.render(template_html, page_data)
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(response_string)
}

const DATABASE_PATH = expand_home_dir('~/my_database.json')
if(!fs.existsSync(DATABASE_PATH)) {
  fs.writeFileSync(DATABASE_PATH, JSON.stringify([
    {"first_name": "Jesse", "last_name": "Aldridge"},
    {"first_name": "Bob", "last_name": "Ross"},
  ]))
}
const responses_json = fs.readFileSync(DATABASE_PATH, 'utf8')
let form_responses = JSON.parse(responses_json)

app.use(function(req, res, next) {
  const ip_address = req.connection.remoteAddress
  timestamped_log(`${new Date().toUTCString()} request from: ${ip_address}, ${req.url}`)
  const url = req.url.split('?')[0]

  if(url == '/')
    render_page(req, res, 'index', {
      form_responses: JSON.stringify(form_responses),
    })
  else {
    // static file
    next()
    return
  }
});

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