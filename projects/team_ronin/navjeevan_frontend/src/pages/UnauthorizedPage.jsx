import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-md">
        <Lock size={48} className="mx-auto text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view this page.</p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
