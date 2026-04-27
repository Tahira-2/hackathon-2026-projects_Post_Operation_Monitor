import AuthForm from '../components/AuthForm'
import Navbar from '../components/Navbar'

function LoginPage() {
  return (
    <div className="app-shell">
      <Navbar />
      <AuthForm mode="login" />
    </div>
  )
}

export default LoginPage