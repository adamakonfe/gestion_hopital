#!/bin/bash

# Script de démarrage du système de monitoring
# Usage: ./scripts/start-monitoring.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

# Démarrage de l'application principale
start_main_application() {
    log_info "Démarrage de l'application principale..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si l'application principale est déjà en cours d'exécution
    if docker-compose ps | grep -q "Up"; then
        log_success "Application principale déjà en cours d'exécution"
    else
        log_info "Démarrage de l'application principale..."
        docker-compose up -d
        
        # Attendre que les services soient prêts
        log_info "Attente du démarrage des services..."
        sleep 30
    fi
}

# Démarrage du système de monitoring
start_monitoring() {
    log_info "Démarrage du système de monitoring..."
    
    cd "$PROJECT_ROOT"
    
    # Créer les répertoires nécessaires
    mkdir -p monitoring/prometheus/data
    mkdir -p monitoring/grafana/data
    mkdir -p monitoring/alertmanager/data
    
    # Définir les permissions
    sudo chown -R 472:472 monitoring/grafana/data 2>/dev/null || true
    sudo chown -R 65534:65534 monitoring/prometheus/data 2>/dev/null || true
    sudo chown -R 65534:65534 monitoring/alertmanager/data 2>/dev/null || true
    
    # Démarrer les services de monitoring
    docker-compose -f docker-compose.monitoring.yml up -d
    
    log_success "Services de monitoring démarrés"
}

# Vérification de l'état des services
check_services() {
    log_info "Vérification de l'état des services..."
    
    # Attendre que les services soient prêts
    sleep 60
    
    # Vérifier Prometheus
    if curl -f http://localhost:9090/-/healthy &> /dev/null; then
        log_success "✅ Prometheus: http://localhost:9090"
    else
        log_warning "⚠️ Prometheus non accessible"
    fi
    
    # Vérifier Grafana
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "✅ Grafana: http://localhost:3001 (admin/admin123)"
    else
        log_warning "⚠️ Grafana non accessible"
    fi
    
    # Vérifier AlertManager
    if curl -f http://localhost:9093/-/healthy &> /dev/null; then
        log_success "✅ AlertManager: http://localhost:9093"
    else
        log_warning "⚠️ AlertManager non accessible"
    fi
    
    # Vérifier les métriques de l'application
    if curl -f http://localhost:8000/api/metrics &> /dev/null; then
        log_success "✅ Métriques application disponibles"
    else
        log_warning "⚠️ Métriques application non disponibles"
    fi
}

# Affichage des informations d'accès
show_access_info() {
    log_info "=== SYSTÈME DE MONITORING DÉMARRÉ ==="
    echo ""
    log_success "🔍 Prometheus (Métriques): http://localhost:9090"
    log_success "📊 Grafana (Dashboards): http://localhost:3001"
    log_success "   └── Identifiants: admin / admin123"
    log_success "🚨 AlertManager (Alertes): http://localhost:9093"
    log_success "📈 Node Exporter: http://localhost:9100"
    log_success "🐳 cAdvisor: http://localhost:8080"
    echo ""
    log_info "📋 Dashboards Grafana disponibles:"
    log_info "   - Hospital Management - Vue d'ensemble"
    log_info "   - Métriques système (CPU, Mémoire, Disque)"
    log_info "   - Métriques application (API, Base de données)"
    echo ""
    log_info "🔧 Pour arrêter le monitoring:"
    log_info "   docker-compose -f docker-compose.monitoring.yml down"
    echo ""
}

# Configuration post-démarrage
post_setup() {
    log_info "Configuration post-démarrage..."
    
    # Attendre que Grafana soit complètement démarré
    log_info "Attente du démarrage complet de Grafana..."
    for i in {1..30}; do
        if curl -f http://localhost:3001/api/health &> /dev/null; then
            break
        fi
        sleep 2
    done
    
    # Importer des dashboards supplémentaires (optionnel)
    # curl -X POST http://admin:admin123@localhost:3001/api/dashboards/db \
    #   -H "Content-Type: application/json" \
    #   -d @monitoring/grafana/dashboards/additional-dashboard.json
    
    log_success "Configuration terminée"
}

# Fonction principale
main() {
    log_info "🚀 Démarrage du système de monitoring pour l'hôpital"
    
    check_requirements
    start_main_application
    start_monitoring
    check_services
    post_setup
    show_access_info
    
    log_success "🎉 Système de monitoring opérationnel !"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du démarrage du monitoring"; exit 1' ERR

# Exécution
main "$@"
