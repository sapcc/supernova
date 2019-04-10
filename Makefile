IMAGE := sapcc/supernova
TEST-IMAGE := hub.global.cloud.sap/monsoon/nodebuild
DATE     := $(shell date +%Y%m%d%H%M%S)
VERSION  ?= v$(DATE)
UNIT-VERSION := 11.12
BUILD_ARGS = --build-arg VERSION=$(VERSION)

.PHONY: build, start, unit-test, integration-test, font-awesome-file, build-test, push-test

build:
	docker build $(BUILD_ARGS) -t $(IMAGE):$(VERSION) -t $(IMAGE):latest .

start:
	docker run -p 80:80 -t -i $(IMAGE):latest

unit-test:
	yarn --dev && CI=true yarn test

integration-test:
	yarn link puppeteer && yarn --dev && yarn integration

build-test:
	docker build -t $(TEST-IMAGE):$(UNIT-VERSION) -f ./docker/Dockerfile.test .

push-test:
	docker push $(TEST-IMAGE):$(UNIT-VERSION)

