# Étape 1 : Build de l'app Angular
FROM node:23-alpine AS build
WORKDIR /app

# Mise à jour des packages système pour la sécurité
RUN apk update && apk upgrade && apk add --no-cache dumb-init

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'app
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Mise à jour des packages système pour la sécurité
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copier les fichiers depuis le bon répertoire (Angular 18+)
COPY --from=build /app/dist/admin-angular/browser/ ./
# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Utiliser un utilisateur non-root pour plus de sécurité
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

USER nginx
EXPOSE 80
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]