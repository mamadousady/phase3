# Phase 3- Application de mesure d'ambiance des lieux

## Description du projet

Ce projet consiste à construire une application web iteractive qui consomme une API REST et visualise l'ambiance de lieux publics.
L'application permet aux utilisateurs de:
- Consulter l'ambiance sonore des lieux en temps réel
- Visualiser les lieux sur une carte interactive
- Ajouter des observations sonores
- Filtrer les lieux par type et classification
- Sauvegarder leurs lieux favoris

L'application est construite avec **React** et **Vite**, et utilise **Leaflet** pour la cartographie.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** (version 9 ou supérieure)
- **Git** (pour le versionnement)

#  Fonctionnalités

### Frontend
-  **Filtres avancés** : Filtrer par type de lieu, classification, nombre de mesures
-  **Carte interactive** : Visualisation des lieux avec marqueurs colorés
-  **Statistiques** : Vue d'ensemble des données
-  **Thème sombre/clair** : Support du mode sombre
-  **Cache intégré** : Données mises en cache pour des performances optimales
-  **Responsive** : Interface adaptée à tous les écrans
-  **Persistance des filtres** : Filtres sauvegardés dans l'URL

### Backend
-  **Authentification JWT** : Inscription, connexion, gestion des profils
-  **Cache API** : Mise en cache des requêtes avec NodeCache
-  **Statistiques** : Calcul des moyennes, minima, maxima, écarts-types
-  **CORS** : Configuration sécurisée des origines autorisées
-  **Tests unitaires** : Couverture des services avec Jest


```bash
git clone https://github.com/mamadousady/phase3.git
cd mon-projet2
cd backends
npm install
node server.js
npm install
cd mon-projet2 # dans un autre terminal
npm run dev 
cp .env.example .env
VITE_API_URL= 'http://localhost:3000'
PORT=3000
JWT_SECRET=monSuperSecretJWT123456789
NODE_ENV=development

#Tests 
cd backends
npm test
#Résultat attendu
 
Test Suites: 3 passed, 3 total
Tests:       82 passed, 82 total
Snapshots:   0 total
Time:        5.079 s

```


# Endpoints

| Méthode | Endpoints | Description | Protection |
| GET| /lieux|Liste des lieux avec ambiance|public|
| GET|/lieux/:id|Détails d'un lieu|public|
|GET|/lieux/:id/ambiance|Portrait d'ambiance|public|
|POST|/register|Inscription|public|
|POST|/login|Connexion|public|
|GET|/me|Profil utilisateur|public|
|POST|/|Soumettre une observation|protégé|
|GET|/mes-observations|Obtenir mes observations|protégé|
|GET|/favoris/:lieuId|Ajouter un favori|protégé|

##  Déploiement

### Production URLs

| Service | URL |
|---------|-----|
| **Backend API** | `https://ambiance-api-g97s.onrender.com` |
| **Frontend** | `https://ambiance-frontend.onrender.com` |

### Liens utiles
- [Application en ligne](https://ambiance-frontend.onrender.com)
- [API Documentation](https://ambiance-api-g97s.onrender.com)

### Variables d'environnement

#### Backend (`ambiance-api`)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Chaîne de connexion MongoDB Atlas |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://ambiance-frontend.onrender.com` |

#### Frontend (`ambiance-frontend`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | `https://ambiance-api-g97s.onrender.com` |

### Déploiement sur Render

L'application est déployée sur Render avec la configuration suivante :

1. **Backend** : Web Service Node.js
2. **Frontend** : Web Service avec serveur statique (npx serve)

#### Fichier `render.yaml`

```yaml
services:
  # Backend - API (le serveur est dans Backends/)
  - type: web
    name: ambiance-api
    runtime: node
    buildCommand: |
      cd Backends
      npm install
    startCommand: |
      cd Backends
      node server.js
    healthCheckPath: /
    plan: free
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGINS
        value: https://ambiance-frontend.onrender.com

  # Frontend - React
  - type: web
    name: ambiance-frontend
    runtime: node
    buildCommand: |
      cd frontend
      npm install
      npm run build
    startCommand: |
      cd frontend
      npx serve -s dist -l $PORT
    plan: free
    envVars:
      - key: VITE_API_URL
        value: https://ambiance-api.onrender.com

