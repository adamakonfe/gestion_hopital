# 🔌 API Documentation - Gestion Hospitalière

> Documentation complète de l'API REST Laravel

---

## 📋 Vue d'Ensemble

### Base URL
```
http://localhost:8000/api
```

### Authentification
L'API utilise **Laravel Sanctum** avec des tokens JWT.

```bash
# Obtenir un token
POST /api/login
{
    "email": "admin@hospital.com",
    "password": "password"
}

# Utiliser le token
Authorization: Bearer {token}
```

### Format de Réponse
```json
{
    "success": true,
    "data": {...},
    "message": "Operation successful"
}
```

---

## 🔐 Authentification

### POST /api/login
Connexion utilisateur

**Body:**
```json
{
    "email": "admin@hospital.com",
    "password": "password"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Admin",
            "email": "admin@hospital.com",
            "role": "admin"
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    },
    "message": "Login successful"
}
```

### POST /api/logout
Déconnexion utilisateur

**Headers:**
```
Authorization: Bearer {token}
```

### POST /api/register
Inscription (Admin uniquement)

**Body:**
```json
{
    "name": "Nouveau Utilisateur",
    "email": "user@hospital.com",
    "password": "password",
    "password_confirmation": "password",
    "role": "patient"
}
```

---

## 👥 Patients

### GET /api/patients
Liste des patients

**Query Parameters:**
- `page` (int): Page number
- `per_page` (int): Items per page (max 50)
- `search` (string): Search term
- `sort_by` (string): Field to sort by
- `sort_order` (string): asc/desc

**Response:**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "user_id": 2,
                "date_naissance": "1990-01-01",
                "sexe": "M",
                "adresse": "123 Rue Test",
                "telephone": "0123456789",
                "user": {
                    "id": 2,
                    "name": "Patient Test",
                    "email": "patient@test.com"
                },
                "created_at": "2025-11-05T19:00:00.000000Z"
            }
        ],
        "total": 1
    }
}
```

### GET /api/patients/{id}
Détails d'un patient

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 2,
        "date_naissance": "1990-01-01",
        "sexe": "M",
        "adresse": "123 Rue Test",
        "telephone": "0123456789",
        "documents": [
            {
                "id": 1,
                "nom": "Ordonnance.pdf",
                "chemin": "/storage/documents/ordonnance.pdf",
                "type": "application/pdf"
            }
        ],
        "rendezvous": [...],
        "user": {...}
    }
}
```

### POST /api/patients
Créer un patient

**Body:**
```json
{
    "name": "Nouveau Patient",
    "email": "patient@example.com",
    "date_naissance": "1990-01-01",
    "sexe": "M",
    "adresse": "123 Rue Example",
    "telephone": "0123456789"
}
```

### PUT /api/patients/{id}
Modifier un patient

**Body:**
```json
{
    "name": "Patient Modifié",
    "adresse": "456 Nouvelle Rue",
    "telephone": "0987654321"
}
```

### DELETE /api/patients/{id}
Supprimer un patient

---

## 👨‍⚕️ Médecins

### GET /api/medecins
Liste des médecins

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": 3,
            "service_id": 1,
            "specialite": "Cardiologie",
            "user": {
                "name": "Dr. Martin",
                "email": "dr.martin@hospital.com"
            },
            "service": {
                "nom": "Cardiologie",
                "description": "Service de cardiologie"
            }
        }
    ]
}
```

### POST /api/medecins
Créer un médecin

**Body:**
```json
{
    "name": "Dr. Nouveau",
    "email": "dr.nouveau@hospital.com",
    "service_id": 1,
    "specialite": "Pédiatrie"
}
```

---

## 📅 Rendez-vous

### GET /api/rendezvous
Liste des rendez-vous

**Query Parameters:**
- `patient_id` (int): Filter by patient
- `medecin_id` (int): Filter by doctor
- `date` (date): Filter by date
- `statut` (string): Filter by status

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "patient_id": 1,
            "medecin_id": 1,
            "date_heure": "2025-11-06 10:00:00",
            "motif": "Consultation générale",
            "statut": "confirme",
            "notes": null,
            "patient": {...},
            "medecin": {...}
        }
    ]
}
```

### POST /api/rendezvous
Créer un rendez-vous

**Body:**
```json
{
    "patient_id": 1,
    "medecin_id": 1,
    "date_heure": "2025-11-06 10:00:00",
    "motif": "Consultation de suivi"
}
```

### PUT /api/rendezvous/{id}
Modifier un rendez-vous

**Body:**
```json
{
    "date_heure": "2025-11-06 14:00:00",
    "statut": "confirme",
    "notes": "Patient en forme"
}
```

---

## 🏥 Services

### GET /api/services
Liste des services hospitaliers

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nom": "Cardiologie",
            "description": "Service de cardiologie",
            "medecins_count": 3
        }
    ]
}
```

### POST /api/services
Créer un service

**Body:**
```json
{
    "nom": "Neurologie",
    "description": "Service de neurologie"
}
```

---

## 📁 Upload de Documents

### POST /api/patients/{id}/documents
Uploader un document pour un patient

**Body (multipart/form-data):**
```
file: [FILE]
nom: "Ordonnance du 05/11/2025"
description: "Prescription médicale"
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "nom": "Ordonnance du 05/11/2025",
        "chemin": "/storage/documents/ordonnance_123.pdf",
        "type": "application/pdf",
        "taille": 1024000
    }
}
```

### GET /api/documents/{id}/download
Télécharger un document

**Headers:**
```
Authorization: Bearer {token}
```

---

## 📊 Statistiques

### GET /api/dashboard/stats
Statistiques du dashboard

**Response:**
```json
{
    "success": true,
    "data": {
        "total_patients": 150,
        "total_medecins": 25,
        "rendezvous_aujourd_hui": 12,
        "rendezvous_semaine": 85,
        "patients_par_service": {
            "Cardiologie": 45,
            "Pédiatrie": 30,
            "Urgences": 25
        },
        "evolution_mensuelle": [
            {"mois": "2025-01", "patients": 120},
            {"mois": "2025-02", "patients": 135},
            {"mois": "2025-03", "patients": 150}
        ]
    }
}
```

### GET /api/medecins/{id}/stats
Statistiques d'un médecin

**Response:**
```json
{
    "success": true,
    "data": {
        "total_patients": 45,
        "rendezvous_mois": 120,
        "taux_presence": 95.5,
        "satisfaction_moyenne": 4.7
    }
}
```

---

## 🔍 Recherche

### GET /api/search
Recherche globale

**Query Parameters:**
- `q` (string): Search term
- `type` (string): patients|medecins|rendezvous
- `limit` (int): Max results (default 10)

**Response:**
```json
{
    "success": true,
    "data": {
        "patients": [...],
        "medecins": [...],
        "rendezvous": [...]
    }
}
```

---

## ⚠️ Codes d'Erreur

### Erreurs d'Authentification
- `401` - Non authentifié
- `403` - Non autorisé
- `422` - Données de validation invalides

### Erreurs de Ressources
- `404` - Ressource non trouvée
- `409` - Conflit (ex: rendez-vous déjà pris)
- `429` - Trop de requêtes (rate limiting)

### Exemple de Réponse d'Erreur
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

---

## 🔒 Rate Limiting

- **Authentification :** 5 tentatives/minute
- **API générale :** 60 requêtes/minute
- **Upload :** 10 fichiers/minute

---

## 🧪 Tests API

### Avec cURL
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"password"}'

# Get patients
curl -X GET http://localhost:8000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Avec Postman
1. Importer la collection Postman (si disponible)
2. Configurer l'environnement avec `base_url` = `http://localhost:8000/api`
3. Obtenir un token via `/login`
4. Utiliser le token dans les autres requêtes

---

## 📝 Changelog API

### Version 1.0 (Actuelle)
- Authentification JWT
- CRUD complet pour patients, médecins, rendez-vous
- Upload de documents
- Statistiques dashboard
- Recherche globale

### Version 1.1 (Prévue)
- Notifications push
- API de messagerie
- Export PDF des rapports
- Webhooks

---

*Documentation API mise à jour le 5 novembre 2025*
