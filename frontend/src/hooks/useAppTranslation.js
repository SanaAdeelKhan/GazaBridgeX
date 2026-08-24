import { useTranslation } from 'react-i18next';

export function useAppTranslation() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('ar') ? 'ar' : 'en';

  const changeLanguage = (nextLanguage) => i18n.changeLanguage(nextLanguage);

  return {
    t,
    language,
    changeLanguage,
    isArabic: language === 'ar',
  };
}
