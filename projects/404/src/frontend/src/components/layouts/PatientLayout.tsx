import { Outlet } from "react-router-dom"
import { Header } from "../shared/Header"
import { Sidebar } from "../shared/Sidebar"

export function PatientLayout() {
  return (
    <div className="relative flex h-screen flex-col bg-background">
      <Header role="Patient Portal" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="patient" />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
