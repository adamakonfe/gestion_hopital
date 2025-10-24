# Guide de Dépannage - Gestion Hospitalière

## Problèmes de Connexion/Inscription

### 1. Erreurs CORS
**Symptômes :** Erreurs dans la console du navigateur mentionnant CORS
**Solutions :**
- Vérifiez que le serveur Laravel est démarré sur `http://127.0.0.1:8000`
- Vérifiez que le fichier `config/cors.php` existe
- Redémarrez le serveur Laravel après les modifications

### 2. Erreurs 500 (Serveur)
**Symptômes :** Erreur 500 lors de la connexion/inscription
**Solutions :**
```bash
# Vérifiez les logs Laravel
cd gestion-hospitaliere-backend
php artisan log:clear
# Tentez la connexion puis vérifiez les logs
tail -f storage/logs/laravel.log
```

### 3. Base de données non configurée
**Symptômes :** Erreurs de base de données
**Solutions :**
```bash
cd gestion-hospitaliere-backend
php artisan migrate:fresh --seed
```

### 4. Tokens non générés
**Symptômes :** Pas de token retourné après connexion
**Solutions :**
- Vérifiez que Sanctum est installé
- Vérifiez la configuration dans `config/sanctum.php`

## Commandes Utiles

### Redémarrer complètement
```bash
# Backend
cd gestion-hospitaliere-backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan serve --host=127.0.0.1 --port=8000

# Frontend (nouveau terminal)
cd gestion-hospitaliere-frontend
npm start
```

### Vérifier la configuration
```bash
cd gestion-hospitaliere-backend
php artisan config:show cors
php artisan route:list --path=api
```

### Tester l'API manuellement
Ouvrez `test-api.html` dans votre navigateur pour tester les endpoints.

## Comptes de Test

Après avoir exécuté les seeders :
- **Patient :** patient@example.com / password
- **Médecin :** dupont@example.com / password
- **Admin :** Créez manuellement via l'inscription

## Ports par Défaut
- **Backend Laravel :** http://127.0.0.1:8000
- **Frontend React :** http://localhost:3000