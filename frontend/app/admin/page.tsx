'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface User { id: string; email: string; plan: string; tenant_id: string; created_at: string }
interface Stats { total_users: number; free_users: number; pro_users: number; total_queries: number; total_uploads: number; mrr_idr: number }

export default function AdminPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/users').then(r => setUsers(r.data)),
    ]).catch(e => {
      setError(e?.response?.data?.detail || 'Akses ditolak')
    }).finally(() => setLoading(false))
  }, [token])

  const updatePlan = async (userId: string, plan: string) => {
    setUpdatingId(userId)
    try {
      await api.patch(`/admin/users/${userId}/plan?plan=${plan}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Gagal update plan')
    } finally { setUpdatingId(null) }
  }

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()))
  const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString('id-ID') : '-'

  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-4">🚫</div><p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm">← Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm">← Dashboard</button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">Admin Panel</span>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Admin Only</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'text-white' },
                  { label: 'Free Users', value: stats.free_users, icon: '🆓', color: 'text-gray-400' },
                  { label: 'Pro Users', value: stats.pro_users, icon: '⭐', color: 'text-purple-400' },
                  { label: 'Total Query', value: stats.total_queries, icon: '💬', color: 'text-indigo-400' },
                  { label: 'Total Upload', value: stats.total_uploads, icon: '📄', color: 'text-green-400' },
                  { label: 'MRR', value: 'Rp ' + (stats.mrr_idr / 1000).toFixed(0) + 'K', icon: '💰', color: 'text-yellow-400' },
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center">
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* User Table */}
            <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold">Semua User ({users.length})</h2>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari email..."
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-48"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs">
                      <th className="text-left px-5 py-3">Email</th>
                      <th className="text-left px-5 py-3">Plan</th>
                      <th className="text-left px-5 py-3">Tenant ID</th>
                      <th className="text-left px-5 py-3">Daftar</th>
                      <th className="text-left px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 text-white">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${u.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">{u.tenant_id?.slice(0, 12)}...</td>
                        <td className="px-5 py-3 text-gray-500">{fmt(u.created_at)}</td>
                        <td className="px-5 py-3">
                          {updatingId === u.id ? (
                            <div className="w-4 h-4 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="flex gap-2">
                              {u.plan === 'free' ? (
                                <button onClick={() => updatePlan(u.id, 'pro')}
                                  className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-xs transition-colors">
                                  → Pro
                                </button>
                              ) : (
                                <button onClick={() => updatePlan(u.id, 'free')}
                                  className="px-2.5 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600 text-xs transition-colors">
                                  → Free
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-gray-600">Tidak ada user ditemukan</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
