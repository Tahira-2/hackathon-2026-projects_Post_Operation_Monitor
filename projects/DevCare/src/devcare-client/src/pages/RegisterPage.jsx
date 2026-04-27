import AuthForm from '../components/AuthForm'
import Navbar from '../components/Navbar'

function RegisterPage() {
  return (
    <div className="app-shell">
      <Navbar />
      <AuthForm mode="register" />
    </div>
  )
}

export default RegisterPage