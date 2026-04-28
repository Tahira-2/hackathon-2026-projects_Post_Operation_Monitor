import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import CareBot from '../components/CareBot'

const ROLE_KEY = 'devcare_role'

function DashboardLayout() {
  const role = localStorage.getItem(ROLE_KEY)

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 overflow-y-auto pl-72 transition-all duration-300">
        <div className="animate-fade-in p-8">
          <Outlet />
        </div>
      </main>
      {role === 'doctor' && <CareBot />}
      </div>
    </div>
  )
}

export default DashboardLayout
