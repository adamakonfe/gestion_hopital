# 🔧 Dépannage Connexion - URGENT

## ⚡ Solution Rapide (90% des cas)

### 1️⃣ Nettoyer le cache du navigateur

**CTRL + SHIFT + DELETE** → Cocher "Cookies" et "Cache" → Effacer

OU dans la console (F12):
```javascript
localStorage.clear()
location.reload()
```

### 2️⃣ Vérifier que le backend fonctionne

Ouvrir dans le navigateur:
```
http://127.0.0.1:8000/api/services
```

**✅ Si ça affiche du JSON** → Backend OK  
**❌ Si erreur** → Lancer le backend (voir étape 3)

### 3️⃣ Relancer les serveurs

#### Terminal 1 - Backend
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan serve
```

**Attendez:** `Starting Laravel development server: http://127.0.0.1:8000`

#### Terminal 2 - Frontend
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
npm start
```

**Attendez:** `webpack compiled successfully`

### 4️⃣ Tester la connexion

Ouvrir: `http://localhost:3000`

**Identifiants Admin:**
```
Email: admin@hospital.com
Password: password
```

**Identifiants Médecin:**
```
Email: medecin@hospital.com
Password: password
```

**Identifiants Patient:**
```
Email: patient@hospital.com
Password: password
```

---

## 🔍 Si ça ne marche TOUJOURS pas

### Diagnostic Console Navigateur

1. **F12** (ouvrir DevTools)
2. **Console** tab
3. Essayer de se connecter
4. Chercher:

**❌ Erreur CORS:**
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/login' 
from origin 'http://localhost:3000' has been blocked by CORS
```

**Solution:**
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan config:clear
php artisan cache:clear
```

**❌ Erreur 404:**
```
POST http://127.0.0.1:8000/api/login 404 (Not Found)
```

**Solution:** Backend non démarré, voir étape 3

**❌ Erreur 401:**
```
POST http://127.0.0.1:8000/api/login 401 (Unauthorized)
```

**Solution:** Mauvais identifiants, vérifier email/password

**❌ Erreur 500:**
```
POST http://127.0.0.1:8000/api/login 500 (Internal Server Error)
```

**Solution:** Problème backend, voir logs Laravel

---

## 🔧 Diagnostic Network

1. **F12** → **Network** tab
2. Essayer de se connecter
3. Cliquer sur la requête **login**
4. Vérifier:

### Headers
```
Request URL: http://127.0.0.1:8000/api/login
Request Method: POST
Status Code: 200 OK  ← Doit être 200
```

### Response
```json
{
  "access_token": "1|xyz...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

**Si la réponse est différente, partagez-la!**

---

## 🗄️ Vérifier la Base de Données

### Utilisateurs existants?

```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan tinker
```

Dans tinker:
```php
\App\Models\User::all();
```

**Si vide → Créer les utilisateurs:**
```bash
php artisan db:seed --class=UsersSeeder
```

OU créer manuellement:
```bash
php artisan tinker
```

```php
// Admin
$admin = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@hospital.com',
    'password' => bcrypt('password'),
    'role' => 'Admin'
]);

// Médecin
$medecin = \App\Models\User::create([
    'name' => 'Dr. Martin',
    'email' => 'medecin@hospital.com',
    'password' => bcrypt('password'),
    'role' => 'Médecin'
]);

// Patient
$patient = \App\Models\User::create([
    'name' => 'Jean Dupont',
    'email' => 'patient@hospital.com',
    'password' => bcrypt('password'),
    'role' => 'Patient'
]);

// Créer les relations
\App\Models\Medecin::create(['user_id' => $medecin->id]);
\App\Models\Patient::create(['user_id' => $patient->id]);
```

---

## 📝 Vérifier Configuration

### Frontend (.env)
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
type .env
```

**Doit contenir:**
```
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### Backend (.env)
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
type .env
```

**Vérifier:**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_hospitaliere
DB_USERNAME=root
DB_PASSWORD=

APP_URL=http://127.0.0.1:8000
```

---

## 🚨 Solution Radicale (Dernier Recours)

### 1. Arrêter tout
```bash
# CTRL+C dans tous les terminaux
```

### 2. Nettoyer tout
```bash
# Backend
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Frontend
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
# Effacer cache navigateur (CTRL+SHIFT+DELETE)
```

### 3. Relancer
```bash
# Terminal 1 - Backend
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan serve

# Terminal 2 - Frontend  
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
npm start
```

### 4. Tester
```
http://localhost:3000
admin@hospital.com / password
```

---

## 📊 Checklist Rapide

Cocher au fur et à mesure:

```
[ ] Backend démarré (http://127.0.0.1:8000)
[ ] Frontend démarré (http://localhost:3000)
[ ] Cache navigateur vidé (localStorage.clear())
[ ] Page /login affichée
[ ] Email/password corrects
[ ] Console sans erreur
[ ] Network montre request 200 OK
[ ] Utilisateurs existent en DB
[ ] .env frontend correct
[ ] .env backend correct
```

---

## 🆘 Erreurs Spécifiques

### "Email ou mot de passe incorrect"
```
✅ Vérifier: admin@hospital.com / password
✅ Vérifier DB: php artisan tinker → User::all()
✅ Recréer utilisateurs si besoin
```

### "Network Error"
```
✅ Backend démarré?
✅ URL correcte: http://127.0.0.1:8000/api/login
✅ Pas de typo dans .env
```

### Page blanche
```
✅ Console (F12) pour voir erreurs
✅ npm start dans frontend
✅ Vider cache (CTRL+SHIFT+R)
```

### Connexion puis déconnexion immédiate
```
✅ Token mal stocké
✅ localStorage.clear()
✅ Vérifier AuthContext.js ligne 19-34
```

---

## 💡 Commandes Utiles

### Voir logs backend en temps réel
```bash
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
tail -f storage/logs/laravel.log
```

### Voir requêtes SQL
Dans `.env` backend, ajouter:
```
DB_LOG=true
```

### Tester API manuellement
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@hospital.com\",\"password\":\"password\"}"
```

---

## ✅ Solution Trouvée?

### Si oui:
Partagez ce qui a marché pour documenter!

### Si non:
Envoyez-moi:
1. Capture console (F12)
2. Capture Network tab (requête login)
3. Message d'erreur exact

---

**Dernière mise à jour:** 16 Octobre 2025  
**Statut:** Guide de dépannage complet
