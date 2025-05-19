FROM node:20.17.0-alpine

WORKDIR /app

COPY nx.json .
COPY tsconfig.base.json .
COPY package.json .
COPY package-lock.json .
COPY eslint.config.mjs .

COPY apps/MetricsService /app/apps/MetricsService

RUN npm install

RUN npx nx build MetricsService  --no-cache

CMD ["sh", "-c", "node dist/apps/MetricsService/main.js"]
