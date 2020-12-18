FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Copy project into image
# TODO: only copy built source and dependencies (ideally bundled)
COPY . .
RUN npm run build
CMD ["node", "dist"]
