FROM node:lts-alpine

WORKDIR /app

COPY server/ server/

COPY package*.json ./
COPY client/ client/

COPY server/package*.json server/

COPY client/package*.json client/

USER node

RUN npm run install-client --only=production

RUN echo "Welcome to"

RUN npm run install-server --only=production

RUN npm run client-build --prefix client

CMD [ "npm", "start", "--prefix", "server" ]

EXPOSE 8000