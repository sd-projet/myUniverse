# 🌌 MyUniverse

> Une plateforme web interactive permettant de créer, personnaliser et partager son propre univers.

**MyUniverse** est une application web développée avec Symfony permettant aux utilisateurs de créer leurs propres étoiles et constellations, de les personnaliser visuellement en 3D et de partager leurs créations avec la communauté.

Le projet combine une architecture backend Symfony, une base de données PostgreSQL, une interface interactive basée sur Three.js et un système de partage inspiré des réseaux sociaux.

🔗 **Application en ligne :** https://myuniverse.onrender.com 

---

## ✨ Présentation

MyUniverse propose aux utilisateurs de construire leur propre univers.

Chaque utilisateur peut :

- ⭐ créer ses propres étoiles ;
- 🎨 personnaliser leur apparence ;
- 📐 modifier leur position et leurs propriétés ;
- 🌌 créer des constellations à partir de plusieurs étoiles ;
- 🔗 relier manuellement les étoiles pour créer des formes personnalisées ;
- 🖼️ générer une représentation visuelle de ses créations ;
- 📤 partager ses créations avec les autres utilisateurs ;
- ❤️ interagir avec les publications de la communauté (à venir).

L'objectif est de proposer une expérience à la fois **créative, interactive et sociale**.

---

# 🚀 Fonctionnalités

## ⭐ Création d'étoiles | 🌟 Visualisation 3D avec Three.js

Les utilisateurs peuvent créer leurs propres étoiles et définir différentes propriétés.

---

Les étoiles sont représentées dans une scène 3D grâce à **Three.js**.

La visualisation permet notamment :

- de modifier la position de l'étoile ;
- de manipuler la représentation 3D ;
- de modifier dynamiquement certaines propriétés ;
- de visualiser les créations directement depuis l'interface.

La forme des étoiles est générée avec `THREE.Shape` et `THREE.ExtrudeGeometry`.

---

## 🌌 Création de constellations

Une constellation peut être créée à partir des étoiles appartenant à l'utilisateur.

L'utilisateur peut :

- sélectionner plusieurs étoiles ;
- les positionner dans l'espace ;
- choisir quelles étoiles doivent être reliées ;
- créer des lignes entre les étoiles ;
- déplacer les étoiles tout en conservant les connexions ;
- enregistrer automatiquement les modifications.

Les relations entre les étoiles sont stockées afin de pouvoir reconstruire la constellation ultérieurement.

---


## 📤 Partage des créations

Une fonctionnalité de partage permet à l'utilisateur de sélectionner une de ses créations afin de la publier.

Il peut choisir parmi ses :

⭐ étoiles ;
🌌 constellations.

Une publication contient notamment :

l'utilisateur ayant publié ;
l'œuvre publiée ;
une image représentant l'œuvre ;
une description ;
la date de publication.

L'objectif est de transformer MyUniverse en une petite plateforme communautaire autour de la création d'univers.

## 🏠 Fil d'actualité

La page d'accueil est pensée comme un fil d'actualité inspiré des réseaux sociaux.
Les utilisateurs peuvent ainsi découvrir les créations publiées par les autres membres.


# 🛠️ Stack technique

## Backend

PHP
Symfony
Doctrine ORM
Symfony Security
Symfony Forms
Symfony Routing
Symfony Controllers

## Base de données

PostgreSQL
Doctrine ORM
Neon

## Frontend

Twig
HTML5
CSS3
JavaScript
Three.js
API / communication
Fetch API
JSON
Routes Symfony


## ☁️ Déploiement

L'application est déployée sur **Render**.

La base de données utilise PostgreSQL.


# 🎯 Objectifs techniques du projet

Au-delà de l'aspect créatif, MyUniverse permet de mettre en pratique plusieurs problématiques rencontrées dans le développement d'applications web modernes :

- conception d'une architecture Symfony ;
- modélisation d'une base de données relationnelle ;
- gestion des relations Doctrine ;
- authentification et gestion des utilisateurs ;
- contrôle des droits d'accès ;
- traitement de données JSON ;
- communication frontend/backend avec Fetch ;
- intégration de Three.js ;
- manipulation d'une scène 3D ;
- sauvegarde dynamique des données ;
- génération d'images depuis un canvas WebGL ;
- déploiement d'une application Symfony ;
- utilisation de PostgreSQL en production.

## 🔮 Perspectives d'amélioration

Plusieurs fonctionnalités pourraient être ajoutées afin de faire évoluer MyUniverse vers une véritable plateforme communautaire.

❤️ Interactions sociales
- Likes sur les publications
- Commentaires
- Compteur de vues
- Système de favoris
- Partage des publications

👤 Profils utilisateurs
- Page profil publique
- Avatar
- Présentation personnelle
- Liste des créations
- Liste des publications
- Système d'abonnement entre utilisateurs

🔎 Découverte

- Recherche d'utilisateurs
- Recherche d'étoiles
- Recherche de constellations
- Hashtags
- Catégories
- Filtrage des publications
- Système de recommandations

🌌 Amélioration de l'expérience 3D

- Rotation de la caméra
- Zoom
- Navigation libre dans l'espace
- Meilleure gestion de la profondeur
- Effets lumineux
- Particules
- Animations
- Différents modèles d'étoiles
- Export haute résolution

🖼️ Gestion des médias

- Stockage des images sur un service spécialisé
- Compression automatique
- Génération de miniatures
- Images optimisées pour le fil d'actualité

🔐 Sécurité

- Renforcement des permissions
- Validation avancée des données
- Protection contre les abus
- Système de signalement des publications
- Modération

📱 Responsive / Mobile

- Optimisation complète pour mobile
- Interaction tactile avec Three.js
- Interface adaptée aux petits écrans

# 👩‍💻 À propos

Projet développé par Senebou Diarra, développeuse Full-Stack freelance.

Je développe des applications web sur mesure, du backend au frontend, en passant par la conception de bases de données et le déploiement.

Compétences mises en œuvre dans ce projet : 

- PHP / Symfony
- Doctrine ORM
- PostgreSQL
- JavaScript
- Three.js
- HTML / CSS
- API / AJAX
- Git / GitHub
- Déploiement cloud

---
# 📬 Contact

Pour un projet web, une application sur mesure ou une mission freelance :

Email : seneboudiarrapro@gmail.com 

Développeuse Full-Stack Freelance — Senebou Diarra

Conception, développement et déploiement d'applications web sur mesure.

📄 Licence

Projet personnel.
