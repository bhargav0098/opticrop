import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const CROPS = ['rice','wheat','maize','chickpea','kidneybeans','pigeonpeas','mothbeans','mungbean','blackgram','lentil','pomegranate','banana','mango','grapes','watermelon','muskmelon','apple','orange','papaya','coconut','cotton','jute']

const FIELDS = [
  { key: 'N', label: 'N (Nitrogen)', placeholder: '90' },
  { key: 'P', label: 'P (Phosphorus)', placeholder: '42' },
  { key: 'K', label: 'K (Potassium)', placeholder: '43' },
  { key: 'temperature', label: 'Temperature (°C)', placeholder: '25' },
  { key: 'humidity', label: 'Humidity (%)', placeholder: '80' },
  { key: 'ph', label: 'pH Level', placeholder: '6.5' },
  { key: 'rainfall', label: 'Rainfall (mm)', placeholder: '200' },
]

const statusColor = (s) => {
  if (s?.includes('✅')) return 'bg-green-50 border-green-200 text-green-700'
  if (s?.includes('⚠️')) return 'bg-yellow-50 border-yellow-200 text-yellow-700'
  return 'bg-red-50 border-red-200 text-red-700'
}

const suitabilityColor = (s) => ({
  High: 'text-green-600 bg-green-100',
  Medium: 'text-yellow-600 bg-yellow-100',
  Low: 'text-red-600 bg-red-100',
}[s] || 'text-gray-600 bg-gray-100')

export default function Analysis() {
  const [crop, setCrop] = useState('')
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!crop) { toast.error('Please select a crop'); return }
    const missing = FIELDS.some(f => form[f.key] === '')
    if (missing) { toast.error('Fill in all parameter fields'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/predict/analyze', {
        crop, ...Object.fromEntries(FIELDS.map(f => [f.key, Number(form[f.key])]))
      })
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Crop Suitability Analysis</h1>
        <p className="text-gray-500 mt-1">Check if a specific crop is compatible with your current soil and climate conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-5">Select Crop & Parameters</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">🌾 Select Crop</label>
              <select className="input-field" value={crop} onChange={e => { setCrop(e.target.value); setResult(null) }}>
                <option value="">-- Choose a crop --</option>
                {CROPS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type="number" step="any" className="input-field"
                  placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setResult(null) }}
                />
              </div>
            ))}

            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><div className="spinner w-4 h-4"></div> Analyzing...</> : <><span>🔍</span> Analyze Suitability</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!result ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center h-full">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="font-semibold text-gray-700 mb-2">Select a crop and enter parameters</h3>
              <p className="text-gray-400 text-sm">We'll analyze compatibility across 7 soil and climate factors</p>
            </div>
          ) : (
            <>
              {/* Suitability score */}
              <div className="card border-2 border-green-100 animate-slide-up">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Suitability for</p>
                    <h2 className="text-3xl font-bold text-gray-900 capitalize">{result.crop}</h2>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold px-6 py-2 rounded-2xl ${suitabilityColor(result.suitability)}`}>
                      {result.suitability}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{result.score}% match</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${result.suitability === 'High' ? 'bg-green-500' : result.suitability === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Poor match</span><span>Perfect match</span>
                  </div>
                </div>
              </div>

              {/* Parameter checks */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Parameter Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(result.checks).map(([param, info]) => (
                    <div key={param} className={`flex items-center justify-between p-3 rounded-xl border ${statusColor(info.status)}`}>
                      <div>
                        <p className="text-sm font-medium">{param}</p>
                        <p className="text-xs opacity-70">Ideal: {info.ideal} • Your value: {info.value}</p>
                      </div>
                      <span className="text-sm font-medium">{info.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop info */}
              <div className="card bg-green-50 border-green-100">
                <h3 className="font-semibold text-green-800 mb-3">Crop Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-green-700"><strong>Soil:</strong> {result.soil_info}</p>
                  <p className="text-green-700"><strong>Climate:</strong> {result.climate_info}</p>
                  <p className="text-green-700"><strong>Tip:</strong> {result.tip}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
