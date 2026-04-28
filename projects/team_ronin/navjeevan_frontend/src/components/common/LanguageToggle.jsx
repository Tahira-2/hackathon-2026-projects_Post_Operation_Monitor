import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border border-white/15 bg-slate-900/60 p-1 text-xs">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded px-2 py-1 font-semibold ${language === 'en' ? 'bg-blue-500 text-white' : 'text-slate-300'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ne')}
        className={`rounded px-2 py-1 font-semibold ${language === 'ne' ? 'bg-blue-500 text-white' : 'text-slate-300'}`}
      >
        नेपाली
      </button>
    </div>
  );
}
