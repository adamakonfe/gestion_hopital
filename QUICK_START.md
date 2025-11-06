# 🚀 Quick Start - Déploiement Kubernetes

## ⚡ Installation en 5 Minutes

### 1️⃣ Démarrer Minikube
```powershell
minikube start --driver=docker --memory=4096 --cpus=2
```

### 2️⃣ Build et Charger les Images
```powershell
docker build -f Dockerfile.backend -t savlong/hospital-backend:latest .
docker build -f Dockerfile.frontend -t savlong/hospital-frontend:latest .
minikube image load savlong/hospital-backend:latest
minikube image load savlong/hospital-frontend:latest
```

### 3️⃣ Déployer l'Application
```powershell
# Infrastructure
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap-nginx-backend.yaml
kubectl apply -f k8s/configmap-nginx-frontend.yaml

# Base de données
kubectl apply -f k8s/mysql-statefulset.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml

# Attendre MySQL
kubectl wait --for=condition=ready pod -l app=mysql -n hospital --timeout=120s

# Application
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Monitoring
kubectl apply -f k8s/metrics-exporter-deployment.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl create configmap grafana-dashboards --from-file=grafana/dashboards/ -n hospital
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-service.yaml
```

### 4️⃣ Initialiser la Base de Données
```powershell
kubectl wait --for=condition=ready pod -l app=backend -n hospital --timeout=120s
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan migrate:fresh --seed --force
```

### 5️⃣ Configurer le Port-Forwarding
```powershell
# Tuer les processus existants
taskkill /IM kubectl.exe /F 2>$null

# Lancer les port-forwards
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n hospital service/frontend 3000:80"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n hospital service/grafana 3001:3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n hospital service/prometheus 9091:9090"
```

## 🎯 Accès aux Services

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | admin@hospital.com / password |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9091 | - |

## 🔧 Commandes Utiles

### Voir l'état des pods
```powershell
kubectl get pods -n hospital
```

### Voir les logs
```powershell
kubectl logs -n hospital deployment/backend -c php-fpm --tail=50
kubectl logs -n hospital deployment/frontend --tail=50
```

### Redémarrer un service
```powershell
kubectl rollout restart deployment/backend -n hospital
kubectl rollout restart deployment/frontend -n hospital
```

### Nettoyer tout
```powershell
kubectl delete namespace hospital
minikube delete
```

## ⚠️ Problèmes Courants

### Erreur 405/502 lors de la connexion
```powershell
kubectl delete configmap frontend-nginx-conf -n hospital
kubectl apply -f k8s/configmap-nginx-frontend.yaml
kubectl delete pod -n hospital -l app=frontend
```

### Port déjà utilisé
```powershell
taskkill /IM kubectl.exe /F
Start-Sleep -Seconds 2
kubectl port-forward -n hospital service/frontend 3000:80
```

### Réinitialiser la base de données
```powershell
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan migrate:fresh --seed --force
```

## 📊 Dashboards Grafana

Trois dashboards sont disponibles :
1. **Hospital Application Metrics** - Métriques applicatives (utilisateurs, patients, médecins)
2. **Hospital Overview** - Vue d'ensemble (rendez-vous, prescriptions, factures, lits)
3. **System Metrics** - Métriques système (CPU, mémoire, réseau, uptime)

Attendez 30 secondes après le déploiement pour que les métriques soient collectées.

## 🎉 C'est Prêt !

Votre application est maintenant déployée et accessible sur http://localhost:3000 !
