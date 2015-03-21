'use strict';

const app = require('koa')();
const serve = require('koa-static');
const cs = require('co-stream');
const byline = require('byline');
const stripAnsi = require('strip-ansi');

const log = [];

app.use(serve(__dirname));

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

byline(process.stdin).pipe(cs.each(function *(line) {
  line = line.toString('utf-8');
  console.log(line);
  line = stripAnsi(line);
  log.push(line);
  io.emit('line', line);
}));

io.on('connection', function (socket) {
  for (let line of log) {
    socket.emit('line', line);
  }
});

server.listen(3000);
