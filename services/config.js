'use strict'

const url = require('url')

const config = exports

config.crawler = {}
config.crawler.initialLedgers = []
config.crawler.initialTraders = []
if (process.env.CRAWLER_INITIAL_LEDGERS) {
  process.env.CRAWLER_INITIAL_LEDGERS.split(';').forEach(function (uri) {
    config.crawler.initialLedgers.push(uri)
  })
}
if (process.env.CRAWLER_INITIAL_TRADERS) {
  process.env.CRAWLER_INITIAL_TRADERS.split(';').forEach(function (uri) {
    config.crawler.initialTraders.push(uri)
  })
}
config.crawler.recrawlInterval = 60000
if (process.env.VISUALIZATION_RECRAWL_INTERVAL) {
  config.crawler.recrawlInterval = parseInt(process.env.VISUALIZATION_RECRAWL_INTERVAL, 10)
}

config.server = {}
config.server.secure = false
config.server.bind_ip = process.env.BIND_IP || '0.0.0.0'
config.server.port = process.env.PORT || 3000
config.server.public_host = process.env.HOSTNAME || require('os').hostname()
config.server.public_port = process.env.PUBLIC_PORT || config.server.port

config.admin = {
  user: process.env.ADMIN_USER,
  pass: process.env.ADMIN_PASS
}
if (!config.admin.user || !config.admin.pass) {
  throw new Error('Missing required configs: ADMIN_{USER,PASS}')
}

if (process.env.NODE_ENV === 'test') {
  config.crawler.initialLedgers.push('localhost:3001')
}

// Calculate base_uri
const isCustomPort = config.server.secure
  ? +config.server.public_port !== 443
  : +config.server.public_port !== 80
config.server.base_uri = url.format({
  protocol: 'http' + (config.server.secure ? 's' : ''),
  hostname: config.server.public_host,
  port: isCustomPort ? config.server.public_port : undefined
})
