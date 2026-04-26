import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AdminRoutes } from "@/routes/AdminRoutes"
import { PhysicianRoutes } from "@/routes/PhysicianRoutes"
import { PatientRoutes } from "@/routes/PatientRoutes"
import { PublicRoutes } from "@/routes/PublicRoutes"
import { Toaster } from "sonner"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/physician/*" element={<PhysicianRoutes />} />
        <Route path="/doctor/*" element={<Navigate to="/physician" replace />} />
        <Route path="/patient/*" element={<PatientRoutes />} />
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  )
}

export default App
