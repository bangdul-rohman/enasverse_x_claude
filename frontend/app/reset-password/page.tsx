'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) setError('Token tidak valid. Silakan minta reset password ulang.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Password tidak cocok'); return }
    if (password.length < 8) { setError('Password minimal 8 karakter'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Token tidak valid atau sudah kedaluwarsa.')
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-semibold text-white">Password Berhasil Diubah!</h2>
              <p className="text-gray-400 text-sm">Kamu akan diarahkan ke halaman login dalam 3 detik...</p>
              <a href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">Login sekarang →</a>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Buat Password Baru</h2>
              <p className="text-gray-400 text-sm mb-6">Masukkan password baru kamu di bawah ini.</p>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Password Baru</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Minimal 8 karakter" required minLength={8} disabled={!token} />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Konfirmasi Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ulangi password baru" required disabled={!token} />
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition">
                  {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
