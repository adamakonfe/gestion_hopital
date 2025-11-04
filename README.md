# 🏥 Application de Gestion Hospitalière

> Application web moderne et complète pour la gestion centralisée des opérations hospitalières

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Vue d'Ensemble

Application full-stack de gestion hospitalière avec **Laravel 11** (backend) et **React 18** (frontend), offrant une solution complète pour:

- 👥 **Gestion des patients** - Dossiers médicaux, documents, historique
- 👨‍⚕️ **Gestion des médecins** - Spécialités, horaires, disponibilités
- 📅 **Gestion des rendez-vous** - Calendrier, notifications automatiques
- 🛏️ **Gestion des chambres & lits** - Occupation en temps réel, types de chambres
- 📊 **Tableau de bord** - Statistiques, graphiques, KPIs
- 🔐 **Sécurité** - Authentification JWT, rôles, permissions

---

## ✨ Fonctionnalités Principales

### Backend (Laravel 11)
- ✅ API REST complète avec Laravel Sanctum
- ✅ Form Request Validators pour validation stricte
- ✅ API Resources pour formatage JSON cohérent
- ✅ Upload de fichiers (photos, documents PDF)
- ✅ Notifications email automatiques
- ✅ Rate limiting et sécurité renforcée
- ✅ Gestion des rôles (Admin, Médecin, Patient, Infirmier)

### Frontend (React 18)
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

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd gestion-hospitaliere

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

### Sans Docker

Voir [QUICK_START.md](./QUICK_START.md) pour l'installation manuelle.

---

## 👤 Comptes de Test

| Rôle | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | password |
| Médecin | medecin@hospital.com | password |
| Patient | patient@hospital.com | password |

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Guide de démarrage rapide
- **[GUIDE_DEPLOIEMENT.md](./GUIDE_DEPLOIEMENT.md)** - Déploiement (Docker, Kubernetes, CI/CD)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique détaillée
- **[AMELIORATIONS_REALISEES.md](./AMELIORATIONS_REALISEES.md)** - Changelog complet
- **[.github/README.md](./.github/README.md)** - Configuration CI/CD

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (React 18 + TailwindCSS)   │
│  Components │ Hooks │ Pages │ Contexts  │
└──────────────────┬──────────────────────┘
                   │ REST API (JSON)
┌──────────────────┴──────────────────────┐
│      Backend (Laravel 11 + Sanctum)     │
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
- **Framework:** Laravel 11
- **Auth:** Laravel Sanctum (JWT)
- **Database:** MySQL 8.0
- **Cache/Queue:** Redis
- **Email:** SMTP + Queue
- **Validation:** Form Requests
- **API:** RESTful avec Resources

### Frontend
- **Framework:** React 18
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

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour le schéma complet.

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

## 🧪 Tests

### Backend (PHPUnit)
```bash
cd gestion-hospitaliere-backend
php artisan test
```

### Frontend (Jest)
```bash
cd gestion-hospitaliere-frontend
npm test
```

Exemple de test fourni: `tests/Feature/PatientTest.php`

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

### Kubernetes (Minikube)
```bash
# Démarrer Minikube
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable ingress

# Build et déployer
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -f Dockerfile.backend -t gestion-hopital-backend:latest .
docker build -f Dockerfile.frontend -t gestion-hopital-frontend:latest .
kubectl apply -f k8s/

# Migrations
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan migrate --force

# Accéder à l'app
kubectl port-forward -n hospital service/frontend 3000:80
# Ou: minikube tunnel (puis http://app.local)
```

### CI/CD (GitHub Actions)
```bash
# Configurer les secrets GitHub
# Settings → Secrets → Actions:
# DOCKER_USERNAME, DOCKER_PASSWORD, KUBECONFIG

# Push pour déclencher le pipeline
git push origin main

# Monitoring
gh run list
gh run view <run-id> --log
```

---

## 📈 Statistiques du Projet

- **Backend:** 9 modèles, 14 migrations, 8 contrôleurs, ~50 endpoints
- **Frontend:** 5+ pages, 4 hooks personnalisés, 10+ composants
- **Documentation:** 4 fichiers complets (2000+ lignes)
- **Docker:** 6 services orchestrés
- **Tests:** Structure PHPUnit + Jest prête

---

## 🗺️ Roadmap

### Phase 1 (Complétée) ✅
- [x] Architecture backend/frontend
- [x] Authentification & autorisation
- [x] CRUD complet toutes entités
- [x] Dashboard avec statistiques
- [x] Upload de fichiers
- [x] Notifications email
- [x] Docker setup
- [x] Documentation complète

### Phase 2 (À venir)
- [ ] Tests complets (couverture 80%+)
- [ ] Système de facturation avancé
- [ ] Calendrier interactif rendez-vous
- [ ] Messagerie interne
- [ ] Rapports PDF exportables
- [ ] PWA avec notifications push

### Phase 3 (Futur)
- [ ] Module gestion stocks médicaux
- [ ] Téléconsultation
- [ ] Application mobile (React Native)
- [ ] Analytics avancés
- [ ] Multi-langue (i18n)

---

## 🤝 Contribution

Les contributions sont les bienvenues!

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **Équipe Développement** - Développement initial

---

## 📞 Support

- 📧 **Email:** support@hospital.com
- 📖 **Documentation:** [Wiki](https://github.com/hospital/wiki)
- 🐛 **Issues:** [GitHub Issues](https://github.com/hospital/issues)

---

## 🙏 Remerciements

- Laravel Team pour le framework exceptionnel
- React Team pour la bibliothèque UI
- Communauté open-source

---

<div align="center">

**Fait avec ❤️ pour améliorer la gestion hospitalière**

[Documentation](./GUIDE_DEPLOIEMENT.md) • [Architecture](./ARCHITECTURE.md) • [Quick Start](./QUICK_START.md)

</div>
"# gestion_hopital" 
