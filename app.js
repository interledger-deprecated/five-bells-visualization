'use strict'

const app = require('koa')()
const serve = require('koa-static')
const route = require('koa-route')
const path = require('path')
const co = require('co')
const log = require('./services/log')
const logger = require('koa-mag')
const errorHandler = require('five-bells-shared/middlewares/error-handler')
const payments = require('./controllers/payments')
const config = require('./services/config')
const broker = require('./services/broker')
const bodyParser = require('koa-bodyparser')
const crawler = require('./services/crawler')
const subscriber = require('./services/subscriber')
const receivers = require('./services/receivers')

app.use(logger())
app.use(errorHandler({log: log('error-handler')}))

app.use(serve(path.join(__dirname, 'public')))
app.use(bodyParser())

app.use(route.put('/payments', payments.put))

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

broker.setBroadcaster(io)

subscriber.on('notification', function (notification) {
  // We don't need these to be persistent, so we bypass the broker
  io.emit('event', {
    type: 'notification',
    detail: notification
  })
})

if (!module.parent) {
  co(function * () {
    server.listen(config.server.port)
    log('app').info('visualizer listening on ' + config.server.bind_ip + ':' +
      config.server.port)
    log('app').info('public at ' + config.server.base_uri)

    for (const ledgerHost in receivers) {
      yield receivers[ledgerHost].listen()
    }

    // Crawl the graph of ledgers and connectors
    yield crawler.crawl(config.ledgers)
  }).catch(function (err) {
    console.error(typeof err === 'object' && err.stack ? err.stack : err)
  })
}
