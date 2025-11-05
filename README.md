<div align="center">

# 🏥 **Gestion Hospitalière** 
### *Système de gestion hospitalière moderne et intelligent*

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**🚀 Solution complète pour digitaliser votre hôpital**

[🎯 Test Rapide](#-test-rapide) • [📖 Documentation](#-documentation) • [🔧 Installation](#-installation-ultra-rapide)

---

</div>

## 🎯 **Pourquoi ce Projet ?**

> **Transformez votre hôpital** avec une solution moderne qui simplifie la gestion des patients, médecins et rendez-vous tout en offrant une sécurité de niveau entreprise.

<div align="center">

### 🏆 **Fonctionnalités Clés**

| 👥 **Patients** | 👨‍⚕️ **Médecins** | 📅 **Rendez-vous** | 📊 **Analytics** |
|:---:|:---:|:---:|:---:|
| Dossiers numériques | Gestion des spécialités | Calendrier intelligent | Dashboard temps réel |
| Upload documents | Planning optimisé | Notifications auto | Statistiques avancées |
| Historique complet | Suivi consultations | Gestion conflits | Rapports exportables |

</div>

---

## ✨ **Ce qui Rend ce Projet Unique**

<div align="center">

```mermaid
graph TB
    A[🌐 Interface Moderne] --> B[⚡ Performance Optimale]
    B --> C[🔐 Sécurité Enterprise]
    C --> D[📱 Responsive Design]
    D --> E[🔄 Temps Réel]
    E --> F[📊 Analytics Avancés]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
```

</div>

### 🛠️ **Stack Technologique**

<div align="center">

| **Backend** | **Frontend** | **Infrastructure** |
|:---:|:---:|:---:|
| ![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel) | ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker) |
| ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql) | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css) | ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes) |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis) | ![Recharts](https://img.shields.io/badge/Recharts-8884D8?style=flat-square) | ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana) |

</div>

---

## 🚀 **Installation Ultra-Rapide**

<div align="center">

### ⚡ **3 Commandes, 5 Minutes, Prêt !**

</div>

```bash
# 1️⃣ Cloner et démarrer
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital && docker-compose up -d

# 2️⃣ Configuration automatique
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed

# 3️⃣ C'est prêt ! 🎉
# 🌐 Frontend: http://localhost:3000
# 🔧 API: http://localhost:8000  
# 📧 MailHog: http://localhost:8025
```

<div align="center">

### 🎭 **Comptes de Test**

| Rôle | Email | Mot de passe | Accès |
|:---:|:---:|:---:|:---:|
| **👑 Admin** | `admin@hospital.com` | `password` | 🔓 Accès complet |
| **👨‍⚕️ Médecin** | `medecin@hospital.com` | `password` | 🏥 Gestion médicale |
| **👤 Patient** | `patient@hospital.com` | `password` | 📋 Profil personnel |

</div>

---

## 🎯 **Test Rapide**

<div align="center">

### 🔥 **Testez en 2 Minutes !**

</div>

1. **🔑 Connexion** → Utilisez `admin@hospital.com` / `password`
2. **👥 Créer un patient** → Menu "Patients" → "Nouveau Patient"  
3. **📅 Planifier un RDV** → Menu "Rendez-vous" → "Nouveau"
4. **📧 Vérifier les emails** → http://localhost:8025 (MailHog)
5. **📊 Voir les stats** → Dashboard avec graphiques temps réel

<div align="center">

**🎉 Félicitations ! Vous avez testé toutes les fonctionnalités principales !**

</div>

---

## 🏗️ **Architecture**

<div align="center">

```ascii
┌─────────────────────────────────────────┐
│        🌐 Frontend (React 19)           │
│     Interface Moderne + TailwindCSS     │
└─────────────────┬───────────────────────┘
                  │ 🔄 API REST (JSON)
┌─────────────────┴───────────────────────┐
│        ⚙️ Backend (Laravel 12)          │
│    API + Auth + Validation + Jobs       │
└─────────────────┬───────────────────────┘
                  │ 💾 Données
┌─────────────────┴───────────────────────┐
│     🗄️ MySQL 8.0 + Redis + Storage      │
│        Base de données + Cache          │
└─────────────────────────────────────────┘
```

</div>

---

## 🔐 **Sécurité & Performance**

<div align="center">

| 🛡️ **Sécurité** | ⚡ **Performance** |
|:---:|:---:|
| ✅ Authentification JWT | ✅ Cache Redis |
| ✅ Validation stricte | ✅ API < 500ms |
| ✅ Rate Limiting | ✅ Interface < 2s |
| ✅ Upload sécurisé | ✅ Monitoring temps réel |
| ✅ Protection XSS/CSRF | ✅ Optimisation automatique |

</div>

---

## 📊 **Monitoring & Analytics**

<div align="center">

### 📈 **Dashboards Intégrés**

| **Grafana** | **Prometheus** | **Application** |
|:---:|:---:|:---:|
| 📊 Métriques système | 📈 Collecte données | 🏥 Stats hospitalières |
| 🖥️ CPU, RAM, Réseau | ⏱️ Temps réponse | 👥 Patients, Médecins |
| 🔄 Temps réel | 📊 Historiques | 📅 Rendez-vous |

</div>

---

## 🛠️ **Dépannage Rapide**

<details>
<summary><strong>🚨 Problèmes Courants</strong></summary>

### Port occupé ?
```bash
docker-compose down && docker-compose up -d
```

### Base de données ?
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

### Emails non reçus ?
```bash
# Vérifiez MailHog: http://localhost:8025
```

### Erreur d'auth ?
```bash
docker-compose exec backend php artisan key:generate
```

</details>

---

## 📚 **Documentation**

<div align="center">

| 📖 **Guide** | 🔧 **Technique** | 🚀 **Déploiement** |
|:---:|:---:|:---:|
| [Guide Utilisateur](./GUIDE_UTILISATEUR.md) | [Architecture](./ARCHITECTURE.md) | [Docker](./GUIDE_DEPLOIEMENT.md) |
| [FAQ](./FAQ.md) | [API Documentation](./API.md) | [Kubernetes](./K8S_GUIDE.md) |
| [Changelog](./CHANGELOG.md) | [Tests](./TESTS.md) | [CI/CD](./CICD.md) |

</div>

---

## 🤝 **Contribution**

<div align="center">

**Nous accueillons toutes les contributions ! 🎉**

[🐛 Reporter un Bug](https://github.com/adamakonfe/gestion_hopital/issues) • [💡 Proposer une Fonctionnalité](https://github.com/adamakonfe/gestion_hopital/discussions) • [📖 Améliorer la Doc](https://github.com/adamakonfe/gestion_hopital/pulls)

</div>

---

## 📄 **Licence & Contact**

<div align="center">

**📄 Licence:** MIT - Libre d'utilisation  
**📧 Support:** support@hospital.com  
**💬 Discussions:** [GitHub Discussions](https://github.com/adamakonfe/gestion_hopital/discussions)

---

### 🌟 **Fait avec ❤️ pour révolutionner la gestion hospitalière**

**⭐ N'oubliez pas de mettre une étoile si ce projet vous aide !**

[![GitHub stars](https://img.shields.io/github/stars/adamakonfe/gestion_hopital?style=social)](https://github.com/adamakonfe/gestion_hopital/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/adamakonfe/gestion_hopital?style=social)](https://github.com/adamakonfe/gestion_hopital/network)

</div>
