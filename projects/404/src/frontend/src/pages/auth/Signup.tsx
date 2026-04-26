import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { usePatientSignupMutation } from "@/apis/auth"
import { useAuth } from "@/hooks/useAuth"
import { setCredentials } from "@/store/features/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, role: userRole } = useAuth()
  const [signup, { isLoading, error }] = usePatientSignupMutation()

  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === "admin") navigate("/admin", { replace: true })
      else if (userRole === "physician" || userRole === "doctor") navigate("/physician", { replace: true })
      else navigate("/patient", { replace: true })
    }
  }, [isAuthenticated, userRole, navigate])

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signup({ fullName, email, password }).unwrap()
      if (result) {
        dispatch(setCredentials({ user: result.user, token: result.accessToken || result.token }))
      }
      navigate("/patient", { replace: true })
    } catch (err) {
      // Caught below using RTK Query error prop
    }
  }

  // Type narrow RTK query error for simple extraction if it exists
  const errMessage = error ? ((error as any).data?.message || "An error occurred during signup") : null;

  return (
    <div className="flex w-full min-h-screen bg-muted/10">
      {/* 2-Column Split: Content Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-primary/5 p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Join HealthCore</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create an account to track your health records, message your care team, and securely manage all your medical history in a single, modern ecosystem.
          </p>
        </div>
      </div>

      {/* 2-Column Split: Form Side */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-lg border-none shadow-none bg-transparent">
          <form onSubmit={handleSignup}>
            <CardHeader className="space-y-2 text-center pb-8 mb-6 bg-muted/20">
              <CardTitle className="text-2xl font-bold text-primary">Patient Registration</CardTitle>
              <CardDescription className="text-sm">
                Create a digital identity to manage your care
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              {errMessage && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{errMessage}</div>}
              <div className="grid gap-4">
                <div className="grid gap-2 text-left">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11" />
                </div>
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="password">Password</Label>
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Already have an account? <Link to="/patient/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
