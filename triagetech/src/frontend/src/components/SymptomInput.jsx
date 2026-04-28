import React, { useState, useRef, useEffect } from 'react';
import en from '../i18n/en.json';
import ne from '../i18n/ne.json';

const SYMPTOM_SUGGESTIONS = {
  en: [
    'headache', 'fever', 'cough', 'fatigue', 'sore throat', 'runny nose',
    'nausea', 'vomiting', 'diarrhea', 'chest pain', 'shortness of breath',
    'dizziness', 'back pain', 'joint pain', 'rash', 'abdominal pain',
    'difficulty breathing', 'muscle ache', 'constipation', 'ear pain',
  ],
  ne: [
    'टाउको दुख्नु', 'ज्वरो', 'खोकी', 'थकान', 'घाँटी दुख्नु', 'नाक बग्नु',
    'वाकवाकी', 'बान्ता', 'पखाला', 'छाती दुख्नु', 'सास फेर्न गाह्रो',
    'रिँगटा लाग्नु', 'पिठ्युँ दुख्नु', 'जोर्नी दुख्नु', 'छाला रातो', 'पेट दुख्नु',
  ],
};

export default function SymptomInput({ lang, onSubmit, loading }) {
  const t = lang === 'ne' ? ne : en;
  const [inputVal, setInputVal] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestions_pool = SYMPTOM_SUGGESTIONS[lang] || SYMPTOM_SUGGESTIONS.en;

  // Filter suggestions
  useEffect(() => {
    if (inputVal.trim().length > 1) {
      const filtered = suggestions_pool.filter(
        s => s.toLowerCase().includes(inputVal.toLowerCase()) && !symptoms.includes(s)
      );
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [inputVal, symptoms, lang]);

  const addSymptom = (val) => {
    const trimmed = val.trim();
    if (!trimmed || symptoms.includes(trimmed)) return;
    setSymptoms(prev => [...prev, trimmed]);
    setInputVal('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSymptom = (sym) => {
    setSymptoms(prev => prev.filter(s => s !== sym));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom(inputVal);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      console.log('Stopping voice recognition...');
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition not supported in this browser.');
      alert('Voice input not supported in this browser. Try Chrome or Edge.');
      return;
    }

    console.log('Starting voice recognition...');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
    recognition.interimResults = true; // Use interim results for better feedback
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Recognition started');
      setListening(true);
      setError('');
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      setListening(false);
    };

    recognition.onresult = (event) => {
      const isFinal = event.results[event.results.length - 1].isFinal;
      if (isFinal) {
        const transcript = event.results[0][0].transcript;
        console.log('Final transcript:', transcript);
        const parts = transcript.split(/,| and | र | अनि | तथा | साथै /i).map(s => s.trim()).filter(Boolean);
        parts.forEach(p => addSymptom(p));
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (event.error === 'not-allowed') {
        setError(lang === 'ne' ? 'माइक्रोफोन पहुँच अस्वीकार गरियो।' : 'Microphone access denied.');
      } else if (event.error === 'network') {
        setError(lang === 'ne' ? 'नेटवर्क त्रुटि। कृपया फेरि प्रयास गर्नुहोस्।' : 'Network error. Please try again.');
      } else {
        setError(lang === 'ne' ? `Voice error: ${event.error}` : `Voice error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start exception:', e);
      setListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) addSymptom(inputVal);
    if (symptoms.length === 0 && !inputVal.trim()) {
      setError(t.no_symptoms);
      return;
    }
    setError('');
    const finalSymptoms = inputVal.trim()
      ? [...symptoms, inputVal.trim()]
      : symptoms;
    onSubmit({
      symptoms: finalSymptoms,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      duration_days: duration ? parseInt(duration) : undefined,
      language: lang,
    });
  };

  return (
    <form id="symptom-form" className="symptom-form" onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        <label className="form-label" htmlFor="symptom-input">
          {t.symptom_input_label}
        </label>

        {/* Symptom chips */}
        {symptoms.length > 0 && (
          <div className="symptom-chips" id="symptom-chips">
            {symptoms.map(sym => (
              <span key={sym} className="chip">
                {sym}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeSymptom(sym)}
                  aria-label={`Remove ${sym}`}
                >×</button>
              </span>
            ))}
          </div>
        )}

        {/* Quick Select */}
        <div className="quick-select">
          <p className="quick-select-label">{t.quick_select}:</p>
          <div className="quick-select-chips">
            {suggestions_pool.slice(0, 8).map(s => (
              <button
                key={s}
                type="button"
                className={`quick-chip ${symptoms.includes(s) ? 'selected' : ''}`}
                onClick={() => addSymptom(s)}
                disabled={symptoms.includes(s)}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input row */}
        <div className="input-row">
          <input
            id="symptom-input"
            ref={inputRef}
            type="text"
            className="symptom-input"
            placeholder={t.symptom_input_placeholder}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            dir={lang === 'ne' ? 'auto' : 'ltr'}
          />
          <button
            id="voice-btn"
            type="button"
            className={`voice-btn ${listening ? 'listening' : ''}`}
            onClick={toggleVoice}
            aria-label={listening ? t.listening : t.speak_btn}
            title={t.speak_btn}
          >
            {listening ? '🔴' : '🎤'}
          </button>
          <button
            id="add-symptom-btn"
            type="button"
            className="add-btn"
            onClick={() => addSymptom(inputVal)}
          >
            {t.add_symptom}
          </button>
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <ul className="suggestions-list" id="suggestions-list">
            {suggestions.map(s => (
              <li key={s} className="suggestion-item" onClick={() => addSymptom(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}

        <p className="symptom-hint">{t.symptom_hint}</p>

        {/* Optional fields */}
        <div className="optional-fields">
          <div className="field-group">
            <label htmlFor="age-input">{t.age_label}</label>
            <input
              id="age-input"
              type="number"
              min="0" max="120"
              className="optional-input"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 35"
            />
          </div>
          <div className="field-group">
            <label htmlFor="gender-select">{t.gender_label}</label>
            <select
              id="gender-select"
              className="optional-input"
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value="">—</option>
              <option value="male">{t.gender_male}</option>
              <option value="female">{t.gender_female}</option>
              <option value="other">{t.gender_other}</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="duration-input">{t.duration_label}</label>
            <input
              id="duration-input"
              type="number"
              min="0"
              className="optional-input"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        </div>

        {error && <p className="error-msg" role="alert">{error}</p>}

        {/* Action buttons */}
        <div className="action-row">
          {symptoms.length > 0 && (
            <button
              id="clear-btn"
              type="button"
              className="clear-btn"
              onClick={() => { setSymptoms([]); setInputVal(''); }}
            >
              {t.clear_all}
            </button>
          )}
          <button
            id="assess-btn"
            type="submit"
            className="assess-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-row"><span className="spinner" />{t.loading}</span>
            ) : t.assess_btn}
          </button>
        </div>
      </div>
    </form>
  );
}
