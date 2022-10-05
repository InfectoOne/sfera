FROM node:18.3.0 AS build-stage
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src
RUN npm ci --quiet && npm run build

FROM node:lts-alpine AS production-stage
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --quiet --only=production
COPY --from=build-stage /usr/src/app/dist ./dist

EXPOSE 4000
CMD ["node", "/app/dist/server.js"]