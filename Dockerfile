ARG NODE_VERSION=21.6

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as prod
ENV NODE_ENV production
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY node_modules ./node_modules
COPY commands ./commands
COPY main.js .
COPY package.json .
COPY package-lock.json .
COPY stringsResource.json .
COPY config ./config
CMD node main.js