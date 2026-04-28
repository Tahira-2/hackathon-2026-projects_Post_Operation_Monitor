import { LayoutDashboard, Syringe, Calendar, Bell, User, X, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function Sidebar({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) {
  const { t } = useLanguage();
  const menuItems = [
    {
      id: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'vaccination-history',
      label: t('vaccinationHistory', 'Vaccination History'),
      icon: Syringe,
    },
    {
      id: 'programs',
      label: t('programs', 'Programs'),
      icon: Calendar,
    },
    {
      id: 'notifications',
      label: t('notifications', 'Notifications'),
      icon: Bell,
    },
    {
      id: 'profile',
      label: t('profile', 'Profile'),
      icon: User,
    },
    {
      id: 'ai-assistant',
      label: t('aiAssistant', 'AI Assistant'),
      icon: MessageCircle,
    },
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-white/10 bg-slate-900/60 backdrop-blur-xl text-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button for Mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 lg:hidden hover:bg-white/5 p-2 rounded-lg"
        >
          <X size={24} />
        </button>

        {/* Logo Area */}
        <div className="border-b border-white/10 px-6 py-6">
          <h2 className="text-2xl font-bold text-white">Navjeevan</h2>
          <p className="text-sm text-slate-400">{t('citizenPortal', 'Citizen Portal')}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-200 font-semibold border border-blue-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/50 px-6 py-4">
          <p className="text-xs text-slate-400">VAXNEPAL v1.0</p>
          <p className="text-xs text-slate-400">Citizen Verified ✓</p>
        </div>
      </div>
    </>
  );
}
