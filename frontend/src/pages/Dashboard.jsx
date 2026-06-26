import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']

function StatCard({ icon, label, value, sub, color = 'green' }) {
  return (
    <div className="stat-card">
      <div className={`inline-flex p-2.5 rounded-xl bg-${color}-100 text-${color}-600 text-xl mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ history: [], total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history?limit=20').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const history = data.history || []

  // Chart data: top crops
  const cropCounts = history.reduce((acc, h) => {
    acc[h.predictedCrop] = (acc[h.predictedCrop] || 0) + 1
    return acc
  }, {})
  const cropChartData = Object.entries(cropCounts)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
    .sort((a, b) => b.count - a.count).slice(0, 6)

  const avgConfidence = history.length
    ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / history.length)
    : 0

  const recentDate = history[0] ? new Date(history[0].createdAt).toLocaleDateString() : 'N/A'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your agricultural intelligence overview</p>
        </div>
        <Link to="/predict" className="btn-primary flex items-center gap-2 text-sm">
          <span>🌾</span> New Prediction
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🌾" label="Total Predictions" value={data.total || 0} sub="All time" />
        <StatCard icon="🎯" label="Avg Confidence" value={`${avgConfidence}%`} sub="Across predictions" />
        <StatCard icon="📅" label="Last Prediction" value={recentDate} sub="Most recent" />
        <StatCard icon="🌱" label="Unique Crops" value={Object.keys(cropCounts).length} sub="Recommended" />
      </div>

      {/* Charts row */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="card lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Top Recommended Crops</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cropChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Crop Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={cropChartData} cx="50%" cy="50%" outerRadius={70} dataKey="count">
                  {cropChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent history */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Recent Predictions</h2>
          <Link to="/history" className="text-green-600 hover:text-green-700 text-sm font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="spinner w-8 h-8"></div></div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="font-semibold text-gray-700 mb-2">No predictions yet</h3>
            <p className="text-gray-400 text-sm mb-4">Make your first AI crop recommendation</p>
            <Link to="/predict" className="btn-primary text-sm">Start Prediction</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map(h => (
              <div key={h._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🌾</div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{h.predictedCrop}</p>
                    <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${h.confidence >= 80 ? 'bg-green-100 text-green-700' : h.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {h.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/predict', icon: '🧠', title: 'Predict Crop', desc: 'Get AI recommendation', color: 'bg-green-600' },
          { to: '/analysis', icon: '📊', title: 'Analyze Suitability', desc: 'Check crop compatibility', color: 'bg-emerald-600' },
          { to: '/history', icon: '📋', title: 'View History', desc: 'Past predictions', color: 'bg-teal-600' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card hover:shadow-md transition-all duration-200 flex items-center gap-4 p-5">
            <div className={`w-12 h-12 ${a.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>{a.icon}</div>
            <div>
              <p className="font-semibold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-400">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
