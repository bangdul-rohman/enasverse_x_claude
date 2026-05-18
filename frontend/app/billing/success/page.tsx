'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/usage'), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Pembayaran Berhasil!</h1>
        <p className="text-gray-400 mb-8">
          Selamat! Akunmu telah diupgrade ke plan Pro. Nikmati semua fitur tanpa batas.
        </p>
        <button
          onClick={() => router.push('/usage')}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-colors"
        >
          Lihat Dashboard Saya →
        </button>
        <p className="text-gray-600 text-sm mt-4">
          Mengalihkan otomatis dalam 5 detik...
        </p>
      </div>
    </div>
  )
}
