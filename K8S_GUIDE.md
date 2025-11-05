# ☸️ Guide Kubernetes - Gestion Hospitalière

> Guide complet pour déployer l'application sur Kubernetes

---

## 📋 Prérequis

### Outils Nécessaires
- **Kubernetes** 1.28+
- **kubectl** configuré
- **Docker** pour build des images
- **Minikube** (pour développement local)
- **Helm** (optionnel, recommandé)

### Ressources Minimales
- **CPU :** 4 cores
- **RAM :** 8GB
- **Stockage :** 20GB

---

## 🚀 Déploiement Local (Minikube)

### 1. Démarrer Minikube

```bash
# Démarrer Minikube avec ressources suffisantes
minikube start --driver=docker --memory=4096 --cpus=2

# Activer les addons nécessaires
minikube addons enable ingress
minikube addons enable storage-provisioner
minikube addons enable metrics-server
```

### 2. Configurer l'Environnement Docker

```bash
# Configurer Docker pour utiliser le registry Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### 3. Build des Images

```bash
# Build de l'image backend
docker build -f Dockerfile.backend -t gestion-hopital-backend:latest .

# Build de l'image frontend  
docker build -f Dockerfile.frontend -t gestion-hopital-frontend:latest .

# Vérifier les images
docker images | grep gestion-hopital
```

### 4. Déployer l'Application

```bash
# Appliquer tous les manifests
kubectl apply -f k8s/

# Vérifier le déploiement
kubectl get pods -n hospital
kubectl get services -n hospital
```

### 5. Accéder à l'Application

```bash
# Port forwarding pour accès local
kubectl port-forward -n hospital service/frontend 3000:80

# Ou utiliser minikube tunnel (nécessite admin)
minikube tunnel
# Puis accéder via http://app.local
```

---

## 🏗️ Architecture Kubernetes

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: hospital
```

### Services Déployés

| Service | Type | Port | Description |
|---------|------|------|-------------|
| **frontend** | ClusterIP | 80 | Interface React |
| **backend** | ClusterIP | 80 | API Laravel |
| **mysql** | ClusterIP | 3306 | Base de données |
| **redis** | ClusterIP | 6379 | Cache/Queue |
| **grafana** | ClusterIP | 3000 | Monitoring |
| **prometheus** | ClusterIP | 9090 | Métriques |

### Ingress Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hospital-ingress
  namespace: hospital
spec:
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 80
```

---

## 📦 Manifests Kubernetes

### Structure des Fichiers
```
k8s/
├── namespace.yaml              # Namespace hospital
├── configmaps/
│   ├── backend-config.yaml     # Configuration Laravel
│   ├── frontend-config.yaml    # Configuration React
│   └── nginx-config.yaml       # Configuration Nginx
├── secrets/
│   ├── mysql-secret.yaml       # Credentials MySQL
│   └── app-secret.yaml         # Clés application
├── deployments/
│   ├── backend-deployment.yaml # Déploiement backend
│   ├── frontend-deployment.yaml# Déploiement frontend
│   ├── mysql-statefulset.yaml  # Base de données
│   ├── redis-deployment.yaml   # Cache Redis
│   ├── grafana-deployment.yaml # Monitoring
│   └── prometheus-deployment.yaml
├── services/
│   ├── backend-service.yaml    # Service backend
│   ├── frontend-service.yaml   # Service frontend
│   ├── mysql-service.yaml      # Service MySQL
│   ├── redis-service.yaml      # Service Redis
│   ├── grafana-service.yaml    # Service Grafana
│   └── prometheus-service.yaml
├── ingress.yaml               # Ingress controller
└── volumes/
    ├── mysql-pv.yaml         # Persistent Volume MySQL
    └── storage-pv.yaml       # Persistent Volume fichiers
```

### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: hospital
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: php-fpm
        image: gestion-hopital-backend:latest
        ports:
        - containerPort: 9000
        env:
        - name: DB_HOST
          value: mysql
        - name: REDIS_HOST
          value: redis
        volumeMounts:
        - name: storage
          mountPath: /var/www/storage
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: storage-pvc
      - name: nginx-config
        configMap:
          name: nginx-config
```

---

## 🔧 Configuration

### Variables d'Environnement

#### Backend (.env)
```bash
APP_NAME="Gestion Hospitalière"
APP_ENV=production
APP_KEY=base64:GENERATED_KEY
APP_DEBUG=false
APP_URL=http://app.local

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=gestion_hopital
DB_USERNAME=root
DB_PASSWORD=secure_password

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

#### Frontend (environment.js)
```javascript
window.ENV = {
  API_URL: 'http://app.local/api',
  APP_NAME: 'Gestion Hospitalière',
  ENVIRONMENT: 'production'
};
```

### Secrets Kubernetes
```bash
# Créer les secrets
kubectl create secret generic mysql-secret \
  --from-literal=password=secure_password \
  -n hospital

kubectl create secret generic app-secret \
  --from-literal=app-key=base64:GENERATED_KEY \
  -n hospital
```

---

## 📊 Monitoring

### Prometheus Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: hospital
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'backend'
      static_configs:
      - targets: ['backend:80']
    - job_name: 'mysql'
      static_configs:
      - targets: ['mysql:3306']
```

### Grafana Dashboards
- **System Metrics :** CPU, RAM, Network
- **Application Metrics :** Patients, Médecins, Rendez-vous
- **Database Metrics :** Connexions, Queries, Performance

---

## 🔄 Mise à jour

### Rolling Update
```bash
# Mettre à jour l'image backend
kubectl set image deployment/backend php-fpm=gestion-hopital-backend:v1.1 -n hospital

# Vérifier le rollout
kubectl rollout status deployment/backend -n hospital

# Rollback si nécessaire
kubectl rollout undo deployment/backend -n hospital
```

### Blue-Green Deployment
```bash
# Créer nouvelle version (green)
kubectl apply -f k8s/deployments/backend-deployment-green.yaml

# Tester la nouvelle version
kubectl port-forward service/backend-green 8001:80 -n hospital

# Switcher le trafic
kubectl patch service backend -p '{"spec":{"selector":{"version":"green"}}}' -n hospital

# Supprimer l'ancienne version (blue)
kubectl delete deployment backend-blue -n hospital
```

---

## 💾 Persistance des Données

### MySQL StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: hospital
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### Backup Strategy
```bash
# Backup automatique MySQL
kubectl create cronjob mysql-backup \
  --image=mysql:8.0 \
  --schedule="0 2 * * *" \
  --restart=OnFailure \
  -- /bin/sh -c "mysqldump -h mysql -u root -p\$MYSQL_ROOT_PASSWORD gestion_hopital > /backup/backup-\$(date +%Y%m%d).sql"
```

---

## 🔒 Sécurité

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: hospital-network-policy
  namespace: hospital
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: hospital
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: hospital
```

### RBAC
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: hospital
  name: hospital-admin
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "create", "update", "delete"]
```

---

## 📈 Scaling

### Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: hospital
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Vertical Pod Autoscaler
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: backend-vpa
  namespace: hospital
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  updatePolicy:
    updateMode: "Auto"
```

---

## 🛠️ Dépannage

### Commandes Utiles
```bash
# Vérifier l'état des pods
kubectl get pods -n hospital -o wide

# Voir les logs d'un pod
kubectl logs -f deployment/backend -n hospital

# Exécuter des commandes dans un pod
kubectl exec -it deployment/backend -c php-fpm -n hospital -- bash

# Vérifier les événements
kubectl get events -n hospital --sort-by='.lastTimestamp'

# Décrire un pod problématique
kubectl describe pod <pod-name> -n hospital
```

### Problèmes Courants

#### Pod en CrashLoopBackOff
```bash
# Vérifier les logs
kubectl logs <pod-name> -n hospital --previous

# Vérifier la configuration
kubectl describe pod <pod-name> -n hospital
```

#### Service non accessible
```bash
# Vérifier les endpoints
kubectl get endpoints -n hospital

# Tester la connectivité
kubectl run test-pod --image=busybox -it --rm -- wget -O- http://backend/api/health
```

#### Problèmes de stockage
```bash
# Vérifier les PV/PVC
kubectl get pv,pvc -n hospital

# Vérifier les permissions
kubectl exec -it <pod-name> -n hospital -- ls -la /var/www/storage
```

---

## 🌐 Production

### Recommandations
1. **Utiliser un registry privé** pour les images
2. **Configurer TLS/SSL** avec cert-manager
3. **Mettre en place des backups** automatiques
4. **Configurer le monitoring** avec alertes
5. **Implémenter des health checks** robustes

### Exemple de Health Check
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /api/ready
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

*Guide Kubernetes mis à jour le 5 novembre 2025*
