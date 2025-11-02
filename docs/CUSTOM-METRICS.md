# 📊 Métriques Personnalisées - Gestion Hospitalière

## 🎯 Vue d'Ensemble

Ce document décrit toutes les métriques personnalisées disponibles dans le système de gestion hospitalière, leur utilisation et leur interprétation.

## 🏥 Métriques Métier

### Patients
| Métrique | Type | Description | Unité |
|----------|------|-------------|-------|
| `hospital_active_patients` | Gauge | Nombre de patients actuellement dans le système | Nombre |
| `hospital_patient_operations` | Counter | Opérations sur les patients (création, modification) | Nombre |
| `hospital_patient_admissions_today` | Gauge | Admissions de patients aujourd'hui | Nombre |
| `hospital_patient_discharges_today` | Gauge | Sorties de patients aujourd'hui | Nombre |


### Rendez-vous
| Métrique | Type | Description | Unité |
|----------|------|-------------|-------|
| `hospital_appointments_today` | Gauge | Rendez-vous programmés aujourd'hui | Nombre |
| `hospital_pending_appointments` | Gauge | Rendez-vous en attente | Nombre |
| `hospital_appointment_created` | Counter | Nouveaux rendez-vous créés | Nombre |
| `hospital_appointment_status_change{status="..."}` | Counter | Changements de statut des RDV | Nombre |
| `hospital_appointments_completed_today` | Gauge | RDV terminés aujourd'hui | Nombre |

### Personnel Médical
| Métrique | Type | Description | Unité |
|----------|------|-------------|-------|
| `hospital_total_doctors` | Gauge | Nombre total de médecins | Nombre |
| `hospital_active_doctors` | Gauge | Médecins actuellement en service | Nombre |
| `hospital_doctors_by_speciality{speciality="..."}` | Gauge | Médecins par spécialité | Nombre |

## 🔧 Métriques Techniques

### API et Performance
| Métrique | Type | Description | Unité |
|----------|------|-------------|-------|
| `http_requests_total{method="...",status="..."}` | Counter | Nombre total de requêtes HTTP | Nombre |
| `http_request_duration_seconds` | Histogram | Durée des requêtes HTTP | Secondes |
| `hospital_successful_logins` | Counter | Connexions réussies | Nombre |
| `hospital_failed_logins` | Counter | Tentatives de connexion échouées | Nombre |

### Base de Données
| Métrique | Type | Description | Unité |
|----------|------|-------------|-------|
| `hospital_database_connections` | Gauge | Connexions actives à la base | Nombre |
| `hospital_database_query_duration` | Histogram | Durée des requêtes SQL | Secondes |
| `hospital_database_errors` | Counter | Erreurs de base de données | Nombre |

## 📈 Requêtes PromQL Utiles

### Métriques de Charge
```promql
# Taux d'occupation des lits (%)
(hospital_total_beds - hospital_available_beds) / hospital_total_beds * 100

# Évolution des patients sur 24h
increase(hospital_active_patients[24h])

# Charge de travail par médecin
hospital_appointments_today / hospital_active_doctors

# Taux de rotation des lits (par jour)
rate(hospital_bed_assignments[24h]) * 86400
```

### Métriques de Performance
```promql
# Temps de réponse moyen de l'API
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Percentile 95 du temps de réponse
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taux d'erreur API (%)
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Requêtes par minute
rate(http_requests_total[1m]) * 60
```

### Métriques Métier Avancées
```promql
# Prédiction de saturation des lits (tendance sur 7 jours)
predict_linear(hospital_available_beds[7d], 24*3600)

# Efficacité des rendez-vous (% de RDV honorés)
hospital_appointments_completed_today / hospital_appointments_today * 100

# Charge par service médical
sum by (service) (hospital_beds_by_service) - sum by (service) (hospital_available_beds_by_service)
```

## 🚨 Seuils d'Alerte Recommandés

### Critiques
- **Lits disponibles < 5%** : Saturation critique
- **Taux d'erreur API > 10%** : Problème système majeur
- **Base de données indisponible** : Service critique down
- **Temps de réponse > 5s** : Performance dégradée

### Warnings
- **Lits disponibles < 15%** : Approche de la saturation
- **Patients en attente > 50** : Charge élevée
- **Taux d'erreur API > 2%** : Surveillance requise
- **Temps de réponse > 2s** : Performance à surveiller

## 🔍 Dashboards Recommandés

### Dashboard Opérationnel (Direction)
```json
{
  "panels": [
    {
      "title": "Taux d'Occupation Global",
      "query": "(hospital_total_beds - hospital_available_beds) / hospital_total_beds * 100"
    },
    {
      "title": "Patients Traités Aujourd'hui", 
      "query": "hospital_patient_admissions_today + hospital_patient_discharges_today"
    },
    {
      "title": "Revenus Estimés",
      "query": "hospital_appointments_completed_today * 50"
    }
  ]
}
```

### Dashboard Technique (IT)
```json
{
  "panels": [
    {
      "title": "Performance API",
      "query": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
    },
    {
      "title": "Charge Base de Données",
      "query": "hospital_database_connections / 100 * 100"
    },
    {
      "title": "Erreurs Système",
      "query": "rate(hospital_database_errors[5m]) + rate(http_requests_total{status=~\"5..\"}[5m])"
    }
  ]
}
```

## 📊 Métriques par Endpoint

### Endpoints Critiques à Surveiller
- `/api/patients` - Gestion des patients
- `/api/rendezvous` - Système de RDV
- `/api/lits` - Gestion des lits
- `/api/login` - Authentification
- `/api/dashboard` - Tableau de bord

### Métriques Collectées Automatiquement
Grâce au `MetricsMiddleware`, chaque requête génère :
- Compteur de requêtes par méthode/statut
- Durée de traitement
- Métriques d'erreur
- Métriques métier spécifiques

## 🛠️ Ajout de Nouvelles Métriques

### 1. Dans le Controller
```php
// Ajouter dans MetricsController.php
$output[] = "# HELP hospital_new_metric Description de la nouvelle métrique";
$output[] = "# TYPE hospital_new_metric gauge";
$output[] = "hospital_new_metric {$newMetricValue}";
```

### 2. Dans le Middleware
```php
// Ajouter dans MetricsMiddleware.php
if ($condition) {
    $this->incrementCounter('metrics:hospital_new_metric');
}
```

### 3. Règle d'Alerte
```yaml
# Ajouter dans alert_rules.yml
- alert: NewMetricAlert
  expr: hospital_new_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Nouvelle métrique dépassée"
```

## 📋 Bonnes Pratiques

### Nommage des Métriques
- **Préfixe** : `hospital_` pour toutes les métriques métier
- **Format** : snake_case en minuscules
- **Suffixes** : `_total` pour les counters, `_seconds` pour les durées

### Types de Métriques
- **Counter** : Valeurs qui ne font qu'augmenter (requêtes, erreurs)
- **Gauge** : Valeurs qui peuvent monter/descendre (patients, lits)
- **Histogram** : Distribution de valeurs (temps de réponse)
- **Summary** : Quantiles précalculés

### Labels
- Utiliser avec parcimonie (cardinalité limitée)
- Éviter les valeurs dynamiques (IDs, timestamps)
- Préférer les catégories fixes (service, statut, type)

## 🔄 Maintenance des Métriques

### Nettoyage Automatique
- Cache TTL de 24h pour éviter l'accumulation
- Rotation des logs de métriques
- Purge des métriques obsolètes

### Monitoring des Métriques
- Surveiller la cardinalité des labels
- Vérifier la performance de collecte
- Optimiser les requêtes coûteuses

---

## 📞 Support

Pour ajouter de nouvelles métriques ou modifier les existantes :
1. Consultez ce guide
2. Testez en local avec `./scripts/test-monitoring.ps1`
3. Vérifiez l'impact sur les performances
4. Documentez les nouvelles métriques ici
