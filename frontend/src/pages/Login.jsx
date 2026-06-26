import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="text-6xl mb-6">🌾</div>
          <h2 className="text-4xl font-bold mb-4">Welcome back to OptiCrop</h2>
          <p className="text-green-200 text-lg leading-relaxed">
            Your AI-powered agricultural assistant. Get precise crop recommendations based on soil and climate analysis.
          </p>
          <div className="mt-8 space-y-3">
            {['91%+ ML Model Accuracy', '22 Crop Types Supported', 'Real-time Soil Analysis'].map(t => (
              <div key={t} className="flex items-center gap-3 text-green-100">
                <span className="text-green-400">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-xl text-gray-900">OptiCrop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
          <p className="text-gray-500 mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} className={`input-field pr-12 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
              {loading ? <><div className="spinner w-4 h-4"></div> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">Create one free</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-700 font-medium mb-2">💡 Quick Demo</p>
            <p className="text-xs text-green-600">Register a new account or use your own credentials</p>
          </div>
        </div>
      </div>
    </div>
  )
}
