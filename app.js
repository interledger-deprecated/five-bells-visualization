'use strict'

const app = require('koa')()
const serve = require('koa-static')
const route = require('koa-route')
const co = require('co')
const log = require('@ripple/five-bells-shared/services/log')
const logger = require('koa-mag')
const errorHandler = require('@ripple/five-bells-shared/middlewares/error-handler')
const notifications = require('./controllers/notifications')
const quote = require('./controllers/quote')
const settlements = require('./controllers/settlements')
const ledgers = require('./controllers/ledgers')
const config = require('./services/config')
const crawler = require('./services/crawler')
const broker = require('./services/broker')
require('./services/subscriber')

app.use(logger())
app.use(errorHandler)

app.use(serve(__dirname + '/public'))

app.use(route.post('/notifications', notifications.post))

app.use(route.get('/quote', quote.get))
app.use(route.put('/settlements/:uuid', settlements.put))

app.use(route.get('/ledgers', ledgers.list))

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

broker.setBroadcaster(io)

;['ledger', 'trader', 'user'].forEach(function (type) {
  crawler.on(type, function *(detail) {
    broker.emit({
      type: type,
      detail: detail
    })
  })
})

notifications.on('notification', function (notification) {
  // We don't need these to be persistent, so we bypass the broker
  io.emit('event', {
    type: 'notification',
    detail: notification
  })
})

settlements.on('settlement', function (settlement) {
  io.emit('settlement', {
    type: 'settlement',
    detail: settlement
  })
})
// crawler.on('trader', function (detail) {
//   broker.emit({
//     type: 'trader',
//     detail: detail
//   })
// })

if (!module.parent) {
  co(function *() {
    server.listen(config.server.port)
    log('app').info('visualizer listening on ' + config.server.bind_ip + ':' +
      config.server.port)
    log('app').info('public at ' + config.server.base_uri)

    yield crawler.crawl()
  }).catch(function (err) {
    console.error(typeof err === 'object' && err.stack ? err.stack : err)
  })
}
