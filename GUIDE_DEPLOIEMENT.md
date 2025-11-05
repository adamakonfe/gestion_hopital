# 🚀 Guide de Déploiement

> **Docker, Kubernetes, CI/CD - Déploiement en production**

## 📋 Vue d'Ensemble

Ce guide couvre tous les aspects du déploiement de l'application de gestion hospitalière, du développement local à la production avec haute disponibilité.

## 🐳 Déploiement Docker

### Environnement de Développement

```bash
# Configuration rapide
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital

# Configuration backend
cd gestion-hospitaliere-backend
cp .env.example .env
cd ..

# Lancement complet
docker-compose up -d

# Installation et migration
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan storage:link
```

### Environnement de Production

#### 1. Configuration Production

```bash
# Fichier .env.production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

DB_CONNECTION=mysql
DB_HOST=mysql-prod
DB_PORT=3306
DB_DATABASE=gestion_hopital_prod
DB_USERNAME=hospital_user
DB_PASSWORD=secure_password_here

REDIS_HOST=redis-prod
REDIS_PASSWORD=redis_secure_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-domaine.com
MAIL_PORT=587
MAIL_USERNAME=noreply@votre-domaine.com
MAIL_PASSWORD=mail_password
```

#### 2. Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./gestion-hospitaliere-backend
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
    volumes:
      - ./storage:/var/www/storage
    networks:
      - hospital-network
    restart: unless-stopped

  frontend:
    build:
      context: ./gestion-hospitaliere-frontend
      dockerfile: Dockerfile.prod
    networks:
      - hospital-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - hospital-network
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/prod.cnf:/etc/mysql/conf.d/prod.cnf
    networks:
      - hospital-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - hospital-network
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:

networks:
  hospital-network:
    driver: bridge
```

#### 3. Dockerfile Production (Backend)

```dockerfile
# Dockerfile.prod (Backend)
FROM php:8.2-fpm-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client

# Installation des extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration du répertoire de travail
WORKDIR /var/www

# Copie des fichiers de l'application
COPY . .

# Installation des dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Configuration des permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

# Optimisations Laravel
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 9000

CMD ["php-fpm"]
```

#### 4. Dockerfile Production (Frontend)

```dockerfile
# Dockerfile.prod (Frontend)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 5. Configuration Nginx Production

```nginx
# nginx/prod.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:9000;
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name votre-domaine.com;
        return 301 https://$server_name$request_uri;
    }

    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name votre-domaine.com;

        # Certificats SSL
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Frontend React
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API Laravel
        location /api {
            try_files $uri $uri/ /index.php?$query_string;
            
            location ~ \.php$ {
                fastcgi_pass backend;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
            }
        }

        # Fichiers statiques
        location /storage {
            alias /var/www/storage/app/public;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 6. Déploiement Production

```bash
# 1. Préparation de l'environnement
cp .env.example .env.production
# Éditer .env.production avec les valeurs de production

# 2. Build et déploiement
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Configuration initiale
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec backend php artisan db:seed --force

# 4. Optimisations
docker-compose -f docker-compose.prod.yml exec backend php artisan optimize
```

## ☸️ Déploiement Kubernetes

### 1. Configuration Minikube (Développement)

```bash
# Installation et démarrage Minikube
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable ingress

# Configuration de l'environnement Docker
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build des images dans Minikube
docker build -f Dockerfile.backend -t gestion-hopital-backend:latest .
docker build -f Dockerfile.frontend -t gestion-hopital-frontend:latest .
```

### 2. Manifestes Kubernetes

#### Namespace
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: hospital
```

#### ConfigMap
```yaml
# k8s/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: hospital
data:
  APP_ENV: "production"
  DB_CONNECTION: "mysql"
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DB_DATABASE: "gestion_hopital"
  REDIS_HOST: "redis-service"
```

#### Secrets
```yaml
# k8s/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: hospital
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ=  # base64 encoded
  REDIS_PASSWORD: cmVkaXNwYXNz  # base64 encoded
  APP_KEY: YmFzZTY0OmFiY2RlZmc=  # base64 encoded
```

#### MySQL Deployment
```yaml
# k8s/mysql-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: hospital
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DB_PASSWORD
        - name: MYSQL_DATABASE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DB_DATABASE
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
  namespace: hospital
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
```

#### Backend Deployment
```yaml
# k8s/backend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: hospital
spec:
  replicas: 3
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
        imagePullPolicy: Never
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        ports:
        - containerPort: 9000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          tcpSocket:
            port: 9000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          tcpSocket:
            port: 9000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: hospital
spec:
  selector:
    app: backend
  ports:
  - port: 9000
    targetPort: 9000
```

#### Frontend Deployment
```yaml
# k8s/frontend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: hospital
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: react-app
        image: gestion-hopital-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: hospital
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

#### Ingress
```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hospital-ingress
  namespace: hospital
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 9000
```

### 3. Déploiement Kubernetes

```bash
# 1. Créer le namespace et les ressources
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secrets.yml

# 2. Déployer les services
kubectl apply -f k8s/mysql-deployment.yml
kubectl apply -f k8s/redis-deployment.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml

# 3. Configurer l'ingress
kubectl apply -f k8s/ingress.yml

# 4. Migrations initiales
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan migrate --force
kubectl exec -n hospital deployment/backend -c php-fpm -- php artisan db:seed --force

# 5. Accès à l'application
# Ajouter à C:\Windows\System32\drivers\etc\hosts:
# 127.0.0.1 app.local

# Puis accéder via: http://app.local
```

## 🔄 CI/CD avec GitHub Actions

### 1. Workflow Principal

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
        extensions: mbstring, xml, ctype, iconv, intl, pdo_mysql

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: gestion-hospitaliere-frontend/package-lock.json

    - name: Install Backend Dependencies
      run: |
        cd gestion-hospitaliere-backend
        composer install --prefer-dist --no-progress

    - name: Install Frontend Dependencies
      run: |
        cd gestion-hospitaliere-frontend
        npm ci

    - name: Run Backend Tests
      run: |
        cd gestion-hospitaliere-backend
        cp .env.example .env
        php artisan key:generate
        php artisan migrate
        php artisan test

    - name: Run Frontend Tests
      run: |
        cd gestion-hospitaliere-frontend
        npm test -- --coverage --watchAll=false

    - name: Build Frontend
      run: |
        cd gestion-hospitaliere-frontend
        npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ env.DOCKER_USERNAME }}
        password: ${{ env.DOCKER_PASSWORD }}

    - name: Build and Push Backend Image
      uses: docker/build-push-action@v4
      with:
        context: ./gestion-hospitaliere-backend
        file: ./gestion-hospitaliere-backend/Dockerfile.prod
        push: true
        tags: ${{ env.DOCKER_USERNAME }}/gestion-hopital-backend:latest

    - name: Build and Push Frontend Image
      uses: docker/build-push-action@v4
      with:
        context: ./gestion-hospitaliere-frontend
        file: ./gestion-hospitaliere-frontend/Dockerfile.prod
        push: true
        tags: ${{ env.DOCKER_USERNAME }}/gestion-hopital-frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Production Server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/gestion_hopital
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker-compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force
          docker-compose -f docker-compose.prod.yml exec -T backend php artisan optimize
```

### 2. Workflow de Tests

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        php-version: [8.1, 8.2]

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP ${{ matrix.php-version }}
      uses: shivammathur/setup-php@v2
      with:
        php-version: ${{ matrix.php-version }}

    - name: Run Tests
      run: |
        cd gestion-hospitaliere-backend
        composer install
        php artisan test --coverage

  frontend-tests:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16, 18, 20]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Run Tests
      run: |
        cd gestion-hospitaliere-frontend
        npm ci
        npm test -- --coverage
```

## 🔧 Configuration des Secrets

### GitHub Secrets Requis

```bash
# Docker Hub
DOCKER_USERNAME=votre_username
DOCKER_PASSWORD=votre_password

# Serveur de production
PRODUCTION_HOST=votre-serveur.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=-----BEGIN PRIVATE KEY-----...

# Base de données
DB_PASSWORD=mot_de_passe_securise
REDIS_PASSWORD=redis_password_securise

# Application
APP_KEY=base64:votre_cle_application
```

## 📊 Monitoring et Observabilité

### 1. Health Checks

```php
// routes/web.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'services' => [
            'database' => DB::connection()->getPdo() ? 'ok' : 'error',
            'redis' => Redis::ping() ? 'ok' : 'error',
        ]
    ]);
});
```

### 2. Prometheus Metrics

```yaml
# k8s/monitoring.yml
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: hospital
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: hospital
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus
        ports:
        - containerPort: 9090
```

## 🔒 Sécurité en Production

### 1. Certificats SSL

```bash
# Génération avec Let's Encrypt
certbot certonly --webroot -w /var/www/html -d votre-domaine.com

# Configuration automatique du renouvellement
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 2. Firewall et Sécurité

```bash
# Configuration UFW
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban pour la protection SSH
apt install fail2ban
systemctl enable fail2ban
```

## 📈 Optimisations Performance

### 1. Cache Redis

```php
// Configuration cache Laravel
'redis' => [
    'client' => 'phpredis',
    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],
]
```

### 2. CDN et Assets

```nginx
# Configuration CDN
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}
```

---

**🎯 Avec ce guide, votre application de gestion hospitalière est prête pour un déploiement professionnel en production.**