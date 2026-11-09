# KAEMA RÉNO & DESIGN

Application web de présentation des prestations de rénovation et de design d'intérieur à Yaoundé. Le frontend est réalisé avec React, TypeScript et Vite; l'API dédiée est dans [`backend/`](backend/README.md) et utilise Bun, ElysiaJS, Prisma et PostgreSQL. La connexion admin est raccordée à l'API.

## Frontend

```sh
bun install
bun run dev
```

## API

Copier `.env.example` vers `.env` à la racine pour régler `VITE_API_URL`, puis voir [`backend/README.md`](backend/README.md) pour la configuration PostgreSQL, les secrets, le démarrage et les routes métier.

Les parcours rendez-vous, compte client, suggestions, chat, commandes showroom, gestion admin et galerie images/vidéos sont reliés à l'API. FFmpeg convertit les formats vidéo importés en MP4 lisible dans les navigateurs; les vidéos sont ensuite servies en streaming par segments. Installer FFmpeg sur le serveur API.

## Déploiement

- Le frontend est une application statique Vite à publier sur Cloudflare Pages; `public/_redirects` active le routage SPA. Utiliser `bun install --frozen-lockfile`, `bun run build`, le dossier de sortie `dist`, et définir `VITE_API_URL` à l'URL publique de l'API avant le build.
- L'API se construit depuis `backend/Dockerfile`; l'image embarque Bun et FFmpeg et applique les migrations Prisma au démarrage.
- Fournir les variables de `backend/.env.example` dans l'hébergeur. Les médias doivent vivre sur un volume persistant monté au chemin `backend/uploads` (ou être migrés vers un stockage objet) : le disque temporaire d'un conteneur ne conserve pas les fichiers après remplacement.
- Après avoir créé le compte administrateur initial, utiliser les migrations et scripts de seed documentés dans `backend/README.md`; ne pas conserver le mot de passe d'exemple.
