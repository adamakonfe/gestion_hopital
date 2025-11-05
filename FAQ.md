# ❓ FAQ - Questions Fréquentes

> Réponses aux questions les plus courantes sur l'application de gestion hospitalière

---

## 🚀 Installation & Configuration

### **Q: Comment installer l'application ?**
**R:** Suivez ces étapes simples :
```bash
git clone https://github.com/adamakonfe/gestion_hopital.git
cd gestion_hopital
docker-compose up -d
docker-compose exec backend php artisan migrate --seed
```

### **Q: Docker ne démarre pas, que faire ?**
**R:** Vérifiez que :
- Docker Desktop est installé et démarré
- Les ports 3000, 8000, 8025 sont libres
- Vous avez les permissions administrateur

### **Q: L'application ne charge pas**
**R:** Vérifiez :
- Que tous les conteneurs sont démarrés : `docker-compose ps`
- Les logs : `docker-compose logs backend`
- L'URL : http://localhost:3000

---

## 🔐 Authentification & Comptes

### **Q: Quels sont les comptes de test ?**
**R:** Utilisez ces comptes :
- **Admin :** admin@hospital.com / password
- **Médecin :** medecin@hospital.com / password  
- **Patient :** patient@hospital.com / password

### **Q: Comment créer un nouveau compte ?**
**R:** Seuls les admins peuvent créer de nouveaux comptes via l'interface d'administration.

### **Q: J'ai oublié mon mot de passe**
**R:** 
1. Cliquez sur "Mot de passe oublié"
2. Entrez votre email
3. Vérifiez MailHog (http://localhost:8025) en développement
4. Suivez le lien de réinitialisation

### **Q: Pourquoi je n'ai pas accès à certaines pages ?**
**R:** L'accès dépend de votre rôle :
- **Admin :** Accès complet
- **Médecin :** Patients assignés, rendez-vous
- **Patient :** Profil personnel uniquement

---

## 👥 Gestion des Patients

### **Q: Comment ajouter un nouveau patient ?**
**R:** (Admin/Médecin uniquement)
1. Menu "Patients" → "Nouveau Patient"
2. Remplir les informations obligatoires
3. Uploader documents si nécessaire
4. Sauvegarder

### **Q: Puis-je modifier les informations d'un patient ?**
**R:** Oui, si vous avez les permissions (Admin/Médecin assigné).

### **Q: Comment rechercher un patient ?**
**R:** Utilisez la barre de recherche en haut de la liste des patients. Vous pouvez rechercher par nom, email ou téléphone.

---

## 📅 Rendez-vous

### **Q: Comment prendre un rendez-vous ?**
**R:** 
1. Menu "Rendez-vous" → "Nouveau"
2. Sélectionnez le médecin/spécialité
3. Choisissez une date/heure disponible
4. Ajoutez un motif
5. Confirmez

### **Q: Puis-je annuler un rendez-vous ?**
**R:** Oui, cliquez sur le rendez-vous et changez le statut à "Annulé".

### **Q: Pourquoi certains créneaux ne sont pas disponibles ?**
**R:** Les créneaux peuvent être :
- Déjà réservés
- En dehors des horaires du médecin
- Bloqués par le médecin

### **Q: Je ne reçois pas d'email de confirmation**
**R:** En développement, vérifiez MailHog (http://localhost:8025). En production, vérifiez vos spams.

---

## 📁 Upload de Documents

### **Q: Quels formats de fichiers sont acceptés ?**
**R:** 
- **Images :** JPG, PNG, GIF (max 2MB)
- **Documents :** PDF (max 5MB)

### **Q: L'upload échoue, pourquoi ?**
**R:** Vérifiez :
- La taille du fichier (limites ci-dessus)
- Le format du fichier
- Votre connexion internet
- Les permissions de stockage

### **Q: Comment organiser mes documents ?**
**R:** Utilisez des noms de fichiers descriptifs et ajoutez des descriptions lors de l'upload.

---

## 🔧 Problèmes Techniques

### **Q: L'application est lente**
**R:** 
- Fermez les onglets inutiles
- Vérifiez votre connexion internet
- Redémarrez l'application : `docker-compose restart`

### **Q: Erreur 500 - Que faire ?**
**R:** 
1. Vérifiez les logs : `docker-compose logs backend`
2. Redémarrez les services : `docker-compose restart`
3. Si le problème persiste, contactez le support

### **Q: La base de données semble corrompue**
**R:** Réinitialisez-la :
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```
⚠️ **Attention :** Cela supprime toutes les données !

### **Q: Comment vider le cache ?**
**R:** 
```bash
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
```

---

## 📊 Monitoring & Analytics

### **Q: Comment accéder aux métriques ?**
**R:** 
- **Grafana :** http://localhost:3001 (admin/admin)
- **Prometheus :** http://localhost:9090

### **Q: Que faire si Grafana ne charge pas ?**
**R:** 
1. Vérifiez que le conteneur est démarré
2. Attendez quelques minutes (initialisation)
3. Redémarrez : `docker-compose restart grafana`

---

## 🚀 Déploiement

### **Q: Comment déployer en production ?**
**R:** Consultez le [Guide de Déploiement](./GUIDE_DEPLOIEMENT.md) pour les instructions complètes.

### **Q: Puis-je utiliser sans Docker ?**
**R:** Oui, mais c'est plus complexe. Vous devrez installer manuellement :
- PHP 8.2+ avec extensions
- Node.js 18+
- MySQL 8.0
- Redis
- Nginx

### **Q: Comment configurer HTTPS ?**
**R:** Modifiez la configuration Nginx et ajoutez vos certificats SSL dans le docker-compose.yml.

---

## 🔒 Sécurité

### **Q: L'application est-elle sécurisée ?**
**R:** Oui, elle inclut :
- Authentification JWT
- Validation stricte des entrées
- Protection CSRF/XSS
- Rate limiting
- Upload sécurisé

### **Q: Comment changer les mots de passe par défaut ?**
**R:** 
1. Connectez-vous avec les comptes par défaut
2. Allez dans "Profil" → "Changer mot de passe"
3. Utilisez un mot de passe fort

### **Q: Puis-je activer l'authentification 2FA ?**
**R:** Cette fonctionnalité n'est pas encore implémentée mais est prévue dans la roadmap.

---

## 📱 Compatibilité

### **Q: L'application fonctionne-t-elle sur mobile ?**
**R:** Oui, l'interface est responsive et s'adapte aux écrans mobiles et tablettes.

### **Q: Quels navigateurs sont supportés ?**
**R:** 
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🆘 Support

### **Q: Comment obtenir de l'aide ?**
**R:** 
1. Consultez cette FAQ
2. Lisez la [documentation](./README.md)
3. Créez une issue sur GitHub
4. Contactez : support@hospital.com

### **Q: Comment signaler un bug ?**
**R:** 
1. Allez sur GitHub Issues
2. Décrivez le problème
3. Ajoutez les étapes pour reproduire
4. Joignez une capture d'écran si possible

### **Q: Puis-je contribuer au projet ?**
**R:** Absolument ! Consultez la section Contribution dans le README principal.

---

## 🔄 Mises à jour

### **Q: Comment mettre à jour l'application ?**
**R:** 
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec backend php artisan migrate
```

### **Q: Vais-je perdre mes données lors d'une mise à jour ?**
**R:** Non, les données sont persistées dans des volumes Docker. Mais faites toujours une sauvegarde avant !

---

*FAQ mise à jour le 5 novembre 2025*

**Votre question n'est pas listée ?** Contactez-nous à support@hospital.com
