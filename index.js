var winston = require('winston')
require('winston-papertrail').Papertrail

var tr = new winston.transports.Papertrail({
    host: 'X.papertrailapp.com',
    port: 1234,
    hostname: 'app',
    program: 'process',
    showLevel: false,
})
var logger = new winston.Logger({ transports: [tr] })

exports.handler = function(event, context) {
  tr.on('connect', function() {
    event.Records.forEach(function(record) {
      var payload = new Buffer(record.kinesis.data, 'base64').toString('ascii')

      // save on log storage by filtering out status checks
      if (payload.lastIndexOf('kernel: ns=kernel at=request state=success status=200 method="GET" path="/check"', 0) === 0)
        return

      logger.info(payload)
    })
    tr.close()
    context.done(null)
  })
}
