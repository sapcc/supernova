
FROM keppel.eu-de-1.cloud.sap/ccloud-dockerhub-mirror/library/node:18-alpine as base

LABEL source_repository="https://github.com/sapcc/supernova"

ENV NODE_OPTIONS="--openssl-legacy-provider"

RUN apk --no-cache add ca-certificates

RUN mkdir -p /home/app/webapp
WORKDIR /home/app/webapp
ADD . /home/app/webapp

# install dependencies dev and prod
RUN npm install 
# build the app
RUN npm run build 

# Production image
ENV NODE_ENV="production" 
# remove dev dependencies
RUN npm prune --production

CMD npm run production
