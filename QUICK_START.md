# 🚀 Guide de Démarrage Rapide

> **Installation et premiers pas en 5 minutes**

## ⚡ Installation Express

### Prérequis
- Docker Desktop installé
- Git configuré
- Ports 3000, 8000, 8025 libres

### 1. Clonage et Configuration

```bash
# Cloner le projet
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital

# Configuration backend
cd gestion-hospitaliere-backend
cp .env.example .env
cd ..
```

### 2. Lancement Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

### 3. Installation et Migration

```bash
# Installation des dépendances
docker-compose exec backend composer install

# Configuration Laravel
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link
```

## 🎯 Accès Immédiat

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur |
| **API** | http://localhost:8000 | Backend Laravel |
| **MailHog** | http://localhost:8025 | Emails de test |

## 👤 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@hospital.com | password |
| **Médecin** | medecin@hospital.com | password |
| **Patient** | patient@hospital.com | password |

## 🧪 Test Rapide (2 minutes)

### 1. Connexion Admin
```
1. Aller sur http://localhost:3000
2. Se connecter avec admin@hospital.com / password
3. Accéder au dashboard complet
```

### 2. Créer un Patient
```
1. Menu "Patients" → "Nouveau Patient"
2. Remplir le formulaire
3. Upload d'un document (optionnel)
4. Sauvegarder
```

### 3. Créer un Rendez-vous
```
1. Menu "Rendez-vous" → "Nouveau"
2. Sélectionner patient et médecin
3. Choisir date/heure
4. Confirmer → Email envoyé automatiquement
```

### 4. Vérifier les Emails
```
1. Aller sur http://localhost:8025
2. Voir l'email de confirmation du rendez-vous
```

## 🛠️ Commandes Utiles

### Gestion Docker
```bash
# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend
```

### Laravel (Backend)
```bash
# Accéder au conteneur
docker-compose exec backend bash

# Migrations
php artisan migrate:fresh --seed

# Cache
php artisan cache:clear
```

## ❗ Dépannage Express

### Port déjà utilisé
```bash
# Vérifier les ports
netstat -an | findstr "3000\|8000"

# Arrêter et nettoyer
docker-compose down
docker system prune -f
```

### Base de données
```bash
# Réinitialiser
docker-compose exec backend php artisan migrate:fresh --seed
```

### Permissions fichiers
```bash
# Réparer les liens de stockage
docker-compose exec backend php artisan storage:link
```

## ✅ Checklist de Validation

- [ ] Docker containers démarrés (6 services)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] API répond (http://localhost:8000/api/health)
- [ ] Connexion admin réussie
- [ ] Patient créé avec succès
- [ ] Rendez-vous créé avec succès
- [ ] Email reçu dans MailHog

## 🎯 Prochaines Étapes

1. **Explorer l'interface** - Tester toutes les fonctionnalités
2. **Lire la documentation** - [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Configurer pour production** - [GUIDE_DEPLOIEMENT.md](GUIDE_DEPLOIEMENT.md)
4. **Personnaliser** - Adapter à vos besoins

---

**🎉 Félicitations ! Votre système de gestion hospitalière est opérationnel.**