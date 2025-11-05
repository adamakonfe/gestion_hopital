# 🏥 Application de Gestion Hospitalière

> **Système de gestion hospitalière moderne et complet** - Solution full-stack pour la digitalisation complète des opérations hospitalières avec monitoring avancé et sécurité enterprise-grade.

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Vue d'Ensemble

Application full-stack de gestion hospitalière avec **Laravel 12** (backend) et **React 19** (frontend), offrant une solution complète pour:

- 👥 **Gestion des patients** - Dossiers médicaux, documents, historique
- 👨⚕️ **Gestion des médecins** - Spécialités, horaires, disponibilités
- 📅 **Gestion des rendez-vous** - Calendrier, notifications automatiques
- 🛏️ **Gestion des chambres & lits** - Occupation en temps réel, types de chambres
- 📊 **Tableau de bord** - Statistiques, graphiques, KPIs
- 🔐 **Sécurité** - Authentification JWT, rôles, permissions

---

## ✨ Fonctionnalités Principales

### Backend (Laravel 12)
- ✅ API REST complète avec Laravel Sanctum
- ✅ Form Request Validators pour validation stricte
- ✅ API Resources pour formatage JSON cohérent
- ✅ Upload de fichiers (photos, documents PDF)
- ✅ Notifications email automatiques
- ✅ Rate limiting et sécurité renforcée
- ✅ Gestion des rôles (Admin, Médecin, Patient, Infirmier)

### Frontend (React 19)
- ✅ Interface moderne avec TailwindCSS
- ✅ Hooks personnalisés (useAuth, useFetch, useMutation)
- ✅ Dashboard avec graphiques interactifs (Recharts)
- ✅ Gestion complète des entités
- ✅ Upload de fichiers avec preview
- ✅ Responsive design

### Infrastructure
- ✅ Docker Compose pour déploiement facile
- ✅ MySQL 8.0 + Redis + MailHog
- ✅ Nginx optimisé
- ✅ Multi-stage builds

---

## ⚡ Test Rapide (5 minutes)

> **🎯 Pour tester immédiatement toutes les fonctionnalités**

```bash
# 1. Cloner et lancer
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital
docker-compose up -d

# 2. Configurer (une seule fois)
cd gestion-hospitaliere-backend && cp .env.example .env && cd ..
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link

# 3. Accéder à l'application
# Frontend: http://localhost:3000
# Comptes: admin@hospital.com / password
```

**🔥 Test immédiat:**
1. **Connexion:** `admin@hospital.com` / `password`
2. **Créer un patient:** Menu "Patients" → "Nouveau Patient"
3. **Créer un rendez-vous:** Menu "Rendez-vous" → "Nouveau"
4. **Voir les emails:** http://localhost:8025 (MailHog)
5. **Dashboard:** Statistiques temps réel

---

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital

# Configurer l'environnement backend
cd gestion-hospitaliere-backend
cp .env.example .env
cd ..

# Lancer avec Docker
docker-compose up -d

# Installer et migrer
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link
```

**Accès:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MailHog: http://localhost:8025

---

## 👤 Comptes de Test - IMPORTANT

> **⚠️ Utilisez ces comptes pour tester toutes les fonctionnalités**

| Rôle | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@hospital.com | password | Accès complet, gestion utilisateurs, statistiques |
| **Médecin** | medecin@hospital.com | password | Patients, rendez-vous, prescriptions |
| **Patient** | patient@hospital.com | password | Profil, rendez-vous, documents |

### 🔑 Fonctionnalités par Rôle

#### Admin (Accès Complet)
- ✅ Dashboard complet avec toutes les statistiques
- ✅ Gestion des patients (CRUD complet)
- ✅ Gestion des médecins (CRUD complet)
- ✅ Gestion des rendez-vous (tous)
- ✅ Gestion des services hospitaliers
- ✅ Upload de documents
- ✅ Monitoring et rapports

#### Médecin (Gestion Médicale)
- ✅ Ses patients assignés
- ✅ Ses rendez-vous
- ✅ Création/modification rendez-vous
- ✅ Consultation des dossiers médicaux
- ✅ Upload de documents patients
- ✅ Statistiques personnelles

#### Patient (Accès Personnel)
- ✅ Son profil personnel
- ✅ Ses rendez-vous
- ✅ Prise de rendez-vous
- ✅ Ses documents médicaux
- ✅ Historique des consultations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (React 19 + TailwindCSS)   │
│  Components │ Hooks │ Pages │ Contexts  │
└──────────────────┬──────────────────────┘
                   │ REST API (JSON)
┌──────────────────┴──────────────────────┐
│      Backend (Laravel 12 + Sanctum)     │
│  Controllers │ Models │ Requests │ Jobs │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│         MySQL 8.0 + Redis + Storage     │
└─────────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

### Backend
- **Framework:** Laravel 12
- **Auth:** Laravel Sanctum (JWT)
- **Database:** MySQL 8.0
- **Cache/Queue:** Redis
- **Email:** SMTP + Queue
- **Validation:** Form Requests
- **API:** RESTful avec Resources

### Frontend
- **Framework:** React 19
- **Routing:** React Router v6
- **HTTP:** Axios
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Calendar:** React Big Calendar
- **State:** Context API + Custom Hooks

### DevOps
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (Minikube)
- **CI/CD:** GitHub Actions
- **Web Server:** Nginx
- **Process Manager:** PHP-FPM
- **Email Testing:** MailHog
- **Registry:** Docker Hub

---

## 📊 Modèles de Données

### Principaux Modèles
- **User** - Utilisateurs (avec rôles)
- **Patient** - Dossiers patients + documents
- **Medecin** - Médecins + spécialités
- **Rendezvous** - Rendez-vous + notifications
- **Chambre** - Chambres + types + équipements
- **Lit** - Lits + assignation patients
- **Service** - Services hospitaliers
- **Prescription** - Prescriptions médicales
- **Facture** - Facturation

---

## 🔐 Sécurité

- ✅ **Authentification JWT** via Laravel Sanctum
- ✅ **Autorisation basée sur les rôles** (RBAC)
- ✅ **Rate Limiting** (60 requêtes/minute)
- ✅ **Validation stricte** (Form Requests)
- ✅ **CORS configuré**
- ✅ **Protection XSS/CSRF**
- ✅ **Upload sécurisé** (validation MIME, taille)
- ✅ **SQL Injection prevention** (Eloquent ORM)

---

## 🧪 Tests & Guide de Test Complet

### 🚀 Guide de Test des Fonctionnalités

#### 1. **Test d'Installation et Configuration**
```bash
# 1. Cloner et démarrer le projet
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital

# 2. Configurer l'environnement backend
cd gestion-hospitaliere-backend
cp .env.example .env
cd ..

# 3. Lancer avec Docker
docker-compose up -d

# 4. Installer et migrer
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link

# 5. Vérifier l'accès
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# MailHog: http://localhost:8025
```

#### 2. **Test d'Authentification** 🔐
```bash
# Comptes de test disponibles:
# Admin: admin@hospital.com / password
# Médecin: medecin@hospital.com / password  
# Patient: patient@hospital.com / password
```

**Scénarios à tester:**
- ✅ Connexion avec chaque type de compte
- ✅ Déconnexion
- ✅ Accès aux pages selon les rôles
- ✅ Réinitialisation mot de passe (vérifier MailHog)

#### 3. **Test Gestion des Patients** 👥

**Fonctionnalités à tester:**
- ✅ **Créer un patient** : Formulaire complet avec validation
- ✅ **Modifier un patient** : Édition des informations
- ✅ **Supprimer un patient** : Confirmation de suppression
- ✅ **Upload de documents** : PDF, images (max 2MB)
- ✅ **Recherche de patients** : Par nom, email, téléphone
- ✅ **Pagination** : Navigation entre pages

#### 4. **Test Gestion des Rendez-vous** 📅

**Fonctionnalités à tester:**
- ✅ **Créer un rendez-vous** : Patient + Médecin + Date/Heure
- ✅ **Calendrier interactif** : Vue mensuelle/hebdomadaire
- ✅ **Modifier un rendez-vous** : Changer date, médecin
- ✅ **Annuler un rendez-vous** : Changement de statut
- ✅ **Notifications email** : Vérifier dans MailHog
- ✅ **Conflits de planning** : Détection automatique

#### 5. **Test Dashboard et Statistiques** 📊

**Métriques à vérifier:**
- ✅ **Nombre total de patients** : Compteur temps réel
- ✅ **Nombre de médecins** : Par service
- ✅ **Rendez-vous du jour** : Liste et statuts
- ✅ **Graphiques** : Évolution mensuelle
- ✅ **Statistiques par service** : Répartition

#### 6. **Test Upload de Fichiers** 📁

**Types de fichiers supportés:**
- ✅ **Images** : JPG, PNG, GIF (max 2MB)
- ✅ **Documents** : PDF (max 5MB)
- ✅ **Validation** : Type MIME, taille
- ✅ **Preview** : Aperçu avant upload
- ✅ **Stockage sécurisé** : Liens protégés

#### 7. **Test Notifications Email** 📧

**Emails à tester dans MailHog:**
- ✅ **Création rendez-vous** : Confirmation patient + médecin
- ✅ **Modification rendez-vous** : Notification changement
- ✅ **Annulation** : Email d'annulation
- ✅ **Rappels** : 24h avant rendez-vous
- ✅ **Réinitialisation mot de passe** : Lien sécurisé

### 🧪 Tests Automatisés

#### Backend (PHPUnit)
```bash
cd gestion-hospitaliere-backend
php artisan test
```

#### Frontend (Jest)
```bash
cd gestion-hospitaliere-frontend
npm test
```

#### Tests E2E (Playwright)
```bash
npx playwright test
```

### 📋 Checklist de Test Complète

**Avant de commencer:**
- [ ] Docker installé et fonctionnel
- [ ] Ports 3000, 8000, 8025 disponibles
- [ ] Git configuré

**Tests fonctionnels:**
- [ ] Installation et configuration
- [ ] Authentification (3 rôles)
- [ ] CRUD Patients (créer, lire, modifier, supprimer)
- [ ] CRUD Médecins
- [ ] CRUD Rendez-vous
- [ ] Upload de fichiers
- [ ] Dashboard et statistiques
- [ ] Notifications email (MailHog)
- [ ] Sécurité et permissions
- [ ] Performance (< 2s)

**Tests techniques:**
- [ ] Tests unitaires backend
- [ ] Tests composants frontend
- [ ] Tests E2E complets

### 🎯 Scénarios d'Usage Réels

#### Scénario 1: Nouveau Patient
```
1. Admin crée un compte patient
2. Upload du dossier médical (PDF)
3. Médecin consulte le dossier
4. Création d'un rendez-vous
5. Confirmation par email
```

#### Scénario 2: Consultation Médicale
```
1. Patient se connecte
2. Prend rendez-vous en ligne
3. Médecin reçoit notification
4. Consultation et notes
5. Prescription générée
```

#### Scénario 3: Gestion Administrative
```
1. Admin consulte dashboard
2. Analyse statistiques
3. Gère les conflits planning
4. Export des rapports
5. Monitoring système
```

---

## 🚀 Guide de Déploiement

### 🐳 Déploiement Docker (Production)

```bash
# 1. Cloner le projet
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital

# 2. Configuration production
cp gestion-hospitaliere-backend/.env.example gestion-hospitaliere-backend/.env
# Éditer .env avec les paramètres de production

# 3. Build et déploiement
docker-compose -f docker-compose.prod.yml up -d

# 4. Migrations et optimisations
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### ⚙️ Déploiement Kubernetes

```bash
# 1. Démarrer Minikube
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable ingress

# 2. Build des images
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -f Dockerfile.backend -t gestion-hopital-backend:latest .
docker build -f Dockerfile.frontend -t gestion-hopital-frontend:latest .

# 3. Déploiement
kubectl apply -f k8s/

# 4. Migrations
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan migrate --force

# 5. Accès
kubectl port-forward -n hospital service/frontend 3000:80
# Ou: minikube tunnel (puis http://app.local)
```

### 🔄 CI/CD GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Push Docker Images
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/gestion-hopital-backend .
          docker push ${{ secrets.DOCKER_USERNAME }}/gestion-hopital-backend
      
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
```

---

## 📦 Commandes Utiles

### Backend
```bash
# Migrations
php artisan migrate
php artisan migrate:fresh --seed

# Cache
php artisan config:cache
php artisan route:cache

# Queue
php artisan queue:work

# Tests
php artisan test
```

### Frontend
```bash
# Développement
npm start

# Build production
npm run build

# Tests
npm test
```

### Docker
```bash
# Démarrer
docker-compose up -d

# Logs
docker-compose logs -f backend

# Arrêter
docker-compose down
```

---

## 🛠️ Dépannage et FAQ

### ❓ Problèmes Courants

#### 1. **Erreur de Port Occupé**
```bash
# Vérifier les ports utilisés
netstat -an | findstr "3000\|8000\|8025"

# Arrêter les conteneurs existants
docker-compose down
docker system prune -f

# Relancer
docker-compose up -d
```

#### 2. **Erreur de Base de Données**
```bash
# Réinitialiser la base de données
docker-compose exec backend php artisan migrate:fresh --seed

# Vérifier la connexion MySQL
docker-compose exec mysql mysql -u root -p
```

#### 3. **Problème d'Upload de Fichiers**
```bash
# Vérifier les permissions
docker-compose exec backend php artisan storage:link
docker-compose exec backend chmod -R 755 storage/
```

#### 4. **Emails non Reçus**
```bash
# Vérifier MailHog
# Accéder à: http://localhost:8025
# Vérifier la configuration email dans .env:
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

#### 5. **Erreur d'Authentification**
```bash
# Régénérer la clé d'application
docker-compose exec backend php artisan key:generate

# Vider le cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### 📋 Guidelines

- ✅ Suivre les conventions de code existantes
- ✅ Ajouter des tests pour les nouvelles fonctionnalités
- ✅ Mettre à jour la documentation si nécessaire
- ✅ Respecter le [Code of Conduct](CODE_OF_CONDUCT.md)

### 🐛 Signaler un Bug

Utilisez les [GitHub Issues](https://github.com/adamakonfe/gestion_hopital/issues) avec le template :

```markdown
**Describe the bug**
Description claire du problème

**To Reproduce**
Étapes pour reproduire le bug

**Expected behavior**
Comportement attendu

**Environment**
- OS: [e.g. Windows 10]
- Docker: [e.g. 20.10.8]
- Browser: [e.g. Chrome 95]
```

---

## 🗺️ Roadmap

### Phase 1 (Complétée) ✅
- [x] Architecture backend/frontend complète
- [x] Authentification & autorisation (RBAC)
- [x] CRUD complet toutes entités
- [x] Dashboard avec statistiques temps réel
- [x] Upload de fichiers sécurisé
- [x] Notifications email automatiques
- [x] Docker setup complet
- [x] Documentation exhaustive

### Phase 2 (En cours)
- [ ] Tests complets (couverture 80%+)
- [ ] Système de facturation avancé
- [ ] Calendrier interactif rendez-vous
- [ ] Messagerie interne
- [ ] Rapports PDF exportables
- [ ] PWA avec notifications push

### Phase 3 (Futur)
- [ ] Module gestion stocks médicaux
- [ ] Téléconsultation intégrée
- [ ] Application mobile (React Native)
- [ ] Analytics avancés avec IA
- [ ] Multi-langue (i18n)

---

## 📊 Statistiques

- **Backend :** 9 modèles, 14 migrations, 8 contrôleurs, ~50 endpoints
- **Frontend :** 5+ pages, 4 hooks personnalisés, 10+ composants
- **Documentation :** Documentation complète intégrée
- **Docker :** 6 services orchestrés
- **Performance :** API < 200ms, Interface < 2s

---

## 🔗 Liens Utiles

- 🌐 **[Demo Live](http://localhost:3000)** - Application en fonctionnement
- 📖 **[API Documentation](http://localhost:8000/api/documentation)** - Swagger/OpenAPI
- 📧 **[MailHog](http://localhost:8025)** - Interface emails de test
- 🐳 **[Docker Hub](https://hub.docker.com/u/adamakonfe)** - Images Docker
- 📧 **[Support](mailto:support@hospital.com)** - Support technique

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 Adama Konfe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Remerciements

- **Adama Konfe** - Conception et développement initial
- **Laravel Team** - Framework backend exceptionnel
- **React Team** - Bibliothèque UI moderne
- **Communauté Open Source** - Inspiration et outils
- **Docker** - Containerisation simplifiée

### 🏥 Dédiée aux Professionnels de Santé

Cette application est dédiée à tous les professionnels de santé qui œuvrent quotidiennement pour améliorer les soins aux patients.

---

## 🛡️ Sécurité et Qualité

- ✅ **Authentification JWT** via Laravel Sanctum
- ✅ **Autorisation RBAC** (Admin, Médecin, Patient, Infirmier)
- ✅ **Rate Limiting** (60 requêtes/minute)
- ✅ **Validation stricte** (Form Requests)
- ✅ **Upload sécurisé** (validation MIME, taille)
- ✅ **Protection XSS/CSRF**
- ✅ **Conformité RGPD**

---

<div align="center">

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile ! ⭐**

**Fait avec ❤️ pour améliorer la gestion hospitalière**

[🚀 Installation Rapide](#-test-rapide-5-minutes) • [🧪 Tests Complets](#-tests--guide-de-test-complet) • [🏗️ Architecture](#-architecture) • [🚀 Déploiement](#-guide-de-déploiement)

</div>