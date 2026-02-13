import React from 'react';
import { useLanguage } from '../services/LanguageContext';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            <span style={{ opacity: language === 'en' ? 1 : 0.5 }}>EN</span>
            <span>/</span>
            <span style={{ opacity: language === 'de' ? 1 : 0.5 }}>DE</span>
        </button>
    );
};

export default LanguageToggle;
