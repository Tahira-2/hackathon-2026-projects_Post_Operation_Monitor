import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from './sidebar/Sidebar';
import DashboardView from './views/DashboardView';
import VaccinationHistoryView from './views/VaccinationHistoryView';
import ProgramsView from './views/ProgramsView';
import NotificationsView from './views/NotificationsView';
import ProfileView from './views/ProfileView';
import AIAssistantView from './views/AIAssistantView';
import LanguageToggle from '../common/LanguageToggle';

export default function CitizenDashboard() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'vaccination-history':
        return <VaccinationHistoryView />;
      case 'programs':
        return <ProgramsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation Bar */}
        <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-white/5 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-white">Navjeevan</h1>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button
                onClick={logout}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400 transition"
              >
                {t('logout', 'Logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
