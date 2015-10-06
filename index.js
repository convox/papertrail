var aws = require('aws-sdk')
var cf = new aws.CloudFormation()

var winston = require('winston')
require('winston-papertrail').Papertrail

exports.handler = function(event, context) {
  // get app name from Kinesis record
  var appName = "unknown"

  var parts = event.Records[0].eventSourceARN.split("/")
  if (parts.length == 2) {
    appName = parts[1]
  }

  // get stack name from Lambda function name
  // e.g. papertrail-PapertrailLogger-Y1HBW4I1TMB7 -> papertrail
  var stackName = process.env.AWS_LAMBDA_FUNCTION_NAME.split("-")[0]

  cf.describeStacks({ StackName: stackName }, function(err, data) {
    if (err) {
      console.log(err, err.stack)
      return context.fail(err)
    }

    // get URL, host, port from stack parameters
    var url = ""

    var stack = data.Stacks[0]
    for (var i = 0; i < stack.Parameters.length; i++) {
      p = stack.Parameters[i]

      if (p.ParameterKey == "Url") {
        url = p.ParameterValue
        break
      }
    }

    if (!url) {
      return context.fail(Error("stack " + stackName + " is missing Url parameter"))
    }

    // connect to Papertrail
    var tr = new winston.transports.Papertrail({
      host: url.split(":")[0],
      port: url.split(":")[1],
      hostname: appName,
      program: 'process',
      showLevel: false,
    })

    var logger = new winston.Logger({ transports: [tr] })

    // log every kinesis record to Papertrail
    tr.on('connect', function() {
      event.Records.forEach(function(record) {
        var payload = new Buffer(record.kinesis.data, 'base64').toString('ascii')
        logger.info(payload)
      })

      tr.close()

      context.done(null)
    })
  });
}
