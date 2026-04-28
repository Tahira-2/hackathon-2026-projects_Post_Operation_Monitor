import { useState } from 'react';
import { askCitizenVaccineAssistant } from '../../../api/vaccinations';
import { useLanguage } from '../../../context/LanguageContext';

export default function AIAssistantView() {
  const { language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setQuestion('');
    setError('');
    setLoading(true);
    try {
      const response = await askCitizenVaccineAssistant(trimmed, language);
      const answer = response?.data?.answer || 'No answer available right now.';
      setMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not get AI response.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">AI Vaccine Assistant</h2>
        <p className="mt-1 text-slate-300">
          {language === 'ne'
            ? 'खोप, साइड इफेक्ट, नजिकका कार्यक्रम र जिल्लाको कभरेजबारे प्रश्न सोध्नुहोस्।'
            : 'Ask about vaccines, side effects, nearby events, and district coverage.'}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">
              {language === 'ne'
                ? 'उदाहरण: "मेरो कुन डोज बाँकी छ?", "MR को सामान्य साइड इफेक्ट के हुन्?", "मेरो जिल्लामा कार्यक्रम छन्?"'
                : 'Try: "What vaccine doses are pending for me?", "What side effects are common for MR?", "Are there upcoming events in my district?"'}
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                  msg.role === 'user'
                    ? 'ml-auto max-w-[80%] bg-blue-500/20 text-blue-100'
                    : 'mr-auto max-w-[90%] bg-slate-800/70 text-slate-100'
                }`}
              >
                {msg.text}
              </div>
            ))
          )}
          {loading && (
            <div className="mr-auto max-w-[90%] rounded-xl bg-slate-800/70 px-4 py-3 text-sm text-slate-200">
              {language === 'ne' ? 'सोच्दै...' : 'Thinking...'}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleAsk();
              }
            }}
            placeholder={language === 'ne' ? 'खोपसम्बन्धी प्रश्न सोध्नुहोस्...' : 'Ask your vaccine question...'}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            disabled={loading || !question.trim()}
            onClick={handleAsk}
            className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {language === 'ne' ? 'सोध्नुहोस्' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
