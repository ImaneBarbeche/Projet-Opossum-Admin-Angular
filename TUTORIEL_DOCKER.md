# Tutoriel Docker pour le projet Admin Angular

Ce guide explique comment utiliser Docker pour lancer et déployer ce projet Angular facilement, sans rien installer d'autre que Docker.

## Prérequis
- Avoir Docker installé sur votre machine ([télécharger ici](https://www.docker.com/products/docker-desktop/))

## 1. Construire l'image Docker

Ouvrez un terminal dans le dossier du projet (là où se trouve le fichier `Dockerfile`) et lancez :

```bash
docker build -t admin-angular .
```

- Cette commande va créer une image Docker nommée `admin-angular`.

## 2. Lancer le conteneur

Toujours dans le terminal, lancez :

```bash
docker run -d -p 8080:80 --name admin-angular-container admin-angular
```

- L'application sera accessible sur [http://localhost:8080](http://localhost:8080)

## 3. Arrêter et supprimer le conteneur

Pour arrêter le conteneur :
```bash
docker stop admin-angular-container
```

Pour le supprimer :
```bash
docker rm admin-angular-container
```

## 4. Mettre à jour l'image après modification du code

1. Arrêtez et supprimez le conteneur existant :
   ```bash
   docker stop admin-angular-container
   docker rm admin-angular-container
   ```
2. Rebuild l'image :
   ```bash
   docker build -t admin-angular .
   ```
3. Relancez le conteneur :
   ```bash
   docker run -d -p 8080:80 --name admin-angular-container admin-angular
   ```

## 5. Vérifier les logs

Pour voir les logs du conteneur (utile en cas de bug) :
```bash
docker logs admin-angular-container
```

## 6. Nettoyer les images inutilisées

```bash
docker image prune -f
```

## 7. Fichiers importants
- `Dockerfile` : instructions pour construire l'image
- `nginx.conf` : configuration du serveur web Nginx pour Angular
- `.dockerignore` : fichiers à ignorer lors du build

---

**Astuce :**
Vous pouvez changer le port local (8080) si besoin, par exemple `-p 3000:80` pour accéder à l'app sur [http://localhost:3000](http://localhost:3000)

---

Pour toute question, contactez l'équipe technique !
