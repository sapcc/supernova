FROM node:11.12-alpine

RUN apk --no-cache add git ca-certificates make
RUN npm install -g serve

ADD . /home/app/webapp
WORKDIR /home/app/webapp

RUN yarn

CMD yarn build && serve -s build -l 80
