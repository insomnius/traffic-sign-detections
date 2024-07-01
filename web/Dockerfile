FROM node:18-alpine AS base

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
