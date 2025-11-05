# 👥 Guide Utilisateur - Gestion Hospitalière

> Guide complet pour utiliser l'application de gestion hospitalière

---

## 🚀 Démarrage Rapide

### 1. **Accès à l'Application**
- **URL :** http://localhost:3000
- **Navigateurs supportés :** Chrome, Firefox, Safari, Edge

### 2. **Connexion**
Utilisez l'un des comptes de test :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@hospital.com` | `password` |
| **Médecin** | `medecin@hospital.com` | `password` |
| **Patient** | `patient@hospital.com` | `password` |

---

## 👑 Guide Admin

### Dashboard Principal
- **Vue d'ensemble** : Statistiques globales de l'hôpital
- **Graphiques** : Évolution des patients, rendez-vous
- **Alertes** : Notifications importantes

### Gestion des Patients
1. **Créer un patient**
   - Menu "Patients" → "Nouveau Patient"
   - Remplir les informations obligatoires
   - Uploader documents si nécessaire

2. **Modifier un patient**
   - Cliquer sur un patient dans la liste
   - Modifier les informations
   - Sauvegarder les changements

3. **Rechercher un patient**
   - Utiliser la barre de recherche
   - Filtrer par nom, email, téléphone

### Gestion des Médecins
1. **Ajouter un médecin**
   - Menu "Médecins" → "Nouveau Médecin"
   - Assigner une spécialité
   - Définir les horaires

2. **Gérer les spécialités**
   - Créer de nouvelles spécialités
   - Assigner médecins aux services

### Gestion des Rendez-vous
1. **Créer un rendez-vous**
   - Sélectionner patient et médecin
   - Choisir date et heure
   - Ajouter un motif

2. **Modifier un rendez-vous**
   - Changer la date/heure
   - Réassigner à un autre médecin
   - Modifier le statut

---

## 👨‍⚕️ Guide Médecin

### Mon Dashboard
- **Mes rendez-vous du jour**
- **Mes patients**
- **Statistiques personnelles**

### Consultation des Patients
1. **Accéder au dossier patient**
   - Cliquer sur un patient assigné
   - Consulter l'historique médical
   - Voir les documents uploadés

2. **Ajouter des notes**
   - Rédiger des observations
   - Ajouter des prescriptions
   - Uploader des documents

### Gestion de mon Planning
1. **Voir mes rendez-vous**
   - Vue calendrier
   - Liste des rendez-vous
   - Filtrer par date

2. **Modifier mes disponibilités**
   - Bloquer des créneaux
   - Définir mes horaires

---

## 👤 Guide Patient

### Mon Profil
- **Informations personnelles**
- **Mes documents médicaux**
- **Historique des consultations**

### Prendre Rendez-vous
1. **Nouveau rendez-vous**
   - Choisir une spécialité
   - Sélectionner un médecin
   - Choisir date et heure disponible

2. **Mes rendez-vous**
   - Voir mes rendez-vous à venir
   - Annuler un rendez-vous
   - Voir l'historique

### Mes Documents
1. **Consulter mes documents**
   - Ordonnances
   - Résultats d'examens
   - Comptes-rendus

2. **Uploader des documents**
   - Ajouter de nouveaux documents
   - Organiser par catégorie

---

## 🔧 Fonctionnalités Communes

### Upload de Fichiers
- **Formats supportés :** PDF, JPG, PNG, GIF
- **Taille max :** 5MB pour PDF, 2MB pour images
- **Sécurité :** Validation automatique des fichiers

### Notifications
- **Email automatique** pour les rendez-vous
- **Rappels** 24h avant
- **Confirmations** de création/modification

### Recherche
- **Recherche globale** dans toute l'application
- **Filtres avancés** par date, statut, type
- **Résultats en temps réel**

---

## ❓ Questions Fréquentes

### **Comment réinitialiser mon mot de passe ?**
1. Cliquer sur "Mot de passe oublié" sur la page de connexion
2. Entrer votre email
3. Vérifier votre boîte mail (ou MailHog en développement)
4. Suivre le lien pour créer un nouveau mot de passe

### **Pourquoi je ne peux pas créer de rendez-vous ?**
- Vérifiez que vous avez les permissions nécessaires
- Assurez-vous que le médecin a des créneaux disponibles
- Vérifiez que la date choisie n'est pas dans le passé

### **Comment uploader un document ?**
1. Aller dans la section appropriée (Patient/Consultation)
2. Cliquer sur "Uploader un document"
3. Sélectionner le fichier (PDF, JPG, PNG)
4. Ajouter une description si nécessaire
5. Valider l'upload

### **Les emails ne fonctionnent pas**
En développement, les emails sont capturés par MailHog :
- Accéder à http://localhost:8025
- Vérifier la boîte de réception MailHog

---

## 🆘 Support

### En cas de problème
1. **Vérifier la FAQ** ci-dessus
2. **Consulter les logs** (pour les admins)
3. **Contacter le support** : support@hospital.com

### Signaler un bug
1. Décrire le problème rencontré
2. Indiquer les étapes pour reproduire
3. Joindre une capture d'écran si possible
4. Préciser votre rôle et navigateur

---

## 📱 Conseils d'Utilisation

### Performance Optimale
- **Navigateur à jour** recommandé
- **Connexion stable** pour les uploads
- **Fermer les onglets inutiles**

### Sécurité
- **Déconnexion** après utilisation
- **Mot de passe fort** recommandé
- **Ne pas partager** vos identifiants

### Productivité
- **Utiliser les raccourcis** clavier
- **Favoriser la recherche** pour trouver rapidement
- **Organiser vos documents** avec des noms clairs

---

*Guide mis à jour le 5 novembre 2025*
