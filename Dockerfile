# Étape 1 : Build de l'app Angular
FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'app
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]