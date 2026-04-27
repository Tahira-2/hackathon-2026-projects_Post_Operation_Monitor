import React, { useState, useEffect } from 'react';
import SymptomInput from './components/SymptomInput';
import TriageResult from './components/TriageResult';
import ClinicMap from './components/ClinicMap';
import LanguageToggle from './components/LanguageToggle';
import en from './i18n/en.json';
import ne from './i18n/ne.json';
import './index.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('triagetech_lang') || 'en');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const t = lang === 'ne' ? ne : en;

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('triagetech_lang', lang);
    document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
  }, [lang]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setApiError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/triage/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResult(data);
    } catch {
      setApiError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setApiError('');
  };

  return (
    <div className="app-root" id="app-root">
      {/* Header */}
      <header className="app-header" id="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">⚕️</span>
            <div>
              <h1 className="brand-title">{t.app_title}</h1>
              <p className="brand-sub">{t.app_subtitle}</p>
            </div>
          </div>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        <p className="tagline">{t.tagline}</p>
      </header>

      {/* Main content */}
      <main className="app-main" id="app-main">
        {apiError && (
          <div className="api-error" role="alert">
            ❌ {apiError}
            <button className="clear-btn" onClick={() => setApiError('')}>✕</button>
          </div>
        )}

        {!result ? (
          <SymptomInput
            lang={lang}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : (
          <>
            <TriageResult
              result={result}
              lang={lang}
              onReset={handleReset}
            />
            <ClinicMap
              lang={lang}
              severity={result.severity}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer" id="app-footer">
        <p>{t.footer}</p>
        <p className="footer-disclaimer">{t.disclaimer}</p>
      </footer>
    </div>
  );
}
