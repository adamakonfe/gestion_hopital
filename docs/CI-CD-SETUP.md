# Configuration CI/CD - Gestion Hospitalière

## 🚀 Pipeline CI/CD Mis en Place

Ce projet utilise **GitHub Actions** pour l'intégration continue et le déploiement continu avec les workflows suivants :

### 📋 Workflows Disponibles

1. **`ci-cd.yml`** - Pipeline principal (tests, build, déploiement)
2. **`security-quality.yml`** - Analyse de sécurité et qualité du code
3. **`deploy.yml`** - Déploiement multi-environnements

## 🔧 Configuration Requise

### 1. Secrets GitHub à Configurer

Allez dans **Settings > Secrets and variables > Actions** de votre dépôt GitHub et ajoutez :

#### 🐳 Docker Hub (optionnel)
```
DOCKER_USERNAME=votre_username_dockerhub
DOCKER_PASSWORD=votre_token_dockerhub
```

#### 🖥️ Serveurs de Déploiement
```
# Staging
STAGING_HOST=ip_ou_domaine_staging
STAGING_USER=username_ssh
STAGING_SSH_KEY=cle_privee_ssh_staging

# Production
PRODUCTION_HOST=ip_ou_domaine_production
PRODUCTION_USER=username_ssh
PRODUCTION_SSH_KEY=cle_privee_ssh_production
```

#### 🔍 Analyse de Code (SonarCloud)
```
SONAR_TOKEN=votre_token_sonarcloud
```

#### 📢 Notifications (optionnel)
```
SLACK_WEBHOOK_URL=webhook_slack_pour_notifications
```

### 2. Variables d'Environnement

#### Pour les Environnements GitHub
```
# Staging
DB_HOST_STAGING=localhost
DB_DATABASE_STAGING=hospital_staging_db
DB_USERNAME_STAGING=hospital_user
DB_PASSWORD_STAGING=mot_de_passe_securise

# Production
DB_HOST_PRODUCTION=localhost
DB_DATABASE_PRODUCTION=hospital_production_db
DB_USERNAME_PRODUCTION=hospital_user
DB_PASSWORD_PRODUCTION=mot_de_passe_tres_securise
```

## 🏗️ Structure des Environnements

### 📊 Environnements Configurés

1. **Development** (local) - `docker-compose.yml`
2. **Staging** - `docker-compose.staging.yml` (branche `develop`)
3. **Production** - `docker-compose.production.yml` (branche `main`)

### 🔄 Flux de Déploiement

```mermaid
graph LR
    A[Développement Local] --> B[Push vers develop]
    B --> C[Tests CI/CD]
    C --> D[Déploiement Staging]
    D --> E[Tests d'Intégration]
    E --> F[Merge vers main]
    F --> G[Déploiement Production]
```

## 📝 Étapes de Configuration

### 1. Configuration SonarCloud (Recommandé)

1. Allez sur [SonarCloud.io](https://sonarcloud.io)
2. Connectez votre compte GitHub
3. Importez le projet `adamakonfe/gestion_hopital`
4. Récupérez le token et ajoutez-le aux secrets GitHub

### 2. Préparation des Serveurs

#### Serveur Staging
```bash
# Créer le répertoire de l'application
sudo mkdir -p /opt/hospital-app-staging
cd /opt/hospital-app-staging

# Cloner le dépôt
git clone https://github.com/adamakonfe/gestion_hopital.git .

# Créer le fichier docker-compose.staging.yml
cp docker-compose.yml docker-compose.staging.yml

# Configurer les variables d'environnement
cp .env.example .env.staging
# Éditer .env.staging avec les bonnes valeurs
```

#### Serveur Production
```bash
# Créer le répertoire de l'application
sudo mkdir -p /opt/hospital-app-production
cd /opt/hospital-app-production

# Cloner le dépôt
git clone https://github.com/adamakonfe/gestion_hopital.git .

# Créer le fichier docker-compose.production.yml
cp docker-compose.yml docker-compose.production.yml

# Configurer les variables d'environnement
cp .env.example .env.production
# Éditer .env.production avec les bonnes valeurs
```

### 3. Configuration SSH

#### Générer une clé SSH pour le déploiement
```bash
# Sur votre machine locale
ssh-keygen -t rsa -b 4096 -C "deploy@hospital-app"

# Copier la clé publique sur les serveurs
ssh-copy-id -i ~/.ssh/deploy_key.pub user@staging-server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@production-server
```

#### Ajouter la clé privée aux secrets GitHub
```bash
# Copier le contenu de la clé privée
cat ~/.ssh/deploy_key

# Ajouter ce contenu aux secrets :
# STAGING_SSH_KEY et PRODUCTION_SSH_KEY
```

## 🔍 Monitoring et Logs

### Vérification des Déploiements

#### Staging
```bash
# Vérifier l'état des conteneurs
docker-compose -f docker-compose.staging.yml ps

# Voir les logs
docker-compose -f docker-compose.staging.yml logs -f
```

#### Production
```bash
# Vérifier l'état des conteneurs
docker-compose -f docker-compose.production.yml ps

# Voir les logs
docker-compose -f docker-compose.production.yml logs -f
```

### Health Checks

Le pipeline inclut des vérifications de santé automatiques :
- ✅ Tests unitaires et d'intégration
- ✅ Analyse de sécurité
- ✅ Vérification des dépendances
- ✅ Tests de déploiement
- ✅ Rollback automatique en cas d'échec

## 🚨 Dépannage

### Problèmes Courants

1. **Échec des tests** : Vérifiez les logs dans l'onglet Actions
2. **Problème de connexion SSH** : Vérifiez les clés et les permissions
3. **Erreur de base de données** : Vérifiez les variables d'environnement
4. **Images Docker non trouvées** : Vérifiez les credentials Docker Hub

### Commandes Utiles

```bash
# Redémarrer un déploiement manuellement
docker-compose down && docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f backend

# Exécuter les migrations manuellement
docker-compose exec backend php artisan migrate

# Nettoyer les images Docker
docker system prune -f
```

## 📈 Métriques et Rapports

- **Coverage de code** : Disponible dans SonarCloud
- **Sécurité** : Rapports automatiques des vulnérabilités
- **Performance** : Monitoring via les logs Docker
- **Uptime** : Vérifications de santé automatiques

---

## 🎯 Prochaines Étapes

1. [ ] Configurer les secrets GitHub
2. [ ] Préparer les serveurs de staging/production
3. [ ] Tester le pipeline sur une branche de test
4. [ ] Configurer SonarCloud
5. [ ] Mettre en place les notifications Slack
6. [ ] Documenter les procédures de rollback
