'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const setToken = useAuthStore((s) => s.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      setToken(res.data.access_token)
      router.push('/dashboard')
    } catch {
      setError('Email atau password salah')
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
        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 space-y-4 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Masuk</h2>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="kamu@email.com" required />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
          <p className="text-center text-gray-500 text-sm">
            Belum punya akun? <a href="/register" className="text-indigo-400 hover:text-indigo-300">Daftar</a>
          </p>
        </form>
      </div>
    </div>
  )
}
