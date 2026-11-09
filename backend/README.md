# KAEMA API

API REST Bun, ElysiaJS et PostgreSQL/Prisma pour les comptes, demandes de rendez-vous, showroom, commandes, suggestions et messagerie.

## Démarrage local

Prérequis : Bun 1.3+, Docker Compose, une base PostgreSQL et FFmpeg installé sur le serveur API (`ffmpeg` dans le `PATH`, ou chemin absolu dans `FFMPEG_PATH`). Sur Debian/Ubuntu, installer le paquet système `ffmpeg`.

```sh
cd backend
cp .env.example .env
# Remplacer JWT_SECRET et ADMIN_PASSWORD par des valeurs privées.
docker compose up -d postgres
bun install
bun run db:generate
bun run db:migrate --name init
bun run db:seed
bun run dev
```

L'API écoute sur `http://localhost:3001`. L'interface OpenAPI est disponible à `/openapi`. Le client Vite tourne par défaut sur `http://localhost:5173`; changer `CORS_ORIGIN` pour une autre origine (liste séparée par des virgules).

## Configuration

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL |
| `JWT_SECRET` | Secret HMAC des jetons, 32 caractères minimum |
| `ADMIN_EMAIL` | Adresse du compte créé par le seed |
| `ADMIN_PASSWORD` | Mot de passe admin du seed, 12 caractères minimum |
| `CORS_ORIGIN` | Origines frontend autorisées |
| `COOKIE_SAME_SITE` | Politique du cookie de renouvellement, défaut `Strict`; `None` exige HTTPS en production |
| `PORT` | Port HTTP, défaut `3001` |
| `PRODUCT_IMAGE_DIR` | Dossier d'images produits; défaut `backend/uploads/products` |
| `GALLERY_MEDIA_DIR` | Dossier des médias galerie; défaut `backend/uploads/gallery` |
| `FFMPEG_PATH` | Chemin du binaire FFmpeg; défaut `ffmpeg` dans le `PATH` |
| `NODE_ENV` | `development` ou `production` |

Ne pas committer `.env`. En production, fournir les secrets via le gestionnaire de secrets de l'hébergeur, imposer HTTPS, limiter l'accès réseau à PostgreSQL et utiliser un stockage externe de limitation de débit à plusieurs instances. Le limiteur embarqué protège le démarrage local et une seule instance; il n'est pas partagé entre serveurs.

## Organisation

- `domain/` : erreurs métier et ports
- `application/` : services d'application, dont authentification
- `infra/http/` : routes Elysia, validation et OpenAPI
- `infra/persistence/` : Prisma/PostgreSQL et seed initial
- `prisma/schema.prisma` : modèle relationnel et contraintes

## Routes principales

Les routes JSON métier sont sous `/api`; les fichiers média sont servis depuis `/uploads`. Les routes protégées attendent `Authorization: Bearer <accessToken>`. Le login renvoie le jeton d'accès (15 min) et place le jeton de renouvellement opaque dans un cookie `HttpOnly` (30 jours); `/auth/refresh` fait tourner et révoque l'ancien jeton. Le navigateur doit envoyer les cookies avec `credentials: "include"`. Les mots de passe sont hachés avec Argon2id.

| Méthode | Route | Accès | Fonction |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Créer un compte client |
| POST | `/auth/login` | Public | Connexion client/admin |
| POST | `/auth/refresh` | Public | Renouveler les jetons |
| POST | `/auth/logout` | Public | Révoquer un jeton de renouvellement |
| GET | `/auth/me` | Connecté | Profil courant |
| POST / GET | `/appointments` | Public / client pour liste | Demande de rendez-vous / liste personnelle |
| GET | `/client/appointments` | Client | Historique personnel des rendez-vous |
| GET | `/showroom/products` | Public | Produits publiés |
| POST | `/showroom/orders` | Public | Demande de commande avec réservation atomique du stock |
| GET | `/gallery` | Public | Images et vidéos publiées |
| POST | `/gallery/:id/view` | Public | Compter une vue d'image ou de vidéo |
| POST | `/gallery/:id/order` | Public | Compter une demande d'intérêt |
| POST | `/admin/uploads/gallery` | Admin | Charger une image (8 Mo max.) ou une vidéo (300 Mo max.; MOV, MP4, AVI, MKV, WebM et formats reconnus par FFmpeg) |
| GET / POST / PATCH / DELETE | `/admin/gallery` | Admin | Gérer les médias, leur publication et leurs compteurs |
| GET | `/uploads/gallery/:filename` | Public | Lire une image ou une vidéo; les vidéos répondent aux requêtes HTTP Range pour le streaming |
| POST | `/admin/uploads/products` | Admin | Enregistrer une image JPEG, PNG, WebP ou AVIF (8 Mo max.) dans `uploads/products/`; l'API renvoie son chemin public à enregistrer avec le produit |
| GET | `/uploads/products/:filename` | Public | Afficher une image du showroom |
| GET / POST | `/suggestions` | Public | Lire / publier une suggestion |
| POST | `/suggestions/:id/vote` | Public | Voter une fois par adresse réseau |
| GET / POST | `/client/chat/messages` | Client ou visiteur | Lire / envoyer un message; les visiteurs sont rattachés à un identifiant aléatoire conservé dans leur navigateur |
| GET | `/admin/dashboard` | Admin | Compteurs du tableau de bord |
| GET / PATCH / DELETE | `/admin/appointments` | Admin | Lister, changer le statut et supprimer |
| GET / POST / PATCH / DELETE | `/admin/products` | Admin | Gérer le showroom |
| GET / PATCH | `/admin/orders` | Admin | Gérer les commandes et leurs transitions |
| GET | `/admin/conversations` | Admin | Voir les conversations |
| POST | `/admin/conversations/:id/messages` | Admin | Répondre dans le chat |
| GET / DELETE | `/admin/suggestions` | Admin | Modérer les suggestions |

Les statuts API utilisent les valeurs enum en majuscules (`PENDING`, `CONFIRMED`, etc.). La création d'une commande décrémente le stock dans une transaction; l'annulation d'une commande non livrée le restitue.

## Intégration frontend

Le frontend utilise `VITE_API_URL` (défaut `http://localhost:3001`). La connexion, les vues admin, les rendez-vous, les suggestions, le chat, le showroom et les commandes utilisent l'API. Les fichiers showroom et galerie sont stockés dans des dossiers dédiés; seules leurs URL de chemin sont enregistrées en base. FFmpeg est requis sur le serveur pour convertir les vidéos importées (jusqu'à 300 Mo) en MP4 H.264/AAC lisible dans les navigateurs; elles sont ensuite servies en streaming HTTP Range. La galerie admin gère les images et vidéos, leur orientation, leur publication, les vues et les demandes. Le frontend garde uniquement le jeton d'accès court dans `sessionStorage`; le jeton de renouvellement reste inaccessible au JavaScript.

Pour exécuter le smoke test contre une API déjà démarrée et une base initialisée : `bun run smoke`. Avec FFmpeg installé, il génère un court AVI, vérifie sa conversion en MP4, puis couvre également les comptes, permissions, rendez-vous, suggestions, chat, showroom et commandes.

## Déploiement

Construire le service en installant les dépendances puis en exécutant `bun run db:generate`, `bun run db:deploy` et `bun run start`. Les migrations doivent être commitées dans `prisma/migrations`; créer la migration initiale avec `bun run db:migrate --name init` pendant le développement.

L'image de production est définie dans `backend/Dockerfile`; elle inclut FFmpeg et exécute `bun run db:deploy` avant le serveur. Le service doit recevoir les variables ci-dessus et un volume persistant couvrant `uploads/products` et `uploads/gallery`. Le build Netlify du frontend a besoin de `VITE_API_URL` défini avec l'URL publique de l'API. Ne pas utiliser de fichiers `.env` ou de contenu du dossier `uploads/` dans les déploiements.
