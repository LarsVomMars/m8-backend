FROM node:16-alpine AS builder
RUN apk add --no-cache yarn
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:16-alpine AS host
RUN apk add --no-cache yarn
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --prod
COPY --from=builder /usr/src/app/dist/ ./dist
EXPOSE 5550
ENTRYPOINT [ "node", "./dist/app.js" ]

