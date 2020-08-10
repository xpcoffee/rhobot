FROM node:12
WORKDIR /usr/src/app

# Copy project into image
# TODO: only copy built source and dependencies (ideally bundled)
COPY . .
RUN npm install
RUN npm run build

CMD ["node", "dist"]
