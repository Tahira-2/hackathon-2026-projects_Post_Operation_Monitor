import React from 'react';
import en from '../i18n/en.json';
import ne from '../i18n/ne.json';

const SEVERITY_CONFIG = {
  green: {
    emoji: '🟢',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green)',
    icon: '✅',
  },
  yellow: {
    emoji: '🟡',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    border: 'var(--yellow)',
    icon: '⚠️',
  },
  red: {
    emoji: '🔴',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red)',
    icon: '🚨',
  },
};

export default function TriageResult({ result, lang, onReset }) {
  const t = lang === 'ne' ? ne : en;
  const cfg = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.yellow;
  const severityKey = `severity_${result.severity}`;
  const advice = lang === 'ne' && result.advice_ne ? result.advice_ne : result.advice;

  return (
    <div id="triage-result" className="result-wrapper" style={{ '--sev-color': cfg.color, '--sev-bg': cfg.bg, '--sev-border': cfg.border }}>

      {/* Severity Banner */}
      <div className="severity-banner" style={{ background: cfg.bg, borderColor: cfg.border }}>
        <span className="severity-icon">{cfg.icon}</span>
        <div className="severity-text-block">
          <h2 className="severity-label" style={{ color: cfg.color }}>
            {cfg.emoji} {t[severityKey] || result.severity_label}
          </h2>
          {result.confidence > 0 && (
            <div className="confidence-bar-row">
              <span className="confidence-text">{t.confidence}: {result.confidence}%</span>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${result.confidence}%`, background: cfg.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advice */}
      <div className="result-section advice-section">
        <h3>{t.advice_label}</h3>
        <p className="advice-text">{advice}</p>
      </div>

      {/* Doctor Recommendation */}
      {result.doctor_type && (
        <div className="result-section doctor-section">
          <h3>👨‍⚕️ {t.recommended_doctor}</h3>
          <div className="doctor-card">
            <div className="doctor-info">
              <span className="doctor-label">{t.visit_type}:</span>
              <span className="doctor-value">{lang === 'ne' ? result.doctor_type_ne : result.doctor_type}</span>
            </div>
            {result.specialist_recommendation && (
              <div className="doctor-info">
                <span className="doctor-label">{t.specialist}:</span>
                <span className="doctor-value specialist-highlight">
                  {lang === 'ne' ? result.specialist_recommendation_ne : result.specialist_recommendation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popular Doctor Suggestions */}
      {result.suggested_doctors?.length > 0 && (
        <div className="result-section suggested-doctors-section">
          <h3>🩺 {t.suggested_specialists}</h3>
          <div className="doctor-grid">
            {result.suggested_doctors.map((doc, i) => (
              <div key={i} className="doctor-item-card">
                <div className="doc-avatar">
                  <span>{doc.name.charAt(0)}</span>
                </div>
                <div className="doc-details">
                  <h4 className="doc-name">{lang === 'ne' ? doc.name_ne : doc.name}</h4>
                  <p className="doc-hosp">{t.at} <strong>{lang === 'ne' ? doc.hospital_ne : doc.hospital}</strong></p>
                  <span className="doc-exp">{t.expertise}: {lang === 'ne' ? doc.expertise_ne : doc.expertise}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.risk_flags?.length > 0 && (
        <div className="result-section risk-section">
          <h3>⚠️ {t.risk_flags}</h3>
          <ul className="risk-list">
            {result.risk_flags.map((flag, i) => (
              <li key={i} className="risk-item">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Conditions */}
      {result.possible_conditions?.length > 0 && (
        <div className="result-section">
          <h3>{t.possible_conditions}</h3>
          <div className="conditions-grid">
            {result.possible_conditions.map((cond, i) => (
              <div key={i} className={`condition-card sev-${cond.severity}`}>
                <span className="cond-name">{cond.condition}</span>
                <div className="cond-meta">
                  <span className={`cond-sev cond-sev-${cond.severity}`}>
                    {cond.severity.toUpperCase()}
                  </span>
                  <span className="cond-conf">{cond.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched Symptoms */}
      {result.matched_symptoms?.length > 0 && (
        <div className="result-section">
          <h3>{t.matched_symptoms}</h3>
          <div className="symptom-chips">
            {result.matched_symptoms.map((s, i) => (
              <span key={i} className="chip chip-result">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Translated Symptoms (if Nepali was used) */}
      {result.translated_symptoms?.length > 0 && (
        <div className="result-section translated-note">
          <p>🔁 Auto-translated: {result.translated_symptoms.join(', ')}</p>
        </div>
      )}

      {/* Actions */}
      <div className="result-actions">
        <button id="reset-btn" className="clear-btn" onClick={onReset}>
          {t.back}
        </button>
        {result.severity === 'red' && (
          <a
            href="tel:102"
            id="emergency-call-btn"
            className="assess-btn emergency-call"
          >
            🚨 Call 102 (Nepal Ambulance)
          </a>
        )}
      </div>

      {/* Disclaimer */}
      <p className="disclaimer">{t.disclaimer}</p>
    </div>
  );
}
