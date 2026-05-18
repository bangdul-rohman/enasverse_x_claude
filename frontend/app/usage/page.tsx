'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface UsageStats {
  plan: string
  period: string
  this_month: {
    queries: number
    uploads: number
    agent_runs: number
    index_repos: number
  }
  limits: {
    monthly_queries: number
    monthly_uploads: number
    monthly_agent_runs: number
  }
  total_all_time: number
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === -1
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-indigo-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">
          {used} / {isUnlimited ? 'Tak terbatas' : limit}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        {isUnlimited ? (
          <div className="h-full bg-green-500/30 rounded-full w-full" />
        ) : (
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: pct + '%' }} />
        )}
      </div>
    </div>
  )
}

export default function UsagePage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    api.get('/usage/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [token])

  const planColor = stats?.plan === 'pro' ? 'text-purple-400' : 'text-gray-400'
  const planBg = stats?.plan === 'pro' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-800 border-gray-700'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">Penggunaan</span>
        </div>
        <button
          onClick={() => router.push('/api-keys')}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Kelola API Keys →
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <div>
          <h1 className="text-2xl font-bold mb-2">Penggunaan & Kuota</h1>
          <p className="text-gray-400 text-sm">Pantau penggunaan bulananmu dan batas kuota berdasarkan plan.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <div className="text-center py-12 text-gray-500">Gagal memuat data penggunaan.</div>
        ) : (
          <>
            {/* Plan Badge */}
            <div className={`p-5 rounded-2xl border ${planBg} flex items-center justify-between`}>
              <div>
                <p className="text-gray-400 text-sm mb-1">Plan saat ini</p>
                <p className={`text-2xl font-bold capitalize ${planColor}`}>{stats.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs mb-1">Periode</p>
                <p className="text-white font-medium">{stats.period}</p>
              </div>
              {stats.plan === 'free' && (
                <button
                  onClick={() => router.push('/#pricing')}
                  className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Upgrade Pro
                </button>
              )}
            </div>

            {/* Usage Bars */}
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-6">
              <h2 className="font-semibold">Penggunaan Bulan Ini</h2>
              <UsageBar
                used={stats.this_month.queries}
                limit={stats.limits.monthly_queries}
                label="Query ke AI"
              />
              <UsageBar
                used={stats.this_month.uploads}
                limit={stats.limits.monthly_uploads}
                label="Upload Dokumen"
              />
              <UsageBar
                used={stats.this_month.agent_runs}
                limit={stats.limits.monthly_agent_runs}
                label="Agent Task"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Query Bulan Ini', value: stats.this_month.queries, icon: '💬' },
                { label: 'Upload Bulan Ini', value: stats.this_month.uploads, icon: '📄' },
                { label: 'Agent Task', value: stats.this_month.agent_runs, icon: '🤖' },
                { label: 'Total Semua Waktu', value: stats.total_all_time, icon: '📊' },
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Plan Features */}
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <h2 className="font-semibold mb-4">Fitur Plan {stats.plan === 'pro' ? 'Pro' : 'Free'}</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                {stats.plan === 'free' ? [
                  '100 query per bulan',
                  '5 upload dokumen per bulan',
                  '10 agent task per bulan',
                  'Chat history 30 hari',
                  'API access terbatas',
                ] : [
                  'Unlimited query',
                  'Unlimited upload dokumen',
                  'Unlimited agent task',
                  'Chat history selamanya',
                  'Full API access',
                  'Priority support',
                ].map((feat, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              {stats.plan === 'free' && (
                <div className="mt-5 pt-5 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-3">Butuh lebih? Upgrade ke Pro untuk akses tak terbatas.</p>
                  <button
                    onClick={() => router.push('/#pricing')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Lihat Harga →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
