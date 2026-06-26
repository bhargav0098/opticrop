import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function History() {
  const [data, setData] = useState({ history: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: d } = await api.get(`/history?page=${p}&limit=8`)
      setData(d)
    } catch { toast.error('Failed to load history') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(page) }, [page])

  const handleDelete = async (id) => {
    if (!confirm('Delete this prediction?')) return
    setDeleting(id)
    try {
      await api.delete(`/history/${id}`)
      toast.success('Deleted')
      load(page)
    } catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const confidenceBadge = (c) =>
    c >= 80 ? 'bg-green-100 text-green-700' : c >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Prediction History</h1>
          <p className="text-gray-500 mt-1">{data.total} total predictions made</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner w-10 h-10"></div></div>
      ) : data.history.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-semibold text-gray-700 mb-2">No predictions yet</h3>
          <p className="text-gray-400 text-sm">Your prediction history will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.history.map(h => (
              <div key={h._id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === h._id ? null : h._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🌾</div>
                    <div>
                      <p className="font-bold text-gray-900 capitalize text-lg">{h.predictedCrop}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${confidenceBadge(h.confidence)} py-1 px-3`}>{h.confidence}% confidence</span>
                    <span className="text-gray-400 text-sm">{expanded === h._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === h._id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
                      {Object.entries(h.inputParameters).map(([k, v]) => (
                        <div key={k} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase">{k}</p>
                          <p className="font-bold text-gray-900 text-sm">{v}</p>
                        </div>
                      ))}
                    </div>
                    {h.farmingTip && (
                      <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3 mb-3">
                        💡 <strong>Tip:</strong> {h.farmingTip}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(h._id)}
                        disabled={deleting === h._id}
                        className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                      >
                        {deleting === h._id ? 'Deleting...' : '🗑 Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40 py-2 px-4">← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {data.pages}</span>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="btn-secondary text-sm disabled:opacity-40 py-2 px-4">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
