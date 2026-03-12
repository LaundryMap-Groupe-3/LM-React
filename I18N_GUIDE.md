# Système de Traduction i18n

## Vue d'ensemble
Un système de traduction simple et léger basé sur des fichiers JSON pour gérer le contenu multilingue de l'application React.

## Configuration

### 1. Structure des fichiers de traduction
```
src/locales/
  ├── fr.json    (Français)
  └── en.json    (Anglais)
```

### 2. Provider i18n
Le `I18nProvider` enveloppe l'application dans `main.jsx` pour fournir le contexte de traduction à tous les composants.

## Utilisation

### Dans un composant
```jsx
import { useTranslation } from '../context/I18nContext';

function MyComponent() {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('navigation.home')}</p>
      
      {/* Changer la langue */}
      <button onClick={() => changeLanguage('fr')}>Français</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

### Utiliser le LanguageSwitcher
```jsx
import LanguageSwitcher from './components/layout/LanguageSwitcher';

function Header() {
  return (
    <header>
      <div className="flex justify-between items-center">
        <h1>LaundryMap</h1>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
```

## API du hook `useTranslation`

- **`t(key: string)`** - Récupère la traduction pour une clé donnée
  - Exemple: `t('common.welcome')` → "Bienvenue" (FR) ou "Welcome" (EN)
  - Si la clé n'existe pas, retourne la clé elle-même

- **`language: string`** - La langue actuelle ('fr' ou 'en')

- **`changeLanguage(lang: string)`** - Change la langue actuelle
  - La langue est sauvegardée dans localStorage
  - La détection automatique utilise le navigateur au premier chargement

## Ajouter de nouvelles traductions

### 1. Ajouter dans fr.json et en.json
```json
{
  "mySection": {
    "myKey": "Ma valeur"
  }
}
```

### 2. Utiliser dans le composant
```jsx
const { t } = useTranslation();
t('mySection.myKey'); // "Ma valeur"
```

## Fonctionnalités

✅ Détection automatique de la langue du navigateur
✅ Sauvegarde de la préférence de langue en localStorage
✅ Interface simple avec la fonction `t()`
✅ Support multilingue extensible
✅ Aucune dépendance externe

## Exemple complet

Voir le composant `LanguageSwitcher` pour un exemple d'implémentation complète.
