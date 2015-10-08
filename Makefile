.PHONY: all build clean release

VERSION=latest

all: clean build

build: node_modules lambda.zip

clean:
	rm -rf node_modules lambda.zip

release: build
	aws s3 cp lambda.zip s3://convox/lambda/papertrail.zip  --acl public-read

node_modules:
	npm install rollbar winston winston-papertrail

lambda.zip: index.js node_modules
	zip -r lambda.zip index.js node_modules
