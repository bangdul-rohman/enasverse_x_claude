'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface APIKey {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
  expires_at: string | null
}

export default function APIKeysPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetchKeys()
  }, [token])

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api-keys/')
      setKeys(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/api-keys/', { name: newKeyName })
      setNewKey(res.data.key)
      setNewKeyName('')
      fetchKeys()
    } catch (e) { console.error(e) }
    finally { setCreating(false) }
  }

  const revokeKey = async (id: string) => {
    try {
      await api.delete(`/api-keys/${id}`)
      setKeys(prev => prev.filter(k => k.id !== id))
    } catch (e) { console.error(e) }
    finally { setRevokeId(null) }
  }

  const copyKey = async () => {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (iso: string | null) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">API Keys</span>
        </div>
        <a
          href="https://enasversexclaude-production.up.railway.app/docs"
          target="_blank"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Lihat Dokumentasi API →
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-gray-400 text-sm">
            Gunakan API key untuk mengakses Enasverse secara programatik dari aplikasimu.
          </p>
        </div>

        {/* New Key Alert */}
        {newKey && (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-green-400 font-semibold text-sm mb-1">API Key berhasil dibuat!</p>
                <p className="text-yellow-400 text-xs">Simpan key ini sekarang. Tidak akan ditampilkan lagi setelah kamu menutup ini.</p>
              </div>
              <button onClick={() => setNewKey(null)} className="text-gray-500 hover:text-white text-xs flex-shrink-0">✕ Tutup</button>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-900 rounded-lg px-4 py-3 text-sm text-green-300 font-mono break-all border border-gray-700">
                {newKey}
              </code>
              <button
                onClick={copyKey}
                className={`px-4 py-3 rounded-lg text-sm transition-colors flex-shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        )}

        {/* Create Form */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h2 className="text-base font-semibold mb-4">Buat API Key Baru</h2>
          <form onSubmit={createKey} className="flex gap-3">
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Nama key (contoh: Production App)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-gray-500"
              required
            />
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0"
            >
              {creating ? 'Membuat...' : '+ Buat Key'}
            </button>
          </form>
        </div>

        {/* Keys List */}
        <div>
          <h2 className="text-base font-semibold mb-4">API Keys Aktif</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <div className="text-4xl mb-3">🔑</div>
              <p>Belum ada API key. Buat satu untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map(k => (
                <div key={k.id} className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${k.is_active ? 'bg-gray-900 border-gray-800' : 'bg-gray-900/50 border-gray-800/50 opacity-60'}`}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔑</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{k.name}</span>
                      {k.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 text-xs">Nonaktif</span>
                      )}
                    </div>
                    <code className="text-xs text-gray-500 font-mono">{k.key_prefix}••••••••••••••••••••••</code>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      <span>Dibuat: {fmt(k.created_at)}</span>
                      <span>Terakhir dipakai: {fmt(k.last_used_at)}</span>
                    </div>
                  </div>
                  {k.is_active && (
                    <button
                      onClick={() => setRevokeId(k.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors flex-shrink-0"
                    >
                      Cabut
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Example */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h2 className="text-base font-semibold mb-4">Contoh Penggunaan</h2>
          <pre className="text-xs text-gray-400 bg-gray-950 rounded-xl p-4 overflow-x-auto border border-gray-800">
{`curl -X POST https://enasversexclaude-production.up.railway.app/query \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Apa isi dokumen saya?", "tenant_id": "default"}'`}
          </pre>
          <p className="text-xs text-gray-600 mt-3">
            Ganti <code className="text-gray-400">YOUR_API_KEY</code> dengan API key yang kamu buat di atas.
            <a href="https://enasversexclaude-production.up.railway.app/docs" target="_blank" className="text-indigo-400 ml-2 hover:underline">
              Lihat semua endpoint →
            </a>
          </p>
        </div>

      </div>

      {/* Revoke Confirm Modal */}
      {revokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Cabut API key ini?</h3>
            <p className="text-gray-400 text-sm mb-5">Key yang dicabut tidak bisa diaktifkan kembali dan semua akses menggunakan key ini akan berhenti.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRevokeId(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">Batal</button>
              <button onClick={() => revokeKey(revokeId)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors">Cabut Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
