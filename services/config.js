'use strict';

const url = require('url');

const config = exports;

config.crawler = {};
config.crawler.initialNodes = [];
if (process.env.CRAWLER_INITIAL) {
  process.env.CRAWLER_INITIAL.split(';').forEach(function (node) {
    config.crawler.initialNodes.push(node);
  });
}

config.server = {};
config.server.secure = false;
config.server.bind_ip = process.env.BIND_IP || '0.0.0.0';
config.server.port = process.env.PORT || 3000;
config.server.public_host = process.env.HOSTNAME || require('os').hostname();
config.server.public_port = process.env.PUBLIC_PORT || config.server.port;

if (process.env.NODE_ENV === 'test') {
  config.crawler.initialNodes.push('localhost:3001');
}

// Calculate base_uri
const isCustomPort = config.server.secure ?
  +config.server.public_port !== 443 : +config.server.public_port !== 80;
config.server.base_uri = url.format({
  protocol: 'http' + (config.server.secure ? 's' : ''),
  hostname: config.server.public_host,
  port: isCustomPort ? config.server.public_port : undefined
});
