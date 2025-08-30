FROM node:18
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
EXPOSE 3000
CMD ["node", "index.js"]