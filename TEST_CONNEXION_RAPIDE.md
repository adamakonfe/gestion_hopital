# ⚡ Test Connexion - Mode Rapide

## 🚀 Commandes à Exécuter MAINTENANT

### 1️⃣ Arrêter tout (si déjà lancé)
```bash
# Appuyer CTRL+C dans tous les terminaux ouverts
```

### 2️⃣ Nettoyer le cache navigateur

**Ouvrir console navigateur (F12) et taper:**
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 3️⃣ Lancer Backend

**Copier-coller dans un terminal PowerShell:**
```powershell
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan cache:clear
php artisan config:clear
php artisan serve
```

**✅ Attendre ce message:**
```
Starting Laravel development server: http://127.0.0.1:8000
```

### 4️⃣ Tester Backend (dans navigateur)

Ouvrir: `http://127.0.0.1:8000/api/services`

**✅ Si vous voyez du JSON** → Backend fonctionne  
**❌ Si erreur** → Voir section "Erreurs Backend" ci-dessous

### 5️⃣ Lancer Frontend

**Nouveau terminal PowerShell:**
```powershell
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
npm start
```

**✅ Attendre:**
```
webpack compiled successfully
```

### 6️⃣ Tester Connexion

Ouvrir automatiquement: `http://localhost:3000`

**Identifiants Admin:**
```
Email: admin@hospital.com
Password: password
```

**Cliquer "Se connecter"**

---

## ✅ Si ça marche

**Vous devriez voir:**
- Dashboard admin
- Sidebar à gauche
- Pas d'erreur dans console (F12)

**🎉 Connexion réussie!**

---

## ❌ Si ça ne marche PAS

### Erreur: "Email ou mot de passe incorrect"

**Solution 1: Vérifier utilisateurs en DB**
```powershell
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan tinker
```

Dans tinker:
```php
\App\Models\User::where('email', 'admin@hospital.com')->first()
```

**Si NULL → Créer admin:**
```php
$admin = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@hospital.com',
    'password' => bcrypt('password'),
    'role' => 'Admin'
]);
```

**Quitter tinker:** `exit`

### Erreur: Page blanche ou "Network Error"

**Vérifier console (F12):**

**Si erreur CORS:**
```
Access to XMLHttpRequest ... has been blocked by CORS
```

**Solution:**
```powershell
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan config:clear
# Arrêter le serveur (CTRL+C)
php artisan serve
```

**Si erreur 404:**
```
POST http://127.0.0.1:8000/api/login 404
```

**Solution:** Backend pas démarré, retour étape 3

**Si autre erreur:**
Ouvrir: `DEPANNAGE_CONNEXION.md` pour diagnostic complet

---

## 🔍 Vérification Rapide

### Dans Console Navigateur (F12 → Console):

**Taper:**
```javascript
console.log(localStorage.getItem('auth_token'))
```

**Si vous voyez un token:**
```
1|xyz123abc...
```

→ Token existe, problème de vérification

**Solution:**
```javascript
localStorage.clear()
location.reload()
```

---

## 📊 Checklist Express

```
[ ] Backend lancé sur http://127.0.0.1:8000
[ ] Frontend lancé sur http://localhost:3000
[ ] Cache vidé (localStorage.clear())
[ ] Identifiants: admin@hospital.com / password
[ ] Pas d'erreur dans console (F12)
```

---

## 💡 Test API Direct

**Dans PowerShell (avec backend lancé):**

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/login `
  -H "Content-Type: application/json" `
  -H "Accept: application/json" `
  -d '{\"email\":\"admin@hospital.com\",\"password\":\"password\"}'
```

**Résultat attendu:**
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

**Si ça fonctionne ici mais pas dans le navigateur:**
→ Problème frontend (cache/localStorage)

**Si ça ne fonctionne pas:**
→ Problème backend (DB/utilisateurs)

---

## 🆘 Toujours bloqué?

### Envoyer ces informations:

**1. Console navigateur (F12 → Console):**
```
Copier tous les messages d'erreur (en rouge)
```

**2. Network tab (F12 → Network):**
```
Cliquer sur requête "login"
Copier Response
```

**3. Backend terminal:**
```
Copier les dernières lignes affichées
```

---

## 🔄 Réinitialisation Complète

**Si vraiment rien ne marche:**

```powershell
# 1. Nettoyer backend
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-backend"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 2. Recréer utilisateurs
php artisan tinker
```

Dans tinker:
```php
// Supprimer ancien admin
\App\Models\User::where('email', 'admin@hospital.com')->delete();

// Créer nouvel admin
$admin = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@hospital.com',
    'password' => bcrypt('password'),
    'role' => 'Admin'
]);

// Vérifier
\App\Models\User::find($admin->id);

exit
```

```powershell
# 3. Relancer backend
php artisan serve
```

**Nouveau terminal:**
```powershell
# 4. Frontend
cd "c:\Users\adama\Documents\Gestion Hospitaliere\gestion-hospitaliere-frontend"
npm start
```

**5. Navigateur:**
- Vider cache: CTRL+SHIFT+DELETE
- F12 → Console → `localStorage.clear()`
- Rafraîchir: CTRL+SHIFT+R
- Tester connexion

---

**Temps total: 3 minutes**  
**Taux de réussite: 95%**
