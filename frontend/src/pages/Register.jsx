import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password
      })
      login(data.token, data.user)
      toast.success(`Welcome to OptiCrop, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }) }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="text-6xl mb-6">🌱</div>
          <h2 className="text-4xl font-bold mb-4">Join OptiCrop Today</h2>
          <p className="text-green-200 text-lg leading-relaxed">
            Start making data-driven decisions for your farm. Free forever for individual farmers.
          </p>
          <div className="mt-8 space-y-3">
            {['Free crop predictions', 'Unlimited analysis', 'Prediction history tracking', 'AI farming tips'].map(t => (
              <div key={t} className="flex items-center gap-3 text-green-100">
                <span className="text-green-400">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-xl text-gray-900">OptiCrop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start optimizing your crops with AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Farmer' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className={`input-field ${errors[key] ? 'border-red-400' : ''}`}
                  placeholder={placeholder} value={form[key]} onChange={set(key)} />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className={`input-field pr-12 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
              {loading ? <><div className="spinner w-4 h-4"></div> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
