import { Outlet } from "react-router-dom"
import { Header } from "../shared/Header"

export function PatientLayout() {
  const homeSections = [
    { name: "Overview", path: "#overview" },
    { name: "Care Team", path: "#care-team" },
    { name: "Wellness", path: "#wellness" },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header navItems={homeSections} />

      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_15%_10%,hsl(var(--muted))_0%,transparent_38%),radial-gradient(circle_at_85%_0%,hsl(var(--muted))_0%,transparent_28%)] px-6 pb-6 md:px-8 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
