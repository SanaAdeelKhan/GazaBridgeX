import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('gbx_lang', newLang);

    // Apply RTL/LTR to the whole document
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
      style={{
        background: 'linear-gradient(to right, #C26100, #E07A1B)',
        border: 'none',
        borderRadius: '8px',
        padding: '5px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#fff',
        fontWeight: '600',
        fontSize: '13px',
        fontFamily: isArabic ? "'Cairo', 'Amiri', sans-serif" : 'inherit',
        letterSpacing: isArabic ? '0' : '0.02em',
        transition: 'opacity 0.2s',
        minWidth: '64px',
        justifyContent: 'center',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {/* Globe icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {isArabic ? 'EN' : 'عربي'}
    </button>
  );
}
