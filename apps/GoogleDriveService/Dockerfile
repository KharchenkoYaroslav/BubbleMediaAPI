FROM node:20.17.0-alpine

WORKDIR /app

COPY nx.json .
COPY tsconfig.base.json .
COPY package.json .
COPY package-lock.json .
COPY eslint.config.mjs .

COPY apps/GoogleDriveService /app/apps/GoogleDriveService

RUN npm install

RUN npx nx build GoogleDriveService  --no-cache

CMD ["sh", "-c", "node dist/apps/GoogleDriveService/main.js"]
