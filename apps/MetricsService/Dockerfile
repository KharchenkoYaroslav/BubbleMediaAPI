FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/MetricsService /app/dist/apps/MetricsService

CMD ["sh", "-c", "node dist/apps/MetricsService/main.js"]
