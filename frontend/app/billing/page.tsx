'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface BillingStatus {
  plan: string
  expires_at: string | null
  stripe_configured: boolean
  upgrade_available: boolean
}

export default function BillingPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    api.get('/billing/status').then(r => setStatus(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [token])

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await api.post('/billing/create-checkout')
      window.location.href = res.data.checkout_url
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Gagal membuka halaman pembayaran.')
      setUpgrading(false)
    }
  }

  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

  const isPro = status?.plan === 'pro'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">Billing & Langganan</span>
        </div>
        <button onClick={() => router.push('/usage')} className="text-sm text-indigo-400 hover:text-indigo-300">
          Lihat Penggunaan →
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Billing & Langganan</h1>
          <p className="text-gray-400 text-sm">Kelola plan dan pembayaranmu.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Current Plan */}
            <div className={`p-6 rounded-2xl border ${isPro ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Plan Aktif</p>
                  <p className={`text-3xl font-bold capitalize ${isPro ? 'text-purple-400' : 'text-white'}`}>
                    {status?.plan || 'free'}
                  </p>
                </div>
                {isPro && (
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl">
                    ⭐
                  </div>
                )}
              </div>
              {isPro && status?.expires_at && (
                <p className="text-gray-400 text-sm">
                  Aktif hingga: <span className="text-white font-medium">{fmt(status.expires_at)}</span>
                </p>
              )}
              {!isPro && (
                <p className="text-gray-500 text-sm">Gratis selamanya — 100 query/bulan, 5 dokumen.</p>
              )}
            </div>

            {/* Pricing Cards */}
            {!isPro && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free */}
                <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
                  <h3 className="text-lg font-bold mb-1">Free</h3>
                  <p className="text-3xl font-bold mb-4">Rp 0<span className="text-base text-gray-500 font-normal">/bulan</span></p>
                  <ul className="space-y-2 text-sm text-gray-400 mb-6">
                    {['100 query/bulan', '5 dokumen', 'Chat history 30 hari', 'API access terbatas'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="text-gray-600">✓</span>{f}</li>
                    ))}
                  </ul>
                  <div className="w-full py-3 rounded-xl bg-gray-800 text-gray-500 text-sm text-center font-medium">
                    Plan Saat Ini
                  </div>
                </div>

                {/* Pro */}
                <div className="p-6 rounded-2xl bg-gray-900 border-2 border-indigo-500 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-xs font-semibold">
                    Terpopuler
                  </div>
                  <h3 className="text-lg font-bold mb-1">Pro</h3>
                  <p className="text-3xl font-bold mb-4">Rp 99.000<span className="text-base text-gray-500 font-normal">/bulan</span></p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-6">
                    {['Unlimited query', 'Unlimited dokumen', 'Chat history selamanya', 'Full API access', 'Priority support', 'Export JSON'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="text-indigo-400">✓</span>{f}</li>
                    ))}
                  </ul>
                  {status?.stripe_configured ? (
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      {upgrading ? 'Mengarahkan ke pembayaran...' : 'Upgrade ke Pro →'}
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs text-center">
                      Pembayaran belum dikonfigurasi. Hubungi admin untuk upgrade manual.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pro already */}
            {isPro && (
              <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
                <h2 className="font-semibold mb-3">Kamu sudah di plan Pro!</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Semua fitur tersedia tanpa batas. Terima kasih atas kepercayaanmu.
                </p>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm text-center">
                  Untuk membatalkan langganan, hubungi support kami.
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <h2 className="font-semibold mb-4">FAQ Billing</h2>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <p className="text-white font-medium mb-1">Metode pembayaran apa yang diterima?</p>
                  <p>Kartu kredit/debit (Visa, Mastercard) via Stripe. Tambahan metode menyusul.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Apakah bisa cancel kapanpun?</p>
                  <p>Ya. Cancel bisa dilakukan kapanpun dan plan Pro tetap aktif hingga akhir periode.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Data saya aman saat downgrade?</p>
                  <p>Ya. Semua data tetap tersimpan, namun akses akan dibatasi sesuai plan Free.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
