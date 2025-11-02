# GitHub Actions Workflows

## 🚀 Workflows Actifs

### `ci-simple.yml` - Workflow Principal
- **Tests Backend** Laravel avec PHPUnit
- **Tests Frontend** React avec Jest
- **Validation Kubernetes** des manifests YAML
- **Validation PowerShell** des scripts
- **Pas de secrets requis** - Fonctionne immédiatement

### `security-quality.yml` - Analyse de Sécurité
- **CodeQL** pour analyse de sécurité
- **Dependency Review** pour les vulnérabilités
- **Secret Scanning** pour détecter les secrets

## 🔧 Workflows de Déploiement (Désactivés)

### `ci-cd.yml` - Pipeline Complet (Désactivé)
- Workflow complet avec build Docker et déploiement
- **Nécessite des secrets** : DOCKER_USERNAME, DOCKER_PASSWORD, etc.
- Désactivé temporairement pour éviter les échecs

### `deploy.yml` - Déploiement Production (Désactivé)
- Déploiement automatique vers production
- **Nécessite configuration serveur**
- À activer quand l'infrastructure est prête

## 📋 Comment Activer les Workflows Avancés

1. **Configurer les secrets GitHub** :
   - `DOCKER_USERNAME` : Nom d'utilisateur Docker Hub
   - `DOCKER_PASSWORD` : Token Docker Hub
   - `DEPLOY_HOST` : Serveur de déploiement
   - `DEPLOY_USER` : Utilisateur SSH
   - `DEPLOY_KEY` : Clé privée SSH

2. **Réactiver les workflows** :
   - Décommenter les triggers dans `ci-cd.yml`
   - Configurer l'environnement de production

## 🎯 Statut Actuel

- ✅ **Tests automatiques** : Fonctionnels
- ✅ **Validation code** : Fonctionnelle
- ⏳ **Build Docker** : En attente de configuration
- ⏳ **Déploiement** : En attente de configuration
