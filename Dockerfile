FROM node:lts-alpine

# npm build dependencies
RUN apk add --no-cache python3 make g++

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install --save-dev

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

ARG API_URL
ARG ENCRYPT_KEY

ENV VUE_APP_API_URL $API_URL
ENV ENCRYPT_KEY $ENCRYPT_KEY

# build app for production with minification
RUN npm run build

RUN rm -fr node_modules
RUN rm -fr assets
RUN rm -fr public
RUN rm -fr src
RUN rm -fr tests

EXPOSE 8080
CMD [ "http-server", "dist" ]
