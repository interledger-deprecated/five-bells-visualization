'use strict'

const url = require('url')
const crypto = require('crypto')

const config = exports

config.ledgers = JSON.parse(process.env.VISUALIZATION_LEDGERS || '{}')
if (typeof config.ledgers !== 'object' || !Object.keys(config.ledgers).length) {
  throw new Error('Missing required config: VISUALIZATION_LEDGERS')
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

// Calculate base_uri
const isCustomPort = config.server.secure
  ? +config.server.public_port !== 443
  : +config.server.public_port !== 80
config.server.base_uri = url.format({
  protocol: 'http' + (config.server.secure ? 's' : ''),
  hostname: config.server.public_host,
  port: isCustomPort ? config.server.public_port : undefined
})

config.receiver = {}
config.receiver.secret = process.env.VISUALIZATION_RECEIVER_SECRET ||
  crypto.randomBytes(32).toString('base64')
