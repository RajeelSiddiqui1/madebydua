FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


EXPOSE 5007

CMD ["node","index.js"]