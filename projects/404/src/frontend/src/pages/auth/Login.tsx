import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { usePatientLoginMutation, useDoctorLoginMutation, useAdminLoginMutation } from "@/apis/auth"
import { useAuth } from "@/hooks/useAuth"
import { setCredentials } from "@/store/features/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, role: userRole } = useAuth()

  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === "admin") navigate("/admin", { replace: true })
      else if (userRole === "physician" || userRole === "doctor") navigate("/physician", { replace: true })
      else navigate("/patient", { replace: true })
    }
  }, [isAuthenticated, userRole, navigate])

  const [patientLogin, { isLoading: pLoading, error: pError }] = usePatientLoginMutation()
  const [doctorLogin, { isLoading: dLoading, error: dError }] = useDoctorLoginMutation()
  const [adminLogin, { isLoading: aLoading, error: aError }] = useAdminLoginMutation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const path = location.pathname
  let role = "General"
  let redirect = "/"
  if (path.includes("admin")) { role = "Admin"; redirect = "/admin" }
  else if (path.includes("physician")) { role = "Physician"; redirect = "/physician" }
  else if (path.includes("patient")) { role = "Patient"; redirect = "/patient" }
  else if (role === "General") { redirect = "/patient" }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result;
      if (role === "Patient" || role === "General") {
        result = await patientLogin({ email, password }).unwrap()
      } else if (role === "Physician") {
        result = await doctorLogin({ email, password }).unwrap()
      } else if (role === "Admin") {
        result = await adminLogin({ email, password }).unwrap()
      }

      if (result) {
        dispatch(setCredentials({ user: result.user, token: result.accessToken || result.token }))
      }
      navigate(redirect, { replace: true })
    } catch (err) {
      // Caught below using RTK query error objects
    }
  }

  const isLoading = pLoading || dLoading || aLoading
  const errorObj = pError || dError || aError
  const errMessage = errorObj ? ((errorObj as any).data?.message || "An error occurred during sign in") : null;

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] bg-muted/10">
      {/* 2-Column Split: Content Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-primary/5 p-12 border-r">
        <div className="max-w-md space-y-6 text-center">
          <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">HealthCore {role}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome back. Please sign in to securely access your {role.toLowerCase()} dashboard. We ensure that your data is heavily protected while giving you seamless operational flow.
          </p>
        </div>
      </div>

      {/* 2-Column Split: Form Side */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-primary/10">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-2 text-center pb-8 border-b mb-6 bg-muted/20">
              <CardTitle className="text-2xl font-bold text-primary">Sign back in</CardTitle>
              <CardDescription className="text-sm">
                Enter your registered credentials below
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              {errMessage && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{errMessage}</div>}
              <div className="grid gap-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="grid gap-2 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button className="w-full h-11 text-base" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in securely"}
              </Button>
              {role === "Patient" || role === "General" ? (
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Don't have an account? <Link to="/patient/signup" className="text-primary font-medium hover:underline">Sign up as Patient</Link>
                </p>
              ) : null}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
