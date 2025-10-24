# 🧪 Guide de Test - Système de Notifications

## 🚀 Préparation

### 1. Créer la table notifications

```bash
cd gestion-hospitaliere-backend
php artisan notifications:table
php artisan migrate
```

### 2. Configurer l'email (optionnel pour test)

**Option A: Mailtrap (recommandé pour dev)**

Dans `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
```

**Option B: Log (pour test rapide)**

Dans `.env`:
```env
MAIL_MAILER=log
```

Les emails seront dans `storage/logs/laravel.log`

### 3. Démarrer les serveurs

```bash
# Terminal 1 - Backend
cd gestion-hospitaliere-backend
php artisan serve

# Terminal 2 - Queue Worker (pour emails asynchrones)
cd gestion-hospitaliere-backend
php artisan queue:work

# Terminal 3 - Frontend
cd gestion-hospitaliere-frontend
npm start
```

---

## ✅ Test Complet

### Étape 1: Créer un RDV en tant qu'Admin

```bash
# 1. Ouvrir http://localhost:3000

# 2. Se connecter en Admin
Email: admin@hospital.com
Password: password

# 3. Aller sur "Rendez-vous" (sidebar)

# 4. Créer un nouveau RDV
- Patient: Sélectionner un patient
- Médecin: Sélectionner Dr. Martin (ou autre médecin)
- Date: Demain
- Heure: 14:00
- Motif: "Consultation de contrôle"

# 5. Cliquer "Créer"

✅ Message de succès
✅ RDV créé
```

### Étape 2: Vérifier l'email (si configuré)

```bash
# Si Mailtrap
1. Aller sur https://mailtrap.io
2. Ouvrir votre inbox
3. Vérifier 2 emails:
   - Email au patient (RendezvousCreated)
   - Email au médecin (RendezvousAssigned) ✅

# Si Log
1. Ouvrir storage/logs/laravel.log
2. Chercher "Nouveau Rendez-vous Assigné"
3. Vérifier le contenu
```

### Étape 3: Se connecter en Médecin

```bash
# 1. Se déconnecter (bouton déconnexion)

# 2. Se reconnecter en Médecin
Email: medecin@hospital.com
Password: password

# 3. Observer la sidebar
✅ Badge rouge sur la cloche
✅ Nombre "1" affiché
```

### Étape 4: Voir la notification

```bash
# 1. Cliquer sur la cloche 🔔

✅ Dropdown s'ouvre
✅ Notification visible avec:
   - Icône 📅
   - Message "Nouveau rendez-vous avec..."
   - Nom du patient
   - Date formatée
   - "Il y a X min"
   - Point bleu (non lu)
```

### Étape 5: Marquer comme lu

```bash
# 1. Cliquer sur la notification

✅ Dropdown se ferme
✅ Badge disparaît
✅ Navigation vers onglet "Rendez-vous"
✅ RDV visible dans la liste
```

### Étape 6: Vérifier notification lue

```bash
# 1. Cliquer à nouveau sur la cloche

✅ Badge reste à 0
✅ Dropdown vide ou message "Aucune notification"
```

---

## 🧪 Tests Supplémentaires

### Test A: Plusieurs notifications

```bash
# 1. Se reconnecter en Admin
# 2. Créer 3 RDV différents pour le même médecin
# 3. Se reconnecter en Médecin
# 4. Vérifier badge: "3"
# 5. Ouvrir dropdown: 3 notifications
# 6. Cliquer "Tout marquer lu"
# 7. Vérifier badge disparaît
```

### Test B: Badge 9+

```bash
# 1. Créer 12 RDV pour le médecin
# 2. Se connecter en médecin
# 3. Vérifier badge: "9+"
```

### Test C: Auto-refresh

```bash
# 1. Se connecter en Médecin
# 2. Badge: 0
# 3. Dans un autre navigateur, se connecter en Admin
# 4. Créer un RDV pour le médecin
# 5. Attendre 30 secondes
# 6. Vérifier badge médecin: "1" (auto-refresh)
```

### Test D: Patient crée RDV

```bash
# 1. Se connecter en Patient
# 2. Créer un RDV
# 3. Se connecter en Médecin
# 4. Vérifier badge: 0 (pas de notification)

# Raison: Seul l'admin déclenche notification médecin
```

---

## 🐛 Dépannage

### Problème: Badge ne s'affiche pas

**Solutions:**
```bash
# 1. Vérifier console navigateur (F12)
# 2. Vérifier requête API:
GET http://localhost:8000/api/notifications/unread

# 3. Vérifier réponse:
{
  "count": 1,
  "notifications": [...]
}

# 4. Vérifier token auth dans localStorage
```

### Problème: Email non envoyé

**Solutions:**
```bash
# 1. Vérifier queue worker actif
php artisan queue:work

# 2. Vérifier jobs table
SELECT * FROM jobs;

# 3. Vérifier failed_jobs
SELECT * FROM failed_jobs;

# 4. Forcer envoi synchrone (test)
# Dans .env:
QUEUE_CONNECTION=sync
```

### Problème: Notification non créée en DB

**Solutions:**
```bash
# 1. Vérifier table existe
php artisan migrate:status

# 2. Vérifier données
SELECT * FROM notifications;

# 3. Tester manuellement
php artisan tinker
$user = User::find(2);
$rdv = Rendezvous::first();
$user->notify(new \App\Notifications\RendezvousAssigned($rdv));
```

### Problème: Erreur CORS

**Solutions:**
```bash
# 1. Vérifier config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],

# 2. Vérifier headers dans requête
```

---

## 📊 Vérifications Base de Données

### Voir les notifications

```sql
-- Toutes les notifications
SELECT * FROM notifications ORDER BY created_at DESC;

-- Notifications non lues
SELECT * FROM notifications WHERE read_at IS NULL;

-- Notifications d'un utilisateur
SELECT * FROM notifications WHERE notifiable_id = 2;

-- Compter par type
SELECT 
  JSON_EXTRACT(data, '$.type') as type,
  COUNT(*) as count
FROM notifications
GROUP BY type;
```

### Nettoyer les notifications

```sql
-- Supprimer toutes les lues
DELETE FROM notifications WHERE read_at IS NOT NULL;

-- Supprimer toutes
TRUNCATE notifications;
```

---

## 📝 Checklist de Test

### Backend
- [ ] Table notifications créée
- [ ] Email configuré
- [ ] Queue worker démarré
- [ ] RDV créé par admin
- [ ] Email médecin reçu
- [ ] Notification en DB

### Frontend
- [ ] Badge affiché
- [ ] Nombre correct
- [ ] Dropdown s'ouvre
- [ ] Notifications listées
- [ ] Clic marque comme lu
- [ ] Badge disparaît
- [ ] Navigation fonctionne
- [ ] Auto-refresh (30s)

### Intégration
- [ ] Admin → Médecin notifié
- [ ] Patient → Médecin PAS notifié
- [ ] Plusieurs RDV → Badge correct
- [ ] Tout marquer lu → Badge 0

---

## 🎯 Résultats Attendus

### Après création RDV par Admin

**Base de données:**
```sql
notifications
├─ id: uuid
├─ type: App\Notifications\RendezvousAssigned
├─ notifiable_id: 2 (médecin)
├─ data: {"type":"rendezvous_assigned",...}
├─ read_at: NULL
└─ created_at: 2025-10-16 14:30:00
```

**Email médecin:**
```
Sujet: Nouveau Rendez-vous Assigné
De: noreply@hospital.com
À: medecin@hospital.com

Bonjour Dr. Martin,
Un nouveau rendez-vous vous a été assigné...
```

**Interface médecin:**
```
Sidebar
└─ Header
   └─ Cloche 🔔 [Badge: 1]
```

---

## 🚀 Commandes Utiles

```bash
# Voir les jobs en queue
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear cache
php artisan cache:clear
php artisan config:clear

# Voir logs
tail -f storage/logs/laravel.log

# Tinker (test manuel)
php artisan tinker
```

---

## 📚 Documentation API

### GET /api/notifications/unread

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "count": 2,
  "notifications": [
    {
      "id": "uuid",
      "type": "App\\Notifications\\RendezvousAssigned",
      "data": {
        "type": "rendezvous_assigned",
        "patient_name": "Jean Dupont",
        "date_formatted": "15/10/2025 à 14:00",
        "message": "Nouveau rendez-vous avec Jean Dupont..."
      },
      "read_at": null,
      "created_at": "2025-10-16T14:30:00.000000Z"
    }
  ]
}
```

### POST /api/notifications/{id}/read

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Notification marquée comme lue"
}
```

---

## ✅ Validation Finale

**Le système fonctionne si:**

1. ✅ Admin crée RDV → Email médecin envoyé
2. ✅ Médecin se connecte → Badge visible
3. ✅ Badge affiche bon nombre
4. ✅ Clic cloche → Dropdown s'ouvre
5. ✅ Notifications listées avec détails
6. ✅ Clic notification → Marquée lue + navigation
7. ✅ Badge disparaît après lecture
8. ✅ Auto-refresh fonctionne (30s)

---

**Bon test! 🎉**
