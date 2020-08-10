FROM node:12
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm run build

# Copy project into image
# TODO: only copy built source and dependencies (ideally bundled)
COPY . .

CMD ["node", "dist"]
