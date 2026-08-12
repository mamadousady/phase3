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



