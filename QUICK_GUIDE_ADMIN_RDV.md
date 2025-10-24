# ⚡ Guide Rapide - Admin Crée un RDV

## 🎯 En 3 Minutes

### 1️⃣ Se Connecter
```
http://localhost:3000
Email: admin@hospital.com
Password: password
```

### 2️⃣ Aller sur Rendez-vous
```
Sidebar → 📅 Rendez-vous
```

### 3️⃣ Remplir le Formulaire

```
┌─────────────────────────────┐
│ 👤 Patient                  │
│ [Jean Dupont ▼]            │
├─────────────────────────────┤
│ 👨‍⚕️ Médecin                 │
│ [Dr. Martin ▼]             │
├─────────────────────────────┤
│ 📅 Date et Heure            │
│ [17/10/2025 14:00]         │
├─────────────────────────────┤
│ 📝 Motif                    │
│ [Consultation générale]     │
├─────────────────────────────┤
│ 📋 Notes (optionnel)        │
│ [...]                       │
├─────────────────────────────┤
│ [✓ Créer le RDV]           │
└─────────────────────────────┘
```

### 4️⃣ Résultat

```
✅ RDV créé
✉️ Email → Patient
✉️ Email → Médecin
🔔 Notification → Médecin
🔴 Badge (1) sur cloche médecin
```

---

## 🔄 Flux Complet

```
Admin remplit formulaire
        ↓
Clique "Créer le RDV"
        ↓
Backend crée RDV
        ↓
    ┌───┴───┐
    ↓       ↓
Patient  Médecin
 reçoit   reçoit
 email    email
          +
       notification
          +
        badge
```

---

## ⚠️ Points Importants

### ✅ À Faire
- Sélectionner un patient
- Choisir date **future**
- Motif clair et précis
- Vérifier disponibilité médecin

### ❌ À Éviter
- Date passée
- Motif vague ("RDV")
- Oublier le patient
- Créneaux déjà occupés

---

## 🧪 Test Rapide

```bash
# 1. Connexion admin
admin@hospital.com

# 2. Créer RDV
Patient: Jean Dupont
Médecin: Dr. Martin
Date: Demain 14h00
Motif: Consultation

# 3. Vérifier
✅ Message succès
✅ RDV dans liste

# 4. Tester médecin
Se connecter: medecin@hospital.com
✅ Badge (1) visible
✅ Notification dans dropdown
```

---

## 📱 Accès Rapide

### Via Sidebar
```
Sidebar → 📅 Rendez-vous → Formulaire
```

### Via Dashboard
```
Dashboard → Section RDV Admin → Formulaire
```

---

## 🎉 C'est Tout!

**3 étapes simples:**
1. Connexion admin
2. Remplir formulaire (5 champs)
3. Cliquer "Créer"

**Résultat:**
- RDV créé ✅
- Notifications envoyées ✅
- Médecin informé ✅

---

**Temps total: ~2 minutes** ⏱️
