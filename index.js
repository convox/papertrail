var aws = require('aws-sdk')
var cf = new aws.CloudFormation()
var fs = require('fs')
var rollbar = require("rollbar")
var winston = require('winston')
require('winston-papertrail').Papertrail

function logRecords(url, event, context) {
  // get app name from Kinesis record
  // e.g. arn:aws:kinesis:us-east-1:901416387788:stream/convox-Kinesis-L6MUKT1VH451 -> convox
  var appName = "unknown"

  var parts = event.Records[0].eventSourceARN.split("/")
  if (parts.length == 2) {
    appName = parts[1].split("-")[0]
  }

  // connect to Papertrail
  var tr = new winston.transports.Papertrail({
    host: url.split(":")[0],
    port: url.split(":")[1],
    hostname: appName,
    program: 'default',
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

  tr.on('error', function(err) {
    context.fail(err)
  })
}

exports.handler = function(event, context) {
  rollbar.init("f67f25b8a9024d5690f997bd86bf14b0", { environment: "lambda" })

  // check /tmp/url for cached Papertrail URL
  fs.readFile('/tmp/url', function (err, url) {
    if (!err) {
      return logRecords(url.toString(), event, context)
    }

    // get stack name from Lambda function name
    // e.g. my-cool-app-PapertrailLogger-Y1HBW4I1TMB7 -> my-cool-app
    var parts = process.env.AWS_LAMBDA_FUNCTION_NAME.split("-")
    var stackName = parts.slice(0,-2).join("-") // drop PapertrailLogger-YXXX

    cf.describeStacks({ StackName: stackName }, function(err, data) {
      if (err) {
        rollbar.handleError(err)
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

      fs.writeFileSync('/tmp/url', url)

      logRecords(url, event, context)
    })
  })
}
