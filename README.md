# DINAR - Peer-to-Peer Transfer Platform

DINAR est une application web permettant aux utilisateurs d'effectuer des transferts peer-to-peer (P2P) en toute sécurité. Les utilisateurs peuvent s'inscrire, se connecter, publier des demandes de transfert et interagir avec les demandes approuvées. Les administrateurs disposent d'un tableau de bord pour examiner et approuver les transferts.

## Table des Matières
- [Fonctionnalités](#fonctionnalités)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Technologies Utilisées](#technologies-utilisées)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Fonctionnalités

### Utilisateur
- **Inscription et Authentification** : Les utilisateurs peuvent créer un compte et se connecter.
- **Création de Demandes de Transfert** : Les utilisateurs peuvent publier des demandes de transfert en précisant les montants et le destinataire.
- **Gestion des Transferts** : Les utilisateurs peuvent consulter leurs transferts, initier des transferts vers un deuxième destinataire et suivre les statuts d'approbation.

### Administrateur
- **Tableau de Bord Admin** : Un espace dédié pour gérer les transferts en attente.
- **Validation des Demandes** : Affichage des transferts en attente avec des détails sur l'expéditeur et le destinataire.
- **Gestion des Transferts Secondaires** : Les administrateurs peuvent approuver ou rejeter les transferts après vérification.

## Structure du Projet

```
DINAR
├── backend
│   ├── .env                    # Variables d'environnement (non versionnées)
│   ├── .gitignore              # Fichiers ignorés par Git
│   ├── server.js               # Serveur principal Express
│   ├── models
│   │   ├── User.js             # Modèle utilisateur
│   │   └── Post.js             # Modèle de transfert
│   ├── routes
│   │   ├── auth.js             # Routes d'authentification
│   │   ├── posts.js            # Routes pour la gestion des transferts
│   │   └── admin.js            # Routes admin pour validation
│   ├── middleware
│   │   └── auth.js             # Middleware d'authentification et autorisation
└── frontend
    ├── index.html              # Page d'accueil
    ├── register.html           # Page d'inscription
    ├── login.html              # Page de connexion
    ├── dashboard.html          # Tableau de bord utilisateur
    ├── admin_dashboard.html    # Tableau de bord administrateur
    ├── css
    │   └── styles.css          # Feuilles de styles
    ├── js
    │   ├── auth.js             # Gestion de l'authentification
    │   ├── posts.js            # Gestion des transferts
    │   └── admin.js            # Gestion des validations admin
└── README.md                   # Documentation du projet
```

## Installation

### Cloner le projet
```bash
git clone https://github.com/yourusername/dinar.git
cd dinar
```

### Configuration du Backend
```bash
cd backend
npm install
```
Créer un fichier `.env` et ajouter :
```
PORT=5000
MONGO_URI=your_mongo_database_uri
JWT_SECRET=your_jwt_secret
```

### Lancement du Frontend
```bash
cd ../frontend
npx http-server .
```

### Lancement du Serveur Backend
```bash
cd backend
node server.js
```

## Utilisation
- **Inscription et Connexion** : Via l'interface utilisateur.
- **Tableau de Bord** : Gestion des demandes de transferts et statuts.
- **Validation Admin** : Les administrateurs peuvent approuver ou rejeter les transferts.

## API Endpoints

### Authentification (`auth.js`)
- `POST /auth/register` : Inscription d'un nouvel utilisateur.
- `POST /auth/login` : Connexion utilisateur.

### Gestion des Transferts (`posts.js`)
- `POST /posts` : Création d'une demande de transfert.
- `GET /posts/transferable` : Récupération des transferts disponibles.
- `POST /posts/:postId/transfer` : Transfert vers un deuxième destinataire.

### Administration (`admin.js`)
- `GET /admin/posts/pending` : Liste des transferts en attente de validation.
- `PUT /admin/posts/:postId` : Mise à jour du statut d'un transfert.
- `PUT /admin/posts/:postId/transfer-status` : Mise à jour du statut du transfert secondaire.

## Technologies Utilisées
- **Backend** : Node.js, Express.js, MongoDB, Mongoose
- **Frontend** : HTML, CSS, JavaScript
- **Authentification** : JWT (JSON Web Tokens)
- **Stockage** : Multer pour la gestion des fichiers

## Contribuer
Contributions bienvenues ! Pour contribuer :
1. Forkez le projet.
2. Créez une branche.
3. Faites vos modifications.
4. Envoyez une pull request.

## Licence
Ce projet est sous licence **MIT**.
## update github
1️⃣ Navigate to Your Project Directory
Open a terminal or command prompt and move to your DINAR project folder:

cd /path/to/DINAR
git status
git add .
git commit -m "Updated feature X and fixed bug Y"
git pull
git push origin main
