import { useTranslation } from 'react-i18next';

export default function useIsThai(): boolean {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || 'th';
  return lang.toLowerCase().startsWith('th');
}