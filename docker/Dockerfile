FROM keppel.eu-de-1.cloud.sap/ccloud-dockerhub-mirror/library/node:14-alpine

LABEL source_repository="https://github.com/sapcc/supernova"

RUN apk --no-cache add git ca-certificates make
RUN npm install -g serve

ADD . /home/app/webapp
WORKDIR /home/app/webapp

RUN yarn

CMD yarn build && yarn production
