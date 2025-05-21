FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/Gateway /app/dist/apps/Gateway

CMD ["sh", "-c", "node dist/apps/Gateway/main.js"]
