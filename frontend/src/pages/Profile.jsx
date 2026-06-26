import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', farmLocation: '', farmSize: '' })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalPredictions: 0, recentCrops: [] })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name || '', farmLocation: user.farmLocation || '', farmSize: user.farmSize || '' })
    api.get('/profile').then(r => setStats({ totalPredictions: r.data.totalPredictions, recentCrops: r.data.recentCrops })).catch(() => {})
  }, [user])

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const { data } = await api.put('/profile', form)
      updateUser(data.user)
      toast.success('Profile updated!')
      setEditing(false)
    } catch { toast.error('Failed to update profile') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👤 Your Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar & info */}
      <div className="card">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Farm Location', value: user?.farmLocation || 'Not set' },
              { label: 'Farm Size', value: user?.farmSize || 'Not set' },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className="text-sm font-medium text-gray-900">{f.value}</span>
              </div>
            ))}
            <button onClick={() => setEditing(true)} className="btn-primary mt-4 text-sm">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
              { key: 'farmLocation', label: 'Farm Location', type: 'text', placeholder: 'e.g. Telangana, India' },
              { key: 'farmSize', label: 'Farm Size', type: 'text', placeholder: 'e.g. 5 acres' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input-field" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary text-sm" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Your Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{stats.totalPredictions}</p>
            <p className="text-sm text-green-600 mt-1">Total Predictions</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.recentCrops.length}</p>
            <p className="text-sm text-blue-600 mt-1">Recent Crops</p>
          </div>
        </div>
        {stats.recentCrops.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Latest predictions</p>
            <div className="space-y-2">
              {stats.recentCrops.map(c => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium capitalize">{c.predictedCrop}</span>
                  <span className="text-xs text-gray-400">{c.confidence}% confidence</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
