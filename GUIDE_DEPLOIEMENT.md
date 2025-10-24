# 📘 Guide de Déploiement - Application de Gestion Hospitalière

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation en Développement](#installation-en-développement)
3. [Déploiement avec Docker](#déploiement-avec-docker)
4. [Configuration](#configuration)
5. [Migration de la Base de Données](#migration-de-la-base-de-données)
6. [Tests](#tests)
7. [Déploiement en Production](#déploiement-en-production)
8. [Maintenance](#maintenance)
9. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Backend (Laravel 11)
- PHP >= 8.2
- Composer
- MySQL >= 8.0 ou PostgreSQL >= 13
- Extensions PHP: PDO, mbstring, openssl, tokenizer, XML, ctype, JSON, BCMath, fileinfo

### Frontend (React 18)
- Node.js >= 18.x
- npm >= 9.x

### Docker (Optionnel mais recommandé)
- Docker >= 20.10
- Docker Compose >= 2.0

---

## 💻 Installation en Développement

### 1️⃣ Backend Laravel

```bash
# Naviguer vers le dossier backend
cd gestion-hospitaliere-backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hospital_db
DB_USERNAME=root
DB_PASSWORD=

# Exécuter les migrations
php artisan migrate

# Créer le lien symbolique pour le storage
php artisan storage:link

# (Optionnel) Remplir avec des données de test
php artisan db:seed

# Lancer le serveur de développement
php artisan serve
```

Le backend sera accessible sur `http://127.0.0.1:8000`

### 2️⃣ Frontend React

```bash
# Naviguer vers le dossier frontend
cd gestion-hospitaliere-frontend

# Installer les dépendances
npm install

# Créer le fichier .env
echo "REACT_APP_API_URL=http://127.0.0.1:8000" > .env

# Lancer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

---

## 🐳 Déploiement avec Docker

### Démarrage Rapide

```bash
# À la racine du projet
docker-compose up -d

# Vérifier que tous les conteneurs sont lancés
docker-compose ps

# Exécuter les migrations
docker-compose exec backend php artisan migrate

# Créer le lien symbolique storage
docker-compose exec backend php artisan storage:link
```

### Services Disponibles
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MySQL**: localhost:3306
- **MailHog (emails)**: http://localhost:8025
- **Redis**: localhost:6379

### Commandes Docker Utiles

```bash
# Arrêter tous les conteneurs
docker-compose down

# Reconstruire les images
docker-compose build

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Accéder au conteneur backend
docker-compose exec backend bash

# Nettoyer les volumes (⚠️ supprime les données)
docker-compose down -v
```

---

## ⚙️ Configuration

### Backend (.env)

```env
APP_NAME="Gestion Hospitalière"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=hospital_db
DB_USERNAME=hospital_user
DB_PASSWORD=secure_password

# Mail (Production)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@hospital.com
MAIL_FROM_NAME="${APP_NAME}"

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,votre-domaine.com
SESSION_DOMAIN=.votre-domaine.com
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://api.votre-domaine.com
REACT_APP_NAME="Gestion Hospitalière"
```

---

## 🗄️ Migration de la Base de Données

### Créer une nouvelle migration

```bash
php artisan make:migration create_example_table
```

### Exécuter les migrations

```bash
# Toutes les migrations
php artisan migrate

# Avec seed
php artisan migrate --seed

# Rollback de la dernière migration
php artisan migrate:rollback

# Reset complet
php artisan migrate:fresh
```

### Seeders

```bash
# Créer un seeder
php artisan make:seeder ExampleSeeder

# Exécuter un seeder spécifique
php artisan db:seed --class=ExampleSeeder
```

---

## 🧪 Tests

### Backend (PHPUnit)

```bash
# Tous les tests
php artisan test

# Tests spécifiques
php artisan test --filter=PatientTest

# Avec couverture de code
php artisan test --coverage
```

### Frontend (Jest)

```bash
# Tous les tests
npm test

# Mode watch
npm test -- --watch

# Couverture
npm test -- --coverage
```

---

## 🚀 Déploiement en Production

### 1. Préparation du Serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql \
    php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-zip \
    nodejs npm git certbot python3-certbot-nginx
```

### 2. Configuration Nginx

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;
    root /var/www/hospital/gestion-hospitaliere-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 3. SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d api.votre-domaine.com
sudo certbot --nginx -d votre-domaine.com
```

### 4. Optimisations Laravel

```bash
# Cache des configurations
php artisan config:cache

# Cache des routes
php artisan route:cache

# Cache des vues
php artisan view:cache

# Optimisation de l'autoloader
composer install --optimize-autoloader --no-dev
```

### 5. Build Frontend

```bash
cd gestion-hospitaliere-frontend
npm run build

# Copier le build vers Nginx
sudo cp -r build/* /var/www/hospital/frontend/
```

---

## 🔄 Maintenance

### Sauvegardes

```bash
# Backup de la base de données
mysqldump -u hospital_user -p hospital_db > backup_$(date +%Y%m%d).sql

# Backup des fichiers uploadés
tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/app/public
```

### Mise à jour

```bash
# Backend
git pull origin main
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd gestion-hospitaliere-frontend
git pull origin main
npm install
npm run build
```

### Logs

```bash
# Voir les logs Laravel
tail -f storage/logs/laravel.log

# Nettoyer les logs
php artisan log:clear

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 Dépannage

### Problème: Erreur 500 Backend

**Solution:**
```bash
# Vérifier les permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Vérifier les logs
tail -f storage/logs/laravel.log
```

### Problème: CORS Errors

**Solution:** Vérifier `config/cors.php`
```php
'allowed_origins' => ['http://localhost:3000', 'https://votre-domaine.com'],
```

### Problème: Connexion à la base de données

**Solution:**
```bash
# Tester la connexion
php artisan tinker
>>> DB::connection()->getPdo();
```

### Problème: Queue non traitée

**Solution:**
```bash
# Redémarrer le worker
php artisan queue:restart

# Vérifier les jobs échoués
php artisan queue:failed

# Réessayer les jobs échoués
php artisan queue:retry all
```

---

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@hospital.com
- 📖 Documentation: https://docs.hospital.com
- 🐛 Issues: https://github.com/hospital/issues

---

## ✅ Checklist de Production

- [ ] Variables d'environnement configurées
- [ ] APP_DEBUG=false
- [ ] SSL/HTTPS activé
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring mis en place
- [ ] Rate limiting activé
- [ ] CORS correctement configuré
- [ ] Logs rotatifs configurés
- [ ] Queue workers en cours d'exécution
- [ ] Emails de production configurés
- [ ] Firewall configuré
- [ ] Tests passés avec succès

---

**Version:** 1.0.0  
**Dernière mise à jour:** Octobre 2025
