# 📅 Guide Admin - Créer un Rendez-vous

## 🎯 Vue d'Ensemble

Ce guide explique comment un administrateur peut créer un rendez-vous pour un patient avec un médecin, déclenchant ainsi une notification automatique au médecin.

---

## 🚀 Étapes pour Créer un RDV

### Étape 1: Se Connecter en Admin

```
URL: http://localhost:3000
Email: admin@hospital.com
Password: password
```

### Étape 2: Accéder à la Section Rendez-vous

**Option A: Via la Sidebar**
```
Sidebar → Cliquer sur "📅 Rendez-vous"
```

**Option B: Via le Dashboard**
```
Dashboard → Section "Rendez-vous Admin"
```

### Étape 3: Remplir le Formulaire

Le formulaire contient 5 champs:

#### 1. 👤 Patient (Obligatoire)
```
Type: Select dropdown
Options: Liste de tous les patients
Format: Nom - Email
Exemple: Jean Dupont - jean@example.com
```

**Fonction:** Sélectionner le patient pour qui vous créez le RDV

#### 2. 👨‍⚕️ Médecin (Obligatoire)
```
Type: Select dropdown
Options: Liste de tous les médecins
Format: Dr. Nom - Service
Exemple: Dr. Martin - Cardiologie
```

**Fonction:** Sélectionner le médecin qui recevra le patient

#### 3. 📅 Date et Heure (Obligatoire)
```
Type: datetime-local
Contrainte: Date future uniquement
Format: JJ/MM/AAAA HH:MM
Exemple: 17/10/2025 14:00
```

**Fonction:** Définir quand aura lieu le rendez-vous

#### 4. 📝 Motif de Consultation (Obligatoire)
```
Type: Text input
Exemples:
- Consultation générale
- Contrôle post-opératoire
- Douleur thoracique
- Suivi diabète
```

**Fonction:** Indiquer la raison de la consultation

#### 5. 📋 Notes Complémentaires (Optionnel)
```
Type: Textarea
Exemples:
- Patient allergique à la pénicilline
- Nécessite interprète
- Première consultation
```

**Fonction:** Ajouter des informations supplémentaires

### Étape 4: Soumettre le Formulaire

```
Bouton: "Créer le Rendez-vous"
Couleur: Gradient bleu/purple
Icône: ✓ (checkmark)
```

**Au clic:**
1. Bouton devient gris avec spinner
2. Texte change en "Création en cours..."
3. Requête API envoyée

### Étape 5: Confirmation

**Succès:**
```
✅ Message: "Rendez-vous créé avec succès"
✅ Formulaire réinitialisé
✅ RDV ajouté à la liste
```

**Erreur:**
```
❌ Message d'erreur affiché
❌ Formulaire conserve les données
❌ Possibilité de réessayer
```

---

## 🔔 Ce Qui Se Passe Après

### 1. Notifications Envoyées

**Patient:**
- ✉️ Email de confirmation
- 📧 Sujet: "Confirmation de Rendez-vous"
- 📝 Contenu: Détails du RDV

**Médecin:**
- ✉️ Email d'assignation
- 📧 Sujet: "Nouveau Rendez-vous Assigné"
- 📝 Contenu: Détails du RDV + patient
- 🔔 Notification dans l'interface
- 🔴 Badge rouge sur la cloche

### 2. Enregistrement Base de Données

```sql
rendezvous
├─ patient_id: ID du patient sélectionné
├─ medecin_id: ID du médecin sélectionné
├─ date_heure: Date et heure choisies
├─ motif: Motif saisi
├─ notes: Notes saisies
├─ statut: "planifie" (par défaut)
└─ created_at: Timestamp création
```

### 3. Notification Médecin

```sql
notifications
├─ type: "RendezvousAssigned"
├─ notifiable_id: ID du médecin
├─ data: {
│   "patient_name": "Jean Dupont",
│   "date_formatted": "17/10/2025 à 14:00",
│   "motif": "Consultation générale"
│ }
├─ read_at: NULL (non lu)
└─ created_at: Timestamp
```

---

## 🎨 Interface Visuelle

### Formulaire Complet

```
┌─────────────────────────────────────────┐
│ 📅 Créer un Rendez-vous                │ ← Header gradient
│ Planifier un rendez-vous pour un...    │
├─────────────────────────────────────────┤
│                                         │
│ 👤 Patient                              │
│ [Sélectionnez un patient ▼]            │
│ Choisissez le patient pour qui...      │
│                                         │
│ 👨‍⚕️ Médecin                             │
│ [Sélectionnez un médecin ▼]            │
│                                         │
│ 📅 Date et Heure                        │
│ [17/10/2025 14:00]                     │
│ Sélectionnez une date future           │
│                                         │
│ 📝 Motif de consultation                │
│ [Consultation générale]                 │
│                                         │
│ 📋 Notes complémentaires (optionnel)   │
│ [                                    ]  │
│ [                                    ]  │
│                                         │
│ [✓ Créer le Rendez-vous]               │ ← Bouton gradient
└─────────────────────────────────────────┘
```

---

## 📊 Exemple Complet

### Scénario: Créer RDV pour Jean Dupont

**Données à saisir:**
```
Patient: Jean Dupont - jean@example.com
Médecin: Dr. Martin - Cardiologie
Date: 17/10/2025
Heure: 14:00
Motif: Contrôle cardiaque annuel
Notes: Patient sous traitement anticoagulant
```

**Résultat:**
```
✅ RDV créé avec ID: 123
✅ Email envoyé à jean@example.com
✅ Email envoyé à dr.martin@hospital.com
✅ Notification créée pour Dr. Martin
✅ Badge (1) apparaît sur cloche médecin
```

---

## 🔍 Vérifications

### Après Création

**1. Vérifier dans la liste des RDV:**
```
Section: "Rendez-vous Admin"
Rechercher: Jean Dupont - 17/10/2025 14:00
Statut: Planifié
```

**2. Vérifier email patient:**
```
Inbox: jean@example.com
Sujet: "Confirmation de Rendez-vous"
Contenu: Détails du RDV
```

**3. Vérifier email médecin:**
```
Inbox: dr.martin@hospital.com
Sujet: "Nouveau Rendez-vous Assigné"
Contenu: Détails + patient
```

**4. Vérifier notification médecin:**
```
Se connecter en médecin
Badge rouge (1) visible
Clic cloche → Notification visible
```

---

## ⚠️ Erreurs Courantes

### Erreur 1: "Patient requis"

**Cause:** Champ patient vide

**Solution:**
```
1. Sélectionner un patient dans la liste
2. Si liste vide, créer d'abord un patient
```

### Erreur 2: "Date invalide"

**Cause:** Date dans le passé

**Solution:**
```
1. Sélectionner une date future
2. Vérifier format: JJ/MM/AAAA HH:MM
```

### Erreur 3: "Médecin non disponible"

**Cause:** Médecin déjà occupé

**Solution:**
```
1. Choisir un autre créneau
2. Ou choisir un autre médecin
```

### Erreur 4: "Email non envoyé"

**Cause:** Configuration email incorrecte

**Solution:**
```
1. Vérifier .env (MAIL_MAILER)
2. Démarrer queue worker
3. Vérifier logs: storage/logs/laravel.log
```

---

## 🧪 Test Complet

### Checklist de Test

```bash
# 1. Préparation
[ ] Backend démarré (php artisan serve)
[ ] Frontend démarré (npm start)
[ ] Queue worker actif (php artisan queue:work)
[ ] Base de données à jour (migrations)

# 2. Connexion
[ ] Se connecter en admin
[ ] Dashboard admin visible
[ ] Sidebar visible

# 3. Navigation
[ ] Cliquer "Rendez-vous" dans sidebar
[ ] Formulaire "Créer un RDV" visible
[ ] Tous les champs affichés

# 4. Remplissage
[ ] Sélectionner patient
[ ] Sélectionner médecin
[ ] Choisir date future
[ ] Saisir motif
[ ] Ajouter notes (optionnel)

# 5. Soumission
[ ] Cliquer "Créer le Rendez-vous"
[ ] Spinner affiché
[ ] Message succès reçu
[ ] Formulaire réinitialisé

# 6. Vérifications
[ ] RDV dans liste admin
[ ] Email patient reçu
[ ] Email médecin reçu
[ ] Notification médecin créée
[ ] Badge médecin visible (1)
```

---

## 📱 Responsive

### Desktop (≥1024px)
```
Formulaire: 1 colonne
Largeur: Max 800px
Padding: 24px
```

### Tablette (768-1024px)
```
Formulaire: 1 colonne
Largeur: 100%
Padding: 16px
```

### Mobile (<768px)
```
Formulaire: 1 colonne
Largeur: 100%
Padding: 12px
Labels: Plus petits
```

---

## 🎯 Bonnes Pratiques

### 1. Vérifier Disponibilité

**Avant de créer:**
```
1. Vérifier agenda médecin
2. Éviter créneaux déjà occupés
3. Respecter horaires travail
```

### 2. Motif Clair

**Exemples bons motifs:**
```
✅ Consultation de suivi diabète
✅ Contrôle post-opératoire genou
✅ Première consultation cardiologie
✅ Renouvellement ordonnance
```

**Exemples mauvais motifs:**
```
❌ RDV
❌ Consultation
❌ Voir médecin
```

### 3. Notes Utiles

**Informations pertinentes:**
```
✅ Allergies connues
✅ Traitements en cours
✅ Urgence ou non
✅ Besoin équipement spécial
✅ Première visite ou suivi
```

### 4. Communication

**Après création:**
```
1. Confirmer avec patient (téléphone)
2. Vérifier médecin a bien reçu notification
3. Noter dans dossier patient
```

---

## 📊 Statistiques

### Temps Moyen

```
Remplissage formulaire: 2-3 minutes
Création RDV: 1-2 secondes
Envoi emails: 5-10 secondes (asynchrone)
Notification médecin: Instantané
```

### Données Requises

```
Minimum: 4 champs (patient, médecin, date, motif)
Recommandé: 5 champs (+ notes)
Temps saisie: ~2 minutes
```

---

## ✅ Résumé

**Pour créer un RDV en tant qu'admin:**

1. ✅ Se connecter en admin
2. ✅ Aller sur "Rendez-vous"
3. ✅ Sélectionner patient
4. ✅ Sélectionner médecin
5. ✅ Choisir date/heure
6. ✅ Saisir motif
7. ✅ Ajouter notes (optionnel)
8. ✅ Cliquer "Créer le Rendez-vous"
9. ✅ Vérifier confirmation
10. ✅ Médecin notifié automatiquement

**Résultat:**
- ✉️ Patient reçoit email
- ✉️ Médecin reçoit email
- 🔔 Médecin reçoit notification interface
- 🔴 Badge apparaît sur cloche médecin
- 📊 RDV enregistré en base

---

**Guide complet! 🎉**
