# convox/papertrail

Send Kinesis events to Papertrail via a Lambda function.

## Development

```bash
$ make
npm install rollbar winston winston-papertrail
...

zip -r lambda.zip index.js node_modules
updating: index.js (deflated 44%)
updating: node_modules/ (stored 0%)
updating: node_modules/winston/ (stored 0%)
...

$ AWS_DEFAULT_PROFILE=release make release
aws s3 cp lambda.zip s3://convox/lambda/papertrail.zip  --acl public-read
upload: ./lambda.zip to s3://convox/lambda/papertrail.zip
```

## Updating a production user

Once you've released the function, it will become the default for all new users.

If you need to update a exisiting lambda function, use a url of the form:

*https://s3.amazonaws.com/convox-us-east-1/lambda/papertrail.zip*

## Design

This Lambda function package is used in conjunction with the `convox services`
commands:

```bash
$ convox services create papertrail pt
$ convox services link pt --app myapp
```

It is intended to be configured and installed via CloudFormation.

The handler introspects a CloudFormation stack matching the Lambda function
name to find the Papertrail URL Parameter. It takes advantage of
[container reuse](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)
and saves this setting on the /tmp file system to avoid excessive
CloudFormation Describe Stack API calls.

When the function has an EventSourceMapping (`convox services link`), it is
invoked with Kinesis events which are sent to Papertrail over syslog via the
[Winston](https://github.com/winstonjs/winston) library.

![Architecture](https://github.com/convox/papertrail/raw/master/architecture.png "Architecture")

## Contributing

* Open a [GitHub Issue](https://github.com/convox/papertrail/issues/new) for bugs and feature requests
* Initiate a [GitHub Pull Request](https://help.github.com/articles/using-pull-requests/) for patches

### Test Event

```json
{
  "Records": [
    {
      "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
      "eventVersion": "1.0",
      "kinesis": {
        "partitionKey": "partitionKey-3",
        "data": "d2ViOiBoZWxsbywgd29ybGQh",
        "kinesisSchemaVersion": "1.0",
        "sequenceNumber": "49545115243490985018280067714973144582180062593244200961"
      },
      "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
      "eventName": "aws:kinesis:record",
      "eventSourceARN": "arn:aws:kinesis:us-east-1:901416387788:stream/myapp-staging-Kinesis-L6MUKT1VH451",
      "eventSource": "aws:kinesis",
      "awsRegion": "us-east-1"
    }
  ]
}
```

## See Also

* [convox/rack](https://github.com/convox/rack)

## License

Apache 2.0 &copy; 2015 Convox, Inc.
