FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/ContentService /app/dist/apps/ContentService

CMD ["sh", "-c", "node dist/apps/ContentService/main.js"]
