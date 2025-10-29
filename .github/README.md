# 🚀 Pipeline CI/CD - Gestion Hospitalière

## 📋 Vue d'Ensemble

Ce dossier contient la configuration complète du pipeline CI/CD pour le projet de gestion hospitalière, utilisant **GitHub Actions** pour l'automatisation des tests, builds et déploiements.

## 🔧 Workflows Configurés

### 1. `ci-cd.yml` - Pipeline Principal
**Déclencheurs :** Push sur `main`/`develop`, Pull Requests vers `main`

**Étapes :**
- ✅ Tests Backend (Laravel + PHPUnit)
- ✅ Tests Frontend (React + Jest)
- ✅ Build des images Docker
- ✅ Déploiement automatique

**Services :** MySQL 8.0, Redis Alpine

### 2. `security-quality.yml` - Sécurité & Qualité
**Déclencheurs :** Push, PR, Planification (lundis 2h)

**Analyses :**
- 🔍 Audit de sécurité PHP (Security Checker)
- 🔍 Analyse statique (PHPStan)
- 🔍 Audit npm (vulnérabilités frontend)
- 🔍 Scan SonarCloud
- 🔍 Détection de secrets (TruffleHog)

### 3. `deploy.yml` - Déploiement Multi-Environnements
**Environnements :**
- 🟡 **Staging** (branche `develop`)
- 🟢 **Production** (branche `main`)
- 🏷️ **Releases** (tags `v*`)

**Fonctionnalités :**
- Backup automatique avant déploiement
- Rolling updates
- Health checks
- Rollback automatique en cas d'échec
- Notifications Slack

## 🏗️ Architecture du Pipeline

```mermaid
graph TD
    A[Push Code] --> B{Branch?}
    B -->|develop| C[Tests + Build]
    B -->|main| D[Tests + Build + Security]
    C --> E[Deploy Staging]
    D --> F[Deploy Production]
    E --> G[Health Check]
    F --> H[Health Check + Backup]
    G --> I[✅ Success]
    H --> J{Success?}
    J -->|Yes| K[✅ Production Live]
    J -->|No| L[🔄 Rollback]
```

## 📊 Métriques et Monitoring

### Coverage de Code
- **Backend :** PHPUnit avec Xdebug
- **Frontend :** Jest coverage
- **Seuils :** 80% minimum

### Sécurité
- **Dépendances :** Audit automatique
- **Code :** Analyse statique
- **Secrets :** Scan TruffleHog
- **Qualité :** SonarCloud

### Performance
- **Build Time :** ~5-8 minutes
- **Deploy Time :** ~2-3 minutes
- **Health Check :** 30 secondes

## 🔐 Secrets Requis

### Docker Registry
```
DOCKER_USERNAME=username
DOCKER_PASSWORD=token_or_password
```

### Déploiement SSH
```
STAGING_HOST=staging.example.com
STAGING_USER=deploy
STAGING_SSH_KEY=-----BEGIN PRIVATE KEY-----

PRODUCTION_HOST=prod.example.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=-----BEGIN PRIVATE KEY-----
```

### Services Externes
```
SONAR_TOKEN=sonar_project_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## 🚦 Status Badges

Ajoutez ces badges à votre README principal :

```markdown
![CI/CD](https://github.com/adamakonfe/gestion_hopital/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/adamakonfe/gestion_hopital/workflows/Security%20&%20Quality%20Checks/badge.svg)
![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=adamakonfe_gestion_hopital&metric=alert_status)
![Coverage](https://sonarcloud.io/api/project_badges/measure?project=adamakonfe_gestion_hopital&metric=coverage)
```

## 🛠️ Commandes Utiles

### Test Local du Pipeline
```bash
# Rendre le script exécutable
chmod +x scripts/deploy-local.sh

# Test en mode staging
./scripts/deploy-local.sh staging

# Test en mode production (sans tests)
SKIP_TESTS=true ./scripts/deploy-local.sh production
```

### Debugging
```bash
# Voir les logs d'un workflow
gh run list
gh run view <run-id>

# Relancer un workflow
gh workflow run ci-cd.yml

# Voir le statut des environnements
gh api repos/adamakonfe/gestion_hopital/environments
```

## 📈 Optimisations Futures

### Performance
- [ ] Cache des dépendances Composer/npm
- [ ] Parallélisation des tests
- [ ] Optimisation des images Docker

### Sécurité
- [ ] Scan des images Docker (Trivy)
- [ ] Tests de pénétration automatisés
- [ ] Rotation automatique des secrets

### Monitoring
- [ ] Intégration Prometheus/Grafana
- [ ] Alertes personnalisées
- [ ] Métriques business

## 🆘 Dépannage

### Problèmes Courants

1. **Tests qui échouent**
   ```bash
   # Vérifier localement
   docker-compose exec backend php artisan test
   ```

2. **Échec de déploiement SSH**
   ```bash
   # Tester la connexion
   ssh -i ~/.ssh/deploy_key user@server
   ```

3. **Images Docker non trouvées**
   ```bash
   # Vérifier les credentials
   docker login
   ```

### Logs Utiles
- **GitHub Actions :** Onglet Actions du repository
- **SonarCloud :** Dashboard du projet
- **Serveur :** `journalctl -u docker`

---

## 📞 Support

Pour toute question sur le pipeline CI/CD :
1. Consultez la [documentation complète](../docs/CI-CD-SETUP.md)
2. Vérifiez les [issues GitHub](https://github.com/adamakonfe/gestion_hopital/issues)
3. Contactez l'équipe DevOps
