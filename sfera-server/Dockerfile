# build-stage - compile TypeScript to JavaScript
FROM node:18.3.0 AS build-stage
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
RUN npm install -g typescript

# Bundle app source
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "start-server" ]