FROM node:8

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  graphicsmagick \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm install --only=production

COPY . .

# Bundle app source

COPY ./docker/start.sh /usr/src/app
RUN chmod +x start.sh

EXPOSE 4000

CMD [ "./start.sh" ]
