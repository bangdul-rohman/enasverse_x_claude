'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<{email: string} | null>(null)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => { logout(); router.push('/login') })
  }, [token])

  const exportData = async () => {
    setExporting(true)
    try {
      const res = await api.get('/gdpr/export')
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'enasverse-data.json'; a.click()
      URL.revokeObjectURL(url)
      setMessage('Data berhasil diekspor!')
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || 'Gagal export data.')
    } finally { setExporting(false) }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      setMessage('Email tidak cocok. Ketik emailmu untuk konfirmasi.')
      return
    }
    setLoading(true)
    try {
      await api.delete('/gdpr/delete-account')
      logout()
      router.push('/?deleted=1')
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || 'Gagal menghapus akun.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm">← Dashboard</button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">Privasi & Keamanan</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Privasi & Keamanan</h1>
          <p className="text-gray-400 text-sm">Kelola data dan keamanan akunmu sesuai GDPR.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${message.includes('berhasil') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Export Data */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h2 className="font-semibold mb-2">Export Data Saya</h2>
          <p className="text-gray-400 text-sm mb-4">
            Download semua data yang kami simpan tentang akunmu dalam format JSON.
            Ini termasuk profil, riwayat penggunaan, dan sesi chat.
          </p>
          <button onClick={exportData} disabled={exporting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors">
            {exporting ? 'Mengekspor...' : 'Download Data Saya'}
          </button>
        </div>

        {/* Security Info */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h2 className="font-semibold mb-4">Informasi Keamanan</h2>
          <div className="space-y-3 text-sm text-gray-400">
            {[
              { icon: '🔒', text: 'Password di-hash dengan bcrypt — tidak bisa dibaca siapapun' },
              { icon: '🔑', text: 'Autentikasi menggunakan JWT yang expire otomatis' },
              { icon: '🗄️', text: 'Data tersimpan di PostgreSQL terenkripsi di Railway' },
              { icon: '🌐', text: 'Semua komunikasi menggunakan HTTPS/TLS' },
              { icon: '🏝️', text: 'Data setiap user terisolasi — tidak bisa diakses user lain' },
              { icon: '📋', text: 'Semua aksi penting dicatat di audit log' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-red-500/30">
          <h2 className="font-semibold text-red-400 mb-2">Hapus Akun</h2>
          <p className="text-gray-400 text-sm mb-4">
            Hapus akun dan semua data secara permanen. Tindakan ini tidak bisa dibatalkan.
            Semua dokumen, riwayat chat, dan API key akan dihapus.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Ketik emailmu untuk konfirmasi: <span className="text-gray-400">{user?.email}</span>
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Email kamu"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              onClick={deleteAccount}
              disabled={loading || deleteConfirm !== user?.email}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? 'Menghapus...' : 'Hapus Akun Saya Selamanya'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
