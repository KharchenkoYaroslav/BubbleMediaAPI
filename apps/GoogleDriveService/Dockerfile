FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/GoogleDriveService /app/dist/apps/GoogleDriveService

CMD ["sh", "-c", "node dist/apps/GoogleDriveService/main.js"]
