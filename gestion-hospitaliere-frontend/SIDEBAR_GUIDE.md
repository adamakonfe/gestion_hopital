# Guide d'utilisation de la Barre Latérale

## Vue d'ensemble

La barre latérale (sidebar) a été intégrée dans l'application de gestion hospitalière pour améliorer la navigation et l'expérience utilisateur.

## Fonctionnalités

### 🎨 Design Adaptatif
- **Desktop** : La sidebar est toujours visible sur les grands écrans (≥1024px)
- **Mobile** : Menu hamburger pour ouvrir/fermer la sidebar sur les petits écrans
- **Overlay** : Fond sombre cliquable pour fermer la sidebar sur mobile

### 👥 Navigation par Rôle

#### Admin
- Vue d'ensemble
- Services Médicaux
- Médecins
- Patients
- Rendez-vous
- Factures
- Rapports

#### Médecin
- Vue d'ensemble
- Mes Rendez-vous
- Prescriptions
- Mes Patients

#### Patient
- Vue d'ensemble
- Prendre RDV
- Mes RDV
- Ordonnances
- Factures

### 🎯 Caractéristiques

1. **Indicateur visuel** : L'élément actif est mis en évidence avec une couleur de fond
2. **Icônes** : Chaque section a une icône emoji pour une identification rapide
3. **Animations fluides** : Transitions douces lors de l'ouverture/fermeture
4. **Scrollbar personnalisée** : Barre de défilement stylisée pour une meilleure apparence
5. **Déconnexion rapide** : Bouton de déconnexion toujours accessible en bas de la sidebar

## Structure des Composants

```
src/
├── components/
│   ├── Sidebar.js      # Composant de la barre latérale
│   └── Layout.js       # Composant de mise en page avec sidebar
└── pages/
    └── Dashboard.js    # Page principale utilisant le Layout
```

## Personnalisation

### Ajouter une nouvelle section

Dans `Sidebar.js`, ajoutez un nouvel élément au menu approprié :

```javascript
const adminMenuItems = [
  // ... autres éléments
  { id: 'nouvelle-section', icon: '🆕', label: 'Nouvelle Section', color: 'blue' },
];
```

Dans `Dashboard.js`, ajoutez le cas correspondant :

```javascript
const renderActiveSection = () => {
  switch (activeSection) {
    // ... autres cas
    case 'nouvelle-section':
      return <div>{renderNouvelleSection()}</div>;
  }
};
```

### Modifier les couleurs

Les couleurs disponibles sont définies dans `getActiveItemClass()` :
- blue
- green
- purple
- yellow
- red
- indigo

## Utilisation

La sidebar se ferme automatiquement sur mobile après la sélection d'un élément pour une meilleure expérience utilisateur.

## Technologies Utilisées

- **React** : Framework JavaScript
- **Tailwind CSS** : Framework CSS utilitaire
- **React Hooks** : useState pour la gestion d'état
- **Context API** : useAuth pour l'authentification

## Support Navigateurs

- Chrome (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Edge (dernières versions)
