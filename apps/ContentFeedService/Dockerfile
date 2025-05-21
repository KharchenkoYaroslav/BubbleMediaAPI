FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/ContentFeedService /app/dist/apps/ContentFeedService

CMD ["sh", "-c", "node dist/apps/ContentFeedService/main.js"]
