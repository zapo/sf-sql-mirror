FROM node:13-stretch AS builder
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm install
COPY . ./

ARG CONFIG_FILE="src/config.json"
COPY ${CONFIG_FILE} ./src/

RUN npm run build

FROM node:13-stretch
WORKDIR /app
RUN mkdir tmp
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package.json /build/package-lock.json ./
RUN npm install --production
CMD ["npm", "start"]
