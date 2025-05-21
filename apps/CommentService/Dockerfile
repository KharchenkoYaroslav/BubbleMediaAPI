FROM node:20.17.0-alpine

WORKDIR /app

COPY dist/apps/CommentService /app/dist/apps/CommentService

CMD ["sh", "-c", "node dist/apps/CommentService/main.js"]
