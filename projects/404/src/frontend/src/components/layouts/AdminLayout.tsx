import { Outlet } from "react-router-dom"
import { Sidebar } from "../shared/Sidebar"
import { DashboardTopBar } from "../shared/DashboardTopBar"

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="admin" />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
