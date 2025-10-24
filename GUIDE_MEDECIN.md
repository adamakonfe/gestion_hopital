# 👨‍⚕️ Guide Utilisateur - Interface Médecin

## 🎯 Bienvenue

Cette interface a été spécialement conçue pour optimiser votre travail quotidien en tant que médecin.

---

## 🚀 Première Connexion

### 1. Accéder à l'application

```
URL: http://localhost:3000
Email: medecin@hospital.com
Password: password
```

### 2. Découvrir l'interface

Après connexion, vous arrivez sur votre **Espace Médecin** avec:
- Header bleu avec votre nom
- 4 onglets de navigation
- Vue d'ensemble par défaut

---

## 📊 Vue d'Ensemble

### Cartes Statistiques

**4 indicateurs clés:**

1. **👥 Mes Patients**
   - Nombre total de patients suivis
   - Cliquez pour voir la liste complète

2. **📅 RDV Aujourd'hui**
   - Rendez-vous programmés ce jour
   - Mise à jour en temps réel

3. **⏰ RDV En Attente**
   - Rendez-vous à confirmer
   - Nécessitent votre attention

4. **💊 Prescriptions**
   - Total de vos prescriptions
   - Historique complet

### Rendez-vous du Jour

**Actions rapides:**
- ✅ **Confirmer** - Valider le RDV
- ❌ **Annuler** - Annuler le RDV

**Informations affichées:**
- Nom du patient
- Heure du RDV
- Motif de consultation
- Statut actuel

### Patients Récents

- Grille des 6 derniers patients
- Cliquez sur une carte pour voir les détails
- Accès rapide aux informations essentielles

---

## 👥 Mes Patients

### Vue Liste

**Affichage:**
- Grille responsive (1/2/3 colonnes selon écran)
- Informations visibles:
  - Nom complet
  - Email
  - Téléphone
  - Groupe sanguin

### Détails Patient

**Cliquez sur une carte pour ouvrir le modal:**

**Informations complètes:**
- Identité (nom, email)
- Date de naissance
- Groupe sanguin
- Téléphone
- Adresse
- Historique médical

**Actions:**
- Fermer le modal (bouton ou clic extérieur)

---

## 📅 Rendez-vous

### Liste Complète

**Affichage chronologique:**
- Date et heure formatées
- Nom du patient
- Motif de consultation
- Badge de statut coloré
- Notes éventuelles

### Statuts Possibles

| Statut | Couleur | Signification |
|--------|---------|---------------|
| planifie | 🔵 Bleu | À confirmer |
| confirme | 🟢 Vert | Validé |
| annule | 🔴 Rouge | Annulé |
| termine | ⚫ Gris | Terminé |

### Actions Disponibles

**Pour les RDV "planifie":**
- **Confirmer** - Change le statut en "confirme"
- **Annuler** - Change le statut en "annule"

**Workflow recommandé:**
1. Vérifier les RDV du jour (Vue d'ensemble)
2. Confirmer les RDV valides
3. Annuler si nécessaire
4. Consulter les notes avant chaque RDV

---

## 💊 Prescriptions

### Créer une Prescription

**Formulaire en 5 étapes:**

1. **Sélectionner le patient**
   - Menu déroulant
   - Affiche nom et téléphone

2. **Médicaments**
   - Zone de texte libre
   - Exemple: "Paracétamol 500mg, Ibuprofène 400mg"

3. **Posologie**
   - Fréquence et dosage
   - Exemple: "2 comprimés 3x par jour"

4. **Durée**
   - Durée du traitement
   - Exemple: "7 jours"

5. **Notes** (optionnel)
   - Informations complémentaires
   - Exemple: "À prendre après les repas"

**Validation:**
- Cliquez sur "Créer la Prescription"
- Message de confirmation
- Prescription ajoutée à l'historique

### Historique Prescriptions

**Affichage:**
- Liste chronologique (plus récentes en premier)
- Informations par prescription:
  - Nom du patient
  - Médicaments prescrits
  - Posologie et durée
  - Notes
  - Date de création

---

## 🎨 Interface & Navigation

### Navigation Principale

**4 onglets:**
- 📊 **Vue d'ensemble** - Dashboard principal
- 👥 **Mes Patients** - Liste complète
- 📅 **Rendez-vous** - Gestion RDV
- 💊 **Prescriptions** - Création et historique

**Changement d'onglet:**
- Cliquez sur l'onglet souhaité
- Chargement automatique des données
- Indicateur visuel (bordure bleue)

### Design Responsive

**Adaptations automatiques:**

**Desktop (>1024px):**
- 4 colonnes pour statistiques
- 3 colonnes pour patients
- Grille optimale

**Tablette (768-1024px):**
- 2 colonnes
- Layout adapté
- Lisibilité maintenue

**Mobile (<768px):**
- 1 colonne
- Cartes empilées
- Touch-friendly

---

## ⚡ Raccourcis & Astuces

### Raccourcis Clavier

- **Tab** - Navigation entre champs
- **Enter** - Valider formulaire
- **Esc** - Fermer modal

### Astuces Productivité

1. **Vue d'ensemble matinale**
   - Consultez les RDV du jour
   - Confirmez en masse

2. **Prescriptions rapides**
   - Gardez des modèles de prescriptions courantes
   - Copier-coller les médicaments fréquents

3. **Détails patients**
   - Consultez l'historique avant chaque RDV
   - Vérifiez le groupe sanguin si nécessaire

4. **Filtrage mental**
   - RDV en attente = priorité
   - Patients récents = suivi actif

---

## 🔄 Workflow Quotidien Recommandé

### Matin (8h-9h)

1. ✅ Ouvrir la **Vue d'ensemble**
2. ✅ Consulter les **RDV Aujourd'hui**
3. ✅ **Confirmer** tous les RDV valides
4. ✅ Vérifier les **RDV En Attente**

### Journée (9h-18h)

1. ✅ Avant chaque consultation:
   - Ouvrir **Mes Patients**
   - Consulter le dossier patient
   - Vérifier historique médical

2. ✅ Après chaque consultation:
   - Créer **Prescription** si nécessaire
   - Ajouter notes dans le RDV
   - Marquer RDV comme **terminé**

### Soir (18h-19h)

1. ✅ Consulter **Prescriptions** du jour
2. ✅ Vérifier les **RDV** de demain
3. ✅ Préparer les dossiers nécessaires

---

## 🆘 Aide & Support

### Messages d'Erreur

**"Aucun patient trouvé"**
- Vérifiez que vous avez des patients assignés
- Contactez l'administrateur si problème

**"Aucun rendez-vous"**
- Normal si pas de RDV programmés
- Vérifiez le calendrier

**Erreur lors de la création**
- Vérifiez tous les champs requis
- Rechargez la page si problème persiste

### Questions Fréquentes

**Q: Comment modifier une prescription?**
R: Actuellement, créez une nouvelle prescription. La modification arrive bientôt.

**Q: Puis-je voir les RDV de la semaine?**
R: Oui, dans l'onglet Rendez-vous, tous les RDV sont listés.

**Q: Comment exporter une prescription en PDF?**
R: Fonctionnalité à venir dans la prochaine version.

**Q: Puis-je filtrer mes patients?**
R: Recherche avancée à venir. Utilisez Ctrl+F en attendant.

---

## 📱 Version Mobile

### Optimisations Mobile

✅ **Touch-friendly** - Boutons larges
✅ **Scroll fluide** - Navigation naturelle
✅ **Layout adapté** - 1 colonne
✅ **Texte lisible** - Tailles optimisées

### Utilisation Recommandée

**Idéal pour:**
- Consulter RDV en déplacement
- Vérifier infos patient rapidement
- Confirmer/annuler RDV

**Moins pratique pour:**
- Créer prescriptions longues
- Consulter historique détaillé

---

## 🎯 Bonnes Pratiques

### Sécurité

- ✅ Déconnectez-vous après chaque session
- ✅ Ne partagez pas vos identifiants
- ✅ Vérifiez toujours l'identité du patient

### Efficacité

- ✅ Confirmez les RDV dès le matin
- ✅ Créez les prescriptions immédiatement
- ✅ Ajoutez des notes détaillées

### Organisation

- ✅ Consultez la vue d'ensemble quotidiennement
- ✅ Maintenez l'historique à jour
- ✅ Vérifiez les RDV en attente régulièrement

---

## 🚀 Mises à Jour Futures

### Fonctionnalités Prévues

- 📅 **Calendrier visuel** - Vue mensuelle
- 📊 **Statistiques avancées** - Graphiques personnalisés
- 💬 **Messagerie** - Chat avec patients
- 📄 **Export PDF** - Prescriptions et rapports
- 🔔 **Notifications** - Rappels automatiques
- 🔍 **Recherche avancée** - Filtres multiples

---

## 📞 Contact Support

**Problème technique?**
- 📧 Email: support@hospital.com
- 📞 Téléphone: +33 1 23 45 67 89
- 💬 Chat: Disponible 9h-18h

**Suggestion d'amélioration?**
- Utilisez le formulaire de feedback
- Contactez l'équipe de développement

---

**Bonne utilisation! 🎉**

*Interface conçue pour optimiser votre pratique médicale quotidienne.*
