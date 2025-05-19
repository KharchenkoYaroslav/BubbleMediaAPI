FROM node:20.17.0-alpine

WORKDIR /app

# Копіюємо файли з кореня проєкту до робочої директорії контейнера
COPY nx.json .
COPY tsconfig.base.json .
COPY package.json .
COPY package-lock.json .
COPY eslint.config.mjs .

# Копіюємо файли конкретного сервісу з кореня контексту збірки
COPY apps/AuthService /app/apps/AuthService

RUN npm install

# Збираємо конкретний сервіс
RUN npx nx build AuthService  --no-cache

# Запускаємо зібраний сервіс
CMD ["sh", "-c", "node dist/apps/AuthService/main.js"]
