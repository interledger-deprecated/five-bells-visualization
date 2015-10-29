'use strict'

const app = require('koa')()
const serve = require('koa-static')
const route = require('koa-route')
const co = require('co')
const defer = require('co-defer')
const log = require('./services/log')
const logger = require('koa-mag')
const errorHandler = require('@ripple/five-bells-shared/middlewares/error-handler')
const notifications = require('./controllers/notifications')
const quote = require('./controllers/quote')
const payments = require('./controllers/payments')
const ledgers = require('./controllers/ledgers')
const config = require('./services/config')
const pathfinder = require('./services/pathfinder')
const broker = require('./services/broker')
const bodyParser = require('koa-bodyparser')
// const crawler = require('./services/crawler')
// const broker = require('./services/broker')

app.use(logger())
app.use(errorHandler({log: log('error-handler')}))

app.use(serve(__dirname + '/public'))
app.use(bodyParser())

app.use(route.post('/notifications', notifications.post))

app.use(route.get('/quote', quote.get))
app.use(route.put('/payments', payments.put))

app.use(route.get('/ledgers', ledgers.list))

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

broker.setBroadcaster(io)

notifications.on('notification', function (notification) {
  // We don't need these to be persistent, so we bypass the broker
  io.emit('event', {
    type: 'notification',
    detail: notification
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

    // Crawl the graph of ledgers and connectors
    yield pathfinder.crawl()
    defer.setInterval(pathfinder.crawl, config.crawler.recrawlInterval)
  }).catch(function (err) {
    console.error(typeof err === 'object' && err.stack ? err.stack : err)
  })
}
