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
- ❤️ interagir avec les publications de la communauté.

L'objectif est de proposer une expérience à la fois **créative, interactive et sociale**.

---

# 🚀 Fonctionnalités

## ⭐ Création d'étoiles

Les utilisateurs peuvent créer leurs propres étoiles et définir différentes propriétés :

- Nom
- Description
- Couleur
- Taille
- Luminosité
- Position X / Y / Z
- Date associée
- Modèle 3D éventuel

Chaque étoile est associée à l'utilisateur qui l'a créée.

---

## 🌟 Visualisation 3D avec Three.js

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

## 🔗 Connexion des étoiles

L'utilisateur peut sélectionner deux étoiles successivement afin de créer une connexion entre elles.

Exemple :

```text
⭐ ───── ⭐
 \       /
   ⭐
```
Les connexions sont enregistrées en base de données sous forme de données JSON afin de pouvoir reconstruire la constellation lors de son édition.

💾 Sauvegarde des créations

Les créations sont associées à l'utilisateur connecté.

Les données principales sont stockées dans PostgreSQL.

Les modifications effectuées dans la scène Three.js peuvent également être sauvegardées automatiquement via des requêtes AJAX / Fetch vers Symfony.

📤 Partage des créations

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

🏠 Fil d'actualité

La page d'accueil est pensée comme un fil d'actualité inspiré des réseaux sociaux.

Chaque publication affiche :

┌─────────────────────────────┐
│ 👤 Username                 │
│                             │
│       🖼️ Œuvre              │
│                             │
│ ❤️  💬                      │
│                             │
│ Description de la création  │
└─────────────────────────────┘

Les utilisateurs peuvent ainsi découvrir les créations publiées par les autres membres.

🛠️ Stack technique
Backend
PHP
Symfony
Doctrine ORM
Symfony Security
Symfony Forms
Symfony Routing
Symfony Controllers
Base de données
PostgreSQL
Doctrine ORM
Frontend
Twig
HTML5
CSS3
JavaScript
Three.js
API / communication
Fetch API
JSON
Routes Symfony
Déploiement
Render
PostgreSQL
🗄️ Architecture des données

Les principales entités du projet sont :

User
 │
 ├── Stars
 │
 ├── Constellations
 │
 └── Publications
User

Représente un utilisateur de la plateforme.

Un utilisateur peut posséder plusieurs étoiles et plusieurs constellations.

Stars

Représente une étoile créée par un utilisateur.

Elle contient notamment ses propriétés visuelles et sa position dans l'espace.

Constellations

Représente une constellation créée par un utilisateur.

Une constellation peut être composée de plusieurs étoiles et de plusieurs connexions entre ces étoiles.

Publications

Permet de publier une étoile ou une constellation afin de la rendre visible dans le fil communautaire.

🔐 Gestion des utilisateurs

Les créations sont liées à l'utilisateur actuellement connecté.

Cela permet notamment de :

récupérer uniquement les créations appartenant à l'utilisateur ;
empêcher un utilisateur de modifier les créations d'un autre utilisateur ;
afficher le profil de l'auteur d'une publication ;
associer les publications à leur créateur.
🖼️ Génération des images

Les représentations Three.js peuvent être capturées depuis le canvas WebGL afin de générer une image de l'œuvre.

Cette image peut ensuite être enregistrée sur le serveur et associée à la publication via un champ image_url.

Cela permet de conserver une représentation statique de l'œuvre pour le fil d'actualité.

☁️ Déploiement

L'application est déployée sur Render.

La base de données utilise PostgreSQL.

Architecture actuelle :

                 ┌──────────────┐
                 │    Client    │
                 │ Web Browser  │
                 └──────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Symfony    │
                │   Backend     │
                └───────┬───────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       ┌─────────────┐     ┌─────────────┐
       │ PostgreSQL  │     │ Three.js    │
       │             │     │   WebGL     │
       └─────────────┘     └─────────────┘
                │
                ▼
             Render
🎯 Objectifs techniques du projet

Au-delà de l'aspect créatif, MyUniverse permet de mettre en pratique plusieurs problématiques rencontrées dans le développement d'applications web modernes :

conception d'une architecture Symfony ;
modélisation d'une base de données relationnelle ;
gestion des relations Doctrine ;
authentification et gestion des utilisateurs ;
contrôle des droits d'accès ;
traitement de données JSON ;
communication frontend/backend avec Fetch ;
intégration de Three.js ;
manipulation d'une scène 3D ;
sauvegarde dynamique des données ;
génération d'images depuis un canvas WebGL ;
déploiement d'une application Symfony ;
utilisation de PostgreSQL en production.
🔮 Perspectives d'amélioration

Plusieurs fonctionnalités pourraient être ajoutées afin de faire évoluer MyUniverse vers une véritable plateforme communautaire.

❤️ Interactions sociales
Likes sur les publications
Commentaires
Compteur de vues
Système de favoris
Partage des publications
👤 Profils utilisateurs
Page profil publique
Avatar
Présentation personnelle
Liste des créations
Liste des publications
Système d'abonnement entre utilisateurs
🔎 Découverte
Recherche d'utilisateurs
Recherche d'étoiles
Recherche de constellations
Hashtags
Catégories
Filtrage des publications
Système de recommandations
🌌 Amélioration de l'expérience 3D
Rotation de la caméra
Zoom
Navigation libre dans l'espace
Meilleure gestion de la profondeur
Effets lumineux
Particules
Animations
Différents modèles d'étoiles
Export haute résolution
🖼️ Gestion des médias
Stockage des images sur un service spécialisé
Compression automatique
Génération de miniatures
Images optimisées pour le fil d'actualité
🔐 Sécurité
Renforcement des permissions
Validation avancée des données
Protection contre les abus
Système de signalement des publications
Modération
📱 Responsive / Mobile
Optimisation complète pour mobile
Interaction tactile avec Three.js
Interface adaptée aux petits écrans
📈 Évolutions possibles

À terme, MyUniverse pourrait évoluer vers une plateforme permettant aux utilisateurs de construire un véritable univers personnel :

             🌌 MY UNIVERSE
                    │
       ┌────────────┼────────────┐
       │            │            │
      ⭐           🌌           👤
    Étoiles   Constellations   Profils
       │            │            │
       └────────────┼────────────┘
                    │
                    ▼
               🌐 Community
                    │
          ┌─────────┼─────────┐
          │         │         │
         ❤️        💬        🔎
        Likes   Comments   Discovery
💼 Pourquoi ce projet ?

MyUniverse est également un projet personnel permettant d'explorer la conception d'une application web complète, de la modélisation des données jusqu'au déploiement en production.

Il met particulièrement l'accent sur :

Backend → Symfony / Doctrine / PostgreSQL

Frontend → Twig / JavaScript / Three.js

Interaction → API / Fetch / JSON

Déploiement → Render / PostgreSQL

L'objectif est de démontrer la capacité à concevoir et développer une application complète en prenant en charge aussi bien la logique métier que l'expérience utilisateur.

👩‍💻 À propos

Projet développé par Senebou Diarra, développeuse Full-Stack freelance.

Je développe des applications web sur mesure, du backend au frontend, en passant par la conception de bases de données et le déploiement.

Compétences mises en œuvre dans ce projet
PHP / Symfony
Doctrine ORM
PostgreSQL
JavaScript
Three.js
HTML / CSS
API / AJAX
Git / GitHub
Déploiement cloud
📬 Contact

Pour un projet web, une application sur mesure ou une mission freelance :

Développeuse Full-Stack Freelance — Senebou Diarra

Conception, développement et déploiement d'applications web sur mesure.

📄 Licence

Projet personnel.


### Petit conseil pour le rendre encore plus vendeur

Je mettrais **une capture d'écran ou un GIF de ton application tout en haut du README**, juste sous le titre. Pour un recruteur ou un prospect, c'est beaucoup plus efficace que de commencer directement par de la documentation technique.

Par exemple :

```md
# 🌌 MyUniverse

> Create your universe. Build your stars. Connect your constellations.

![MyUniverse](docs/images/myuniverse-preview.png)