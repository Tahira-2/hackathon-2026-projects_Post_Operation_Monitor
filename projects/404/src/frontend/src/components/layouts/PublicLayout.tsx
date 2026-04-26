import { Outlet } from "react-router-dom"
import { Header } from "../shared/Header"
import { Footer } from "../shared/Footer"

export function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
