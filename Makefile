.PHONY: all build clean release

VERSION=latest

all: build

build: node_modules lambda.zip

clean:
	rm -rf node_modules lambda.zip

release: build
	# lambda regions: https://docs.aws.amazon.com/general/latest/gr/rande.html#lambda_region
	for region in us-east-1 us-west-2 eu-west-1 ap-northeast-1; do \
		aws s3 cp lambda.zip s3://convox-$$region/release/$(VERSION)/formation.zip --acl public-read; \
	done
	aws s3 cp lambda.zip s3://convox/release/$(VERSION)/formation.zip --acl public-read
ifeq ($(LATEST),yes)
	for region in us-east-1 us-west-2 eu-west-1 ap-northeast-1; do \
		aws s3 cp lambda.zip s3://convox-$$region/release/latest/formation.zip  --acl public-read; \
	done
	aws s3 cp lambda.zip s3://convox/release/latest/formation.zip  --acl public-read
endif

node_modules:
	npm install winston-papertrail

lambda.zip: index.js node_modules
	zip -r lambda.zip index.js node_modules
