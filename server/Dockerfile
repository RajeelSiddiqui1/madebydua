FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Copy .env file explicitly (needed for Docker build)
COPY .env ./

EXPOSE 5007

CMD ["node","index.js"]