FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/AuthService /app/dist/apps/AuthService

CMD ["sh", "-c", "node dist/apps/AuthService/main.js"]
