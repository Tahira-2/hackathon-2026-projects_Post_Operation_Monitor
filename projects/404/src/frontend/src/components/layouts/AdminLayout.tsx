import { Outlet } from "react-router-dom"
import { Header } from "../shared/Header"
import { Sidebar } from "../shared/Sidebar"

export function AdminLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header role="Admin Control Panel" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
