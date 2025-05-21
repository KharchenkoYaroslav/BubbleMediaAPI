FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/ProfileService /app/dist/apps/ProfileService

CMD ["sh", "-c", "node dist/apps/ProfileService/main.js"]
