'use client'
import { useState } from 'react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Enasverse</h1>
          <p className="text-gray-400 mt-2">Persistent memory + agentic AI</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <h2 className="text-xl font-semibold text-white">Cek Email Kamu</h2>
              <p className="text-gray-400 text-sm">
                Jika email <strong className="text-white">{email}</strong> terdaftar, kami telah mengirimkan link reset password.
                Link berlaku selama <strong className="text-white">15 menit</strong>.
              </p>
              <p className="text-gray-500 text-xs">Tidak menerima email? Cek folder spam atau</p>
              <button onClick={() => setSent(false)} className="text-indigo-400 hover:text-indigo-300 text-sm underline">
                coba kirim ulang
              </button>
              <div className="pt-2">
                <a href="/login" className="text-gray-500 hover:text-gray-400 text-sm">← Kembali ke Login</a>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Lupa Password?</h2>
              <p className="text-gray-400 text-sm mb-6">Masukkan email kamu dan kami akan mengirimkan link untuk reset password.</p>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="kamu@email.com" required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition">
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-4">
                <a href="/login" className="text-indigo-400 hover:text-indigo-300">← Kembali ke Login</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
