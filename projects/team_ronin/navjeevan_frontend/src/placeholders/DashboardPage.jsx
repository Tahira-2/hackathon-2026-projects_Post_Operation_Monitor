import { Syringe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.full_name || user?.fullName || 'Citizen';

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-md">
        <div className="mb-4 flex items-center gap-2 text-blue-600">
          <Syringe size={22} />
          <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
        </div>
        <p className="text-gray-700">
          Welcome, {displayName}! Your vaccine dashboard is coming soon. 💉
        </p>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
