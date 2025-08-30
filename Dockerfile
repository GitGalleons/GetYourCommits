# Static site Dockerfile (build + serve via nginx)
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /dist /usr/share/nginx/html
# optional: copy a minimal nginx.conf for gzip/CSP headers
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]