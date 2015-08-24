# convox/papertrail

Send Kinesis events to Papertrail with a Lambda function.

## Development

```bash
$ make
zip -r lambda.zip index.js node_modules
updating: index.js (deflated 44%)
updating: node_modules/ (stored 0%)
updating: node_modules/winston/ (stored 0%)
...
```

* Edit index.js and fill in the host and port of the Papertrail system. Run `make`
* Open the [AWS Lambda Management Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions)
* Click "Create a Lambda Function"
* Click "kinesis-process-record"
* Choose a Kinesis stream, i.e. stream/convox-Kinesis-1XZL3TCU9617V. Leave the other defaults. Click "Next"
* Enter a name, i.e. "kernel-papertrail"
* Click "Upload a .ZIP file", click the "Upload" button, and browse to lambda.zip
* Choose "Kinesis execution role", in the popup window leave the defaults and click "Allow"
* Select "30" for the timeout. Click "Next"
* Click "Enable now". Click "Create function"

## Contributing

* Open a [GitHub Issue](https://github.com/convox/papertrail/issues/new) for bugs and feature requests
* Initiate a [GitHub Pull Request](https://help.github.com/articles/using-pull-requests/) for patches

## See Also

* [convox/app](https://github.com/convox/app)
* [convox/kernel](https://github.com/convox/kernel)

## License

Apache 2.0 &copy; 2015 Convox, Inc.