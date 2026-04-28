import { Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import LanguageToggle from '../../common/LanguageToggle';

export default function HCDashboardTopbar({ activeLabel }) {
  const { t } = useLanguage();

  return (
    <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('healthcareStaffDashboard', 'Healthcare Staff Dashboard')}</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{activeLabel}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <Activity size={16} className="text-cyan-300" />
            {t('liveOperationalMode', 'Live operational mode')}
          </div>
        </div>
      </div>
    </div>
  );
}