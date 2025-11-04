# Guide de Déploiement CI/CD Amélioré

## 🚀 Fonctionnalités du Pipeline Amélioré

### 1. **Analyse de Sécurité et Qualité**
- **Trivy** : Scan de vulnérabilités des dépendances
- **PHPStan** : Analyse statique du code PHP
- **ESLint** : Analyse du code JavaScript/React
- **Upload automatique** vers GitHub Security tab

### 2. **Tests Multi-Versions**
- **Backend** : Tests sur PHP 8.1, 8.2, 8.3
- **Frontend** : Tests sur Node.js 16, 18, 20
- **Couverture de code** avec Codecov
- **Tests d'intégration E2E** avec Playwright

### 3. **Tests de Performance**
- **K6** pour les tests de charge
- **Métriques de performance** automatiques
- **Seuils configurables** (95% < 500ms, erreurs < 10%)

### 4. **Déploiement Avancé**
- **Blue-Green Deployment** en production
- **Déploiement automatique** staging sur `develop`
- **Déploiement manuel** via workflow_dispatch
- **Smoke tests** post-déploiement

### 5. **Notifications et Monitoring**
- **Slack** notifications
- **Rapports de déploiement** automatiques
- **Artefacts** conservés (logs, rapports, coverage)

## 🔧 Configuration Requise

### Secrets GitHub à configurer

```bash
# Docker/Registry
DOCKER_USERNAME          # Nom d'utilisateur Docker Hub
DOCKER_PASSWORD          # Mot de passe Docker Hub
GITHUB_TOKEN             # Token GitHub (auto-généré)

# Kubernetes
KUBE_CONFIG_STAGING      # Config Kubernetes staging (base64)
KUBE_CONFIG_PRODUCTION   # Config Kubernetes production (base64)

# Déploiement SSH (optionnel)
DEPLOY_HOST              # Serveur de déploiement
DEPLOY_USER              # Utilisateur SSH
DEPLOY_KEY               # Clé privée SSH

# Notifications
SLACK_WEBHOOK_URL        # Webhook Slack pour notifications
```

### Variables d'environnement

```yaml
# Dans .github/workflows/enhanced-ci-cd.yml
env:
  NODE_VERSION: '18'
  PHP_VERSION: '8.2'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

## 📋 Commandes pour Configurer les Secrets

### 1. Générer la config Kubernetes en base64

```bash
# Pour staging
cat ~/.kube/config-staging | base64 -w 0

# Pour production  
cat ~/.kube/config-production | base64 -w 0
```

### 2. Ajouter les secrets via GitHub CLI

```bash
# Secrets Docker
gh secret set DOCKER_USERNAME --body "votre-username"
gh secret set DOCKER_PASSWORD --body "votre-password"

# Secrets Kubernetes
gh secret set KUBE_CONFIG_STAGING --body "$(cat ~/.kube/config-staging | base64 -w 0)"
gh secret set KUBE_CONFIG_PRODUCTION --body "$(cat ~/.kube/config-production | base64 -w 0)"

# Webhook Slack
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/..."
```

### 3. Ou via l'interface GitHub

1. Aller dans **Settings → Secrets and variables → Actions**
2. Cliquer sur **New repository secret**
3. Ajouter chaque secret individuellement

## 🎯 Déclencheurs du Pipeline

### Automatiques
- **Push** sur `main` → Tests + Build + Déploiement Production
- **Push** sur `develop` → Tests + Build + Déploiement Staging  
- **Push** sur `feature/*` → Tests uniquement
- **Pull Request** → Tests complets

### Manuels
```bash
# Déclencher un déploiement manuel
gh workflow run enhanced-ci-cd.yml \
  -f deploy_environment=staging \
  -f skip_tests=false
```

## 🔍 Monitoring et Debugging

### Voir les logs du pipeline
```bash
# Lister les runs
gh run list --workflow=enhanced-ci-cd.yml

# Voir les logs d'un run
gh run view <run-id> --log
```

### Artefacts générés
- **Coverage reports** (backend + frontend)
- **Performance results** (K6 JSON)
- **E2E test results** (Playwright HTML)
- **Deployment reports** (Markdown)
- **Security scan results** (SARIF)

## 🚦 Environnements

### Staging
- **Branch** : `develop`
- **URL** : https://staging.hospital-app.com
- **Auto-deploy** : Oui
- **Tests E2E** : Oui

### Production  
- **Branch** : `main`
- **URL** : https://hospital-app.com
- **Auto-deploy** : Oui (après tests de performance)
- **Blue-Green** : Oui
- **Smoke tests** : Oui

## 📊 Métriques et Seuils

### Tests de Performance (K6)
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'], // 95% < 500ms
  http_req_failed: ['rate<0.1'],    // Erreurs < 10%
  errors: ['rate<0.1'],             // Erreurs métier < 10%
}
```

### Couverture de Code
- **Backend** : Minimum 80%
- **Frontend** : Recommandé 70%

### Tests E2E
- **Navigateurs** : Chrome, Firefox, Safari
- **Mobile** : iOS Safari, Android Chrome
- **Retry** : 2 fois en cas d'échec

## 🔄 Workflow de Développement Recommandé

1. **Feature Branch** → Tests automatiques
2. **Pull Request** → Tests complets + Review
3. **Merge vers `develop`** → Déploiement Staging
4. **Tests manuels** sur Staging
5. **Merge vers `main`** → Déploiement Production

## 🛠️ Dépannage

### Pipeline échoue sur les tests
```bash
# Voir les logs détaillés
gh run view --log

# Relancer uniquement les tests
gh workflow run enhanced-ci-cd.yml -f skip_tests=false
```

### Déploiement échoue
```bash
# Vérifier les secrets Kubernetes
kubectl config current-context

# Vérifier les images Docker
docker pull ghcr.io/votre-repo/backend:latest
```

### Tests E2E échouent
```bash
# Lancer localement
npx playwright test --config=e2e/playwright.config.js

# Debug mode
npx playwright test --debug
```

## 📈 Améliorations Futures

- [ ] **Canary Deployments**
- [ ] **Feature Flags** intégration
- [ ] **Database migrations** automatiques
- [ ] **Rollback** automatique
- [ ] **Multi-cloud** deployment
- [ ] **Infrastructure as Code** (Terraform)
- [ ] **Monitoring** avancé (Datadog, New Relic)

## 🔗 Liens Utiles

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Testing](https://playwright.dev/)
- [K6 Load Testing](https://k6.io/docs/)
- [Trivy Security Scanner](https://trivy.dev/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
