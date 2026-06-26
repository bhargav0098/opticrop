import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 300, hint: 'Soil nitrogen content', placeholder: '90', icon: '🧪' },
  { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 300, hint: 'Soil phosphorus content', placeholder: '42', icon: '⚗️' },
  { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 300, hint: 'Soil potassium content', placeholder: '43', icon: '🔬' },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: -10, max: 60, hint: 'Average temperature', placeholder: '25', icon: '🌡️' },
  { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, hint: 'Relative humidity', placeholder: '80', icon: '💧' },
  { key: 'ph', label: 'pH Level', unit: 'pH', min: 0, max: 14, hint: 'Soil pH (0-14)', placeholder: '6.5', icon: '🧫' },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 500, hint: 'Annual rainfall', placeholder: '200', icon: '🌧️' },
]

const EXAMPLES = [
  { label: 'Rice (Tropical)', values: { N: 90, P: 42, K: 43, temperature: 25, humidity: 82, ph: 6.5, rainfall: 200 } },
  { label: 'Wheat (Rabi)', values: { N: 100, P: 50, K: 50, temperature: 15, humidity: 50, ph: 7, rainfall: 90 } },
  { label: 'Maize (Kharif)', values: { N: 90, P: 50, K: 50, temperature: 23, humidity: 65, ph: 6.5, rainfall: 120 } },
  { label: 'Cotton (Dry)', values: { N: 115, P: 50, K: 25, temperature: 27, humidity: 65, ph: 7, rainfall: 95 } },
]

export default function Predict() {
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    FIELDS.forEach(f => {
      const v = Number(form[f.key])
      if (form[f.key] === '' || form[f.key] === null) e[f.key] = 'Required'
      else if (isNaN(v)) e[f.key] = 'Must be a number'
      else if (v < f.min || v > f.max) e[f.key] = `Range: ${f.min}–${f.max}`
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the form errors'); return }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/predict', Object.fromEntries(FIELDS.map(f => [f.key, Number(form[f.key])])))
      setResult(data)
      toast.success('Prediction complete!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Check ML service.')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (example) => {
    setForm(Object.fromEntries(Object.entries(example.values).map(([k, v]) => [k, String(v)])))
    setErrors({})
    setResult(null)
    toast.success(`Loaded: ${example.label}`)
  }

  const confidenceColor = (c) => c >= 80 ? 'text-green-600' : c >= 60 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌾 Crop Prediction</h1>
        <p className="text-gray-500 mt-1">Enter your soil and environmental parameters for AI-powered crop recommendation</p>
      </div>

      {/* Result */}
      {result && (
        <div className="card border-2 border-green-200 bg-green-50 animate-slide-up">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 mb-1">🎯 AI Recommendation</p>
              <h2 className="text-4xl font-bold text-green-800 capitalize mb-2">{result.crop}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-2xl font-bold ${confidenceColor(result.confidence)}`}>{result.confidence}%</span>
                <span className="text-gray-500 text-sm">confidence</span>
                <div className="flex-1 min-w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>
            </div>
            <div className="text-6xl animate-bounce-gentle">🌿</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <p className="text-xs font-medium text-gray-500 mb-1">🌍 Soil Requirement</p>
              <p className="text-sm font-medium text-gray-800">{result.soil_requirement}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <p className="text-xs font-medium text-gray-500 mb-1">☀️ Climate</p>
              <p className="text-sm font-medium text-gray-800">{result.climate}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <p className="text-xs font-medium text-gray-500 mb-1">💡 Farming Tip</p>
              <p className="text-sm text-gray-700">{result.farming_tip}</p>
            </div>
          </div>

          {result.alternatives?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Alternative Options</p>
              <div className="flex gap-2 flex-wrap">
                {result.alternatives.map(a => (
                  <span key={a.crop} className="badge bg-white border border-gray-200 text-gray-600 py-1 px-3 capitalize">
                    {a.crop} — {a.confidence}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setResult(null)} className="mt-4 text-sm text-green-700 hover:text-green-800 font-medium underline">
            Make another prediction
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-5">Soil & Environmental Parameters</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="label">
                    {f.icon} {f.label}
                    <span className="text-gray-400 text-xs ml-1">({f.unit})</span>
                  </label>
                  <input
                    type="number" step="any"
                    className={`input-field ${errors[f.key] ? 'border-red-400 bg-red-50' : ''}`}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors({ ...errors, [f.key]: '' }) }}
                  />
                  {errors[f.key] ? (
                    <p className="text-red-500 text-xs mt-1">⚠ {errors[f.key]}</p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">{f.hint} ({f.min}–{f.max})</p>
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base" disabled={loading}>
              {loading ? (
                <><div className="spinner w-5 h-5"></div> Analyzing soil data...</>
              ) : (
                <><span>🧠</span> Get AI Recommendation</>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">⚡ Quick Examples</h3>
            <p className="text-xs text-gray-400 mb-3">Load sample values to test the prediction</p>
            <div className="space-y-2">
              {EXAMPLES.map(ex => (
                <button key={ex.label} onClick={() => loadExample(ex)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all text-sm font-medium text-gray-700">
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card bg-amber-50 border-amber-100">
            <h3 className="font-semibold text-amber-800 mb-2">📖 Parameter Guide</h3>
            <div className="space-y-2 text-xs text-amber-700">
              <p><strong>N (Nitrogen):</strong> Essential for leaf growth. 0–300 kg/ha</p>
              <p><strong>P (Phosphorus):</strong> Root development. 0–300 kg/ha</p>
              <p><strong>K (Potassium):</strong> Overall plant health. 0–300 kg/ha</p>
              <p><strong>Temperature:</strong> Ambient temperature in °C</p>
              <p><strong>Humidity:</strong> Relative humidity %</p>
              <p><strong>pH:</strong> Soil acidity (6–7 ideal for most crops)</p>
              <p><strong>Rainfall:</strong> Annual rainfall in mm</p>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">🤖 ML Model Info</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Algorithm: Random Forest</p>
              <p>Accuracy: ~91.6%</p>
              <p>Crops: 22 types</p>
              <p>Features: 7 parameters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
