#!/bin/bash

# Script de déploiement local pour tester le pipeline CI/CD
# Usage: ./scripts/deploy-local.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Déploiement local en mode $ENVIRONMENT"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_requirements() {
    log_info "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis OK"
}

# Tests backend
run_backend_tests() {
    log_info "Exécution des tests backend..."
    
    cd "$PROJECT_ROOT/gestion-hospitaliere-backend"
    
    # Installation des dépendances si nécessaire
    if [ ! -d "vendor" ]; then
        log_info "Installation des dépendances Composer..."
        docker run --rm -v "$(pwd)":/app composer:latest install --no-dev --optimize-autoloader
    fi
    
    # Copie du fichier d'environnement
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log_info "Fichier .env créé"
    fi
    
    # Génération de la clé d'application
    docker-compose exec -T backend php artisan key:generate --force || true
    
    # Exécution des tests
    log_info "Lancement des tests PHPUnit..."
    docker-compose exec -T backend php artisan test --configuration=phpunit.ci.xml || {
        log_error "Les tests backend ont échoué"
        return 1
    }
    
    log_success "Tests backend réussis"
}

# Tests frontend
run_frontend_tests() {
    log_info "Exécution des tests frontend..."
    
    cd "$PROJECT_ROOT/gestion-hospitaliere-frontend"
    
    # Installation des dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances npm..."
        npm ci
    fi
    
    # Linting
    log_info "Vérification du code (ESLint)..."
    npm run lint || {
        log_warning "Problèmes de linting détectés"
    }
    
    # Tests
    log_info "Lancement des tests Jest..."
    npm run test -- --coverage --watchAll=false || {
        log_error "Les tests frontend ont échoué"
        return 1
    }
    
    # Build
    log_info "Build de production..."
    npm run build || {
        log_error "Le build frontend a échoué"
        return 1
    }
    
    log_success "Tests et build frontend réussis"
}

# Build des images Docker
build_docker_images() {
    log_info "Construction des images Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Build backend
    log_info "Build de l'image backend..."
    docker build -f Dockerfile.backend -t hospital-backend:$ENVIRONMENT . || {
        log_error "Échec du build backend"
        return 1
    }
    
    # Build frontend
    log_info "Build de l'image frontend..."
    docker build -f Dockerfile.frontend -t hospital-frontend:$ENVIRONMENT . || {
        log_error "Échec du build frontend"
        return 1
    }
    
    log_success "Images Docker construites"
}

# Déploiement
deploy_application() {
    log_info "Déploiement de l'application..."
    
    cd "$PROJECT_ROOT"
    
    # Arrêt des conteneurs existants
    docker-compose down || true
    
    # Mise à jour des images dans docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.production.yml"
    else
        COMPOSE_FILE="docker-compose.staging.yml"
    fi
    
    # Créer le fichier de composition si nécessaire
    if [ ! -f "$COMPOSE_FILE" ]; then
        cp docker-compose.yml "$COMPOSE_FILE"
        log_info "Fichier $COMPOSE_FILE créé"
    fi
    
    # Démarrage des services
    docker-compose -f "$COMPOSE_FILE" up -d || {
        log_error "Échec du déploiement"
        return 1
    }
    
    # Attendre que les services soient prêts
    log_info "Attente du démarrage des services..."
    sleep 30
    
    # Exécution des migrations
    log_info "Exécution des migrations..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend php artisan migrate --force || {
        log_warning "Échec des migrations"
    }
    
    # Nettoyage des caches
    log_info "Nettoyage des caches..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend php artisan config:clear
    docker-compose -f "$COMPOSE_FILE" exec -T backend php artisan cache:clear
    
    log_success "Application déployée"
}

# Health check
health_check() {
    log_info "Vérification de la santé de l'application..."
    
    # Vérifier que les conteneurs sont en cours d'exécution
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Certains conteneurs ne sont pas en cours d'exécution"
        return 1
    fi
    
    # Test de connectivité
    log_info "Test de connectivité..."
    
    # Backend
    if curl -f http://localhost:8000 > /dev/null 2>&1; then
        log_success "Backend accessible"
    else
        log_error "Backend non accessible"
        return 1
    fi
    
    # Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend accessible"
    else
        log_error "Frontend non accessible"
        return 1
    fi
    
    log_success "Health check réussi"
}

# Nettoyage
cleanup() {
    log_info "Nettoyage des ressources temporaires..."
    
    # Supprimer les images non utilisées
    docker image prune -f > /dev/null 2>&1 || true
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    log_info "Début du déploiement local - Environnement: $ENVIRONMENT"
    
    check_requirements
    
    # Tests
    if [ "$ENVIRONMENT" != "production" ] || [ "${SKIP_TESTS:-false}" != "true" ]; then
        run_backend_tests
        run_frontend_tests
    else
        log_warning "Tests ignorés (SKIP_TESTS=true)"
    fi
    
    # Build et déploiement
    build_docker_images
    deploy_application
    health_check
    cleanup
    
    log_success "🎉 Déploiement local terminé avec succès!"
    log_info "Application accessible sur:"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Backend API: http://localhost:8000"
    log_info "  - MailHog: http://localhost:8025"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du déploiement"; exit 1' ERR

# Exécution
main "$@"
