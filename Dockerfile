FROM node:12 as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:12
WORKDIR /usr/src/app
COPY --from=build /app/dist .
CMD ["node", "index.js"]
