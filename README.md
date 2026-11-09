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

- Le frontend est une application statique Vite à publier sur Netlify; `netlify.toml` règle le build et `public/_redirects` active le routage SPA. Définir `VITE_API_URL` avec l'URL publique de l'API dans les variables de l'hébergeur avant le build.
- L'API se construit depuis `backend/Dockerfile`; le blueprint `render.yaml` configure Render Free, l'image embarque Bun et FFmpeg et applique les migrations Prisma au démarrage.
- Le service Render gratuit utilise un disque temporaire. Les images et vidéos sont donc envoyées vers le stockage objet Tigris avec les variables S3 de `backend/.env.example`; la base ne conserve que leur chemin. La conversion FFmpeg et le streaming HTTP Range restent assurés par l'API.
- Après avoir créé le compte administrateur initial, utiliser les migrations et scripts de seed documentés dans `backend/README.md`; ne pas conserver le mot de passe d'exemple.
