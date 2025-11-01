# 📊 Système de Monitoring - Gestion Hospitalière

## 🎯 Vue d'Ensemble

Ce système de monitoring complet utilise la stack **Prometheus + Grafana** pour surveiller votre application de gestion hospitalière en temps réel.

## 🚀 Démarrage Rapide

```bash
# Démarrer tout le système de monitoring
./scripts/start-monitoring.sh

# Ou manuellement
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🔗 Accès aux Services

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Grafana** | http://localhost:3001 | admin/admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **AlertManager** | http://localhost:9093 | - |

## 📈 Dashboards Disponibles

### 1. Hospital Management - Vue d'ensemble
- **Patients actifs** en temps réel
- **Taux d'occupation des lits**
- **Rendez-vous du jour**
- **Performance API**

### 2. Système & Infrastructure
- **Usage CPU/Mémoire** par conteneur
- **Trafic réseau**
- **Espace disque**
- **Load average**

### 3. Base de Données
- **Connexions MySQL**
- **Performance des requêtes**
- **Utilisation Redis**
- **Hit rate cache**

## 🚨 Alertes Configurées

### Critiques
- ❌ **Application indisponible**
- ❌ **Base de données down**
- ❌ **Taux d'erreur > 5%**
- ❌ **Lits disponibles < 10%**

### Warnings
- ⚠️ **CPU > 80%**
- ⚠️ **Mémoire > 85%**
- ⚠️ **Temps de réponse > 2s**

## 📊 Métriques Personnalisées

### Métriques Métier
```promql
# Taux d'occupation des lits
(hospital_total_beds - hospital_available_beds) / hospital_total_beds * 100

# Charge patient par heure
rate(hospital_patient_operations[1h])

# Rendez-vous créés aujourd'hui
increase(hospital_appointment_created[24h])
```

### Métriques Techniques
```promql
# Temps de réponse P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taux d'erreur
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100
```

## 🔧 Configuration

### Structure des Fichiers
```
monitoring/
├── prometheus/
│   ├── prometheus.yml      # Configuration Prometheus
│   └── alert_rules.yml     # Règles d'alertes
├── grafana/
│   └── provisioning/
│       ├── datasources/    # Sources de données
│       └── dashboards/     # Dashboards JSON
└── alertmanager/
    └── alertmanager.yml    # Configuration alertes
```

### Personnalisation des Alertes

Éditez `prometheus/alert_rules.yml` :

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Votre alerte personnalisée"
```

## 🛠️ Maintenance

### Commandes Utiles
```bash
# Voir les logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.monitoring.yml restart grafana

# Arrêter le monitoring
docker-compose -f docker-compose.monitoring.yml down
```

### Sauvegarde
```bash
# Sauvegarder Grafana
docker cp hospital_grafana:/var/lib/grafana ./backup/

# Sauvegarder Prometheus
docker cp hospital_prometheus:/prometheus ./backup/
```

## 📋 Checklist de Vérification

- [ ] Tous les services sont UP
- [ ] Métriques remontées dans Prometheus
- [ ] Dashboards Grafana fonctionnels
- [ ] Alertes configurées
- [ ] Notifications testées

## 🆘 Dépannage

### Problèmes Courants

**Grafana ne démarre pas**
```bash
# Vérifier les permissions
sudo chown -R 472:472 monitoring/grafana/data
```

**Métriques manquantes**
```bash
# Tester l'endpoint
curl http://localhost:8000/api/metrics
```

**Alertes non envoyées**
```bash
# Vérifier AlertManager
curl http://localhost:9093/api/v1/alerts
```

## 📞 Support

1. Consultez les logs des services
2. Vérifiez la configuration Prometheus
3. Testez les endpoints de métriques
4. Consultez la documentation complète dans `docs/MONITORING-SETUP.md`

---

**🎉 Votre système de monitoring est maintenant opérationnel !**
