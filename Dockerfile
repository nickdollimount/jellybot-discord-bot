FROM node:21.3.0

ENV PATH="/usr/bin/jellyfin/config:${PATH}"

# Copy Jellybot files
RUN mkdir /usr/bin/jellybot
COPY node_modules/ /usr/bin/jellybot/node_modules
COPY slashcommands/ /usr/bin/jellybot/slashcommands
COPY main.js /usr/bin/jellybot
COPY package.json /usr/bin/jellybot
COPY package-lock.json /usr/bin/jellybot
COPY README.md /usr/bin/jellybot
COPY stringsResource.json /usr/bin/jellybot

RUN mkdir /usr/bin/jellybot/config
#RUN touch /usr/bin/jellybot/config/config.json
COPY config/config.json /usr/bin/jellybot/config

# Run the Jellybot Node application
RUN node /usr/bin/jellybot/main.js

