import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, Clock, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PhysicianLayout() {
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/physician/home', icon: Home, label: 'Dashboard' },
    { to: '/physician/availability', icon: Clock, label: 'Availability' },
    { to: '/physician/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/physician/patients', icon: Users, label: 'Patients' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            Dr
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight truncate">{user?.fullName || 'Physician'}</h2>
            <p className="text-sm text-gray-400">Clinical Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-900 text-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
              Dr
            </div>
            <h1 className="font-bold text-white">CareFlow AI</h1>
          </div>
          <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </div>
        {/* Mobile Nav Strip */}
        <nav className="flex overflow-x-auto px-2 pb-2 scrollbar-hide border-t border-gray-800 pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mr-2 transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
