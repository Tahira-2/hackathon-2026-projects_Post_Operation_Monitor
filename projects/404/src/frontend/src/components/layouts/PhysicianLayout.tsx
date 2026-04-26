import { Outlet } from "react-router-dom"
import { Header } from "../shared/Header"
import { Sidebar } from "../shared/Sidebar"

export function PhysicianLayout() {
  return (
    <div className="relative flex h-screen flex-col bg-background">
      <Header role="Physician Portal" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="physician" />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
