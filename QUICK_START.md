# 🚀 Quick Start - Gestion Hospitalière

## Démarrage Rapide (5 minutes)

### Option 1: Avec Docker (Recommandé) 🐳

```bash
# 1. Cloner le projet
git clone <repository-url>
cd gestion-hospitaliere

# 2. Créer le fichier .env backend
cd gestion-hospitaliere-backend
cp .env.example .env

# 3. Retour à la racine et lancer Docker
cd ..
docker-compose up -d

# 4. Installer les dépendances et migrer
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link

# 5. Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# MailHog: http://localhost:8025
```

### Option 2: Installation Manuelle 💻

#### Backend

```bash
cd gestion-hospitaliere-backend

# Installer dépendances
composer install

# Configuration
cp .env.example .env
php artisan key:generate

# Configurer .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# Migrer la base de données
php artisan migrate --seed
php artisan storage:link

# Lancer le serveur
php artisan serve
# API disponible sur http://127.0.0.1:8000
```

#### Frontend

```bash
cd gestion-hospitaliere-frontend

# Installer dépendances
npm install

# Configuration
echo "REACT_APP_API_URL=http://127.0.0.1:8000" > .env

# Lancer le serveur
npm start
# App disponible sur http://localhost:3000
```

---

## 👤 Comptes de Test

Après `php artisan db:seed`, vous aurez:

### Administrateur
- **Email:** admin@hospital.com
- **Password:** password
- **Rôle:** Admin (accès complet)

### Médecin
- **Email:** medecin@hospital.com
- **Password:** password
- **Rôle:** Médecin

### Patient
- **Email:** patient@hospital.com
- **Password:** password
- **Rôle:** Patient

---

## 📱 Premiers Pas

### 1. Se Connecter
1. Ouvrir http://localhost:3000
2. Cliquer sur "Connexion"
3. Utiliser un des comptes ci-dessus

### 2. Explorer le Dashboard
- Voir les statistiques en temps réel
- Graphiques d'occupation des lits
- Rendez-vous du jour

### 3. Gérer les Patients (Admin/Médecin)
1. Menu "Patients"
2. Créer un nouveau patient
3. Uploader une photo et des documents
4. Voir l'historique médical

### 4. Créer un Rendez-vous
1. Menu "Rendez-vous"
2. Nouveau rendez-vous
3. Sélectionner patient et médecin
4. Email automatique envoyé

### 5. Gérer les Chambres (Admin)
1. Menu "Chambres"
2. Créer une chambre
3. Assigner des lits
4. Voir le taux d'occupation

---

## 🔧 Commandes Utiles

### Backend

```bash
# Créer un nouveau contrôleur
php artisan make:controller Api/ExampleController

# Créer un modèle avec migration
php artisan make:model Example -m

# Créer une Form Request
php artisan make:request StoreExampleRequest

# Créer une Resource
php artisan make:resource ExampleResource

# Nettoyer le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Lancer les tests
php artisan test

# Lancer la queue
php artisan queue:work

# Voir les routes
php artisan route:list
```

### Frontend

```bash
# Installer une nouvelle dépendance
npm install package-name

# Build de production
npm run build

# Lancer les tests
npm test

# Analyser le bundle
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### Docker

```bash
# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Accéder au shell
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p

# Arrêter tout
docker-compose down

# Nettoyer (⚠️ supprime les données)
docker-compose down -v
```

---

## 📚 Structure du Projet

```
gestion-hospitaliere/
├── gestion-hospitaliere-backend/    # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/     # Contrôleurs REST
│   │   │   ├── Requests/            # Validation
│   │   │   └── Resources/           # Format JSON
│   │   ├── Models/                  # Eloquent Models
│   │   └── Notifications/           # Emails
│   ├── database/
│   │   ├── migrations/              # Schémas DB
│   │   └── seeders/                 # Données test
│   └── routes/
│       └── api.php                  # Routes API
│
├── gestion-hospitaliere-frontend/   # React 18
│   ├── src/
│   │   ├── api/                     # Config Axios
│   │   ├── components/              # Composants réutilisables
│   │   ├── hooks/                   # Hooks personnalisés
│   │   ├── pages/                   # Pages principales
│   │   └── contexts/                # Context API
│   └── public/
│
├── docker-compose.yml               # Orchestration Docker
├── Dockerfile.backend               # Image backend
├── Dockerfile.frontend              # Image frontend
├── GUIDE_DEPLOIEMENT.md            # Guide complet
├── ARCHITECTURE.md                  # Documentation technique
└── AMELIORATIONS_REALISEES.md      # Changelog
```

---

## 🎯 Fonctionnalités Principales

### ✅ Gestion des Patients
- CRUD complet
- Upload photos et documents médicaux
- Historique médical
- Assignation de lits

### ✅ Gestion des Rendez-vous
- Création avec validation
- Notifications email automatiques
- Calendrier interactif
- Filtres par statut

### ✅ Gestion des Chambres & Lits
- Types de chambres (Standard, VIP, Soins intensifs)
- Suivi occupation en temps réel
- Assignation/libération de lits
- Statistiques par service

### ✅ Dashboard
- KPIs en temps réel
- Graphiques interactifs (Recharts)
- Rendez-vous du jour
- Activité récente

### ✅ Sécurité
- Authentification JWT (Sanctum)
- Rôles et permissions
- Rate limiting
- Validation stricte

---

## 🆘 Problèmes Courants

### Erreur: "Class not found"
```bash
composer dump-autoload
```

### Erreur: "SQLSTATE[HY000] [2002]"
```bash
# Vérifier que MySQL est démarré
# Vérifier les credentials dans .env
```

### Erreur CORS
```bash
# Backend: vérifier config/cors.php
# Frontend: vérifier REACT_APP_API_URL dans .env
```

### Port déjà utilisé
```bash
# Changer le port dans docker-compose.yml
# Ou arrêter le service qui utilise le port
```

---

## 📖 Documentation Complète

- **[GUIDE_DEPLOIEMENT.md](./GUIDE_DEPLOIEMENT.md)** - Déploiement production
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique
- **[AMELIORATIONS_REALISEES.md](./AMELIORATIONS_REALISEES.md)** - Changelog détaillé

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- 📧 Email: support@hospital.com
- 📖 Wiki: https://github.com/hospital/wiki
- 🐛 Issues: https://github.com/hospital/issues

---

**Bon développement! 🚀**
