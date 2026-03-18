import { useEffect } from 'react';

/**
 * Hook personnalisé pour mettre à jour le titre de la page (onglet du navigateur)
 * @param {string} titleKey - La clé de traduction pour le titre (ex: 'page_titles.home')
 * @param {function} t - La fonction de traduction du contexte I18nContext
 */
export const usePageTitle = (titleKey, t) => {
  useEffect(() => {
    if (titleKey && t) {
      const title = t(titleKey);
      document.title = title;
    }
  }, [titleKey, t]);
};

export default usePageTitle;
