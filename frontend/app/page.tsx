'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const features = [
  {
    icon: '🧠',
    title: 'RAG — Tanya Dokumenmu',
    desc: 'Upload dokumen apapun, lalu tanya pertanyaan. AI menjawab berdasarkan isi dokumenmu, bukan halusinasi.'
  },
  {
    icon: '🤖',
    title: 'Agentic AI',
    desc: 'Delegasikan task kompleks ke AI Agent. Biarkan ia berpikir multi-langkah dan menyelesaikan pekerjaanmu.'
  },
  {
    icon: '📁',
    title: 'GitHub Indexer',
    desc: 'Index seluruh repository GitHub-mu dalam sekali klik. Tanya tentang kode, dokumentasi, atau arsitektur.'
  },
  {
    icon: '🕐',
    title: 'Memori Persisten',
    desc: 'Semua percakapan tersimpan permanen. Lanjutkan diskusi kapanpun, dari mana saja.'
  },
  {
    icon: '🔐',
    title: 'Multi-tenant & Aman',
    desc: 'Data setiap pengguna terisolasi. Tidak ada kebocoran antar akun, dijamin.'
  },
  {
    icon: '⚡',
    title: 'API-First',
    desc: 'Semua fitur tersedia via REST API. Integrasikan ke aplikasimu dalam hitungan menit.'
  }
]

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'selamanya',
    color: 'border-gray-700',
    badge: '',
    features: [
      '100 query / bulan',
      '5 dokumen',
      'Chat history 30 hari',
      'API access terbatas',
      'Community support'
    ],
    cta: 'Mulai Gratis',
    ctaStyle: 'bg-gray-800 hover:bg-gray-700 text-white'
  },
  {
    name: 'Pro',
    price: '99.000',
    period: 'per bulan',
    color: 'border-indigo-500',
    badge: 'Terpopuler',
    features: [
      'Unlimited query',
      'Unlimited dokumen',
      'Chat history selamanya',
      'Full API access',
      'Priority support',
      'Export JSON'
    ],
    cta: 'Mulai Pro',
    ctaStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'hubungi kami',
    color: 'border-purple-500',
    badge: '',
    features: [
      'Semua fitur Pro',
      'Dedicated instance',
      'Custom model',
      'SLA 99.9%',
      'Onboarding khusus',
      'Invoice bulanan'
    ],
    cta: 'Hubungi Kami',
    ctaStyle: 'bg-purple-600 hover:bg-purple-700 text-white'
  }
]

const faqs = [
  {
    q: 'Apakah data saya aman?',
    a: 'Ya. Setiap akun memiliki namespace terisolasi di vector database. Data antar pengguna tidak bisa saling diakses.'
  },
  {
    q: 'AI apa yang digunakan?',
    a: 'Enasverse menggunakan Claude dari Anthropic — salah satu AI paling canggih dan aman di dunia saat ini.'
  },
  {
    q: 'Apakah ada masa percobaan Pro?',
    a: 'Saat ini belum. Tapi plan Free sudah cukup untuk mencoba semua fitur utama tanpa kartu kredit.'
  },
  {
    q: 'Bisa diintegrasikan ke aplikasi saya?',
    a: 'Tentu. Enasverse menyediakan REST API lengkap. Dokumentasi tersedia di /docs.'
  }
]

export default function LandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Enasverse
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            AI yang tahu
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
              semua konteksmu
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload dokumen, tanya kode GitHub, atau delegasikan task ke AI Agent.
            Enasverse menyimpan memori percakapanmu secara permanen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
              Mulai Gratis — Tanpa Kartu Kredit
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors border border-gray-700"
            >
              Sudah punya akun →
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Gratis selamanya untuk 100 query/bulan. Tidak perlu kartu kredit.
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm mb-6">DIPERCAYA OLEH DEVELOPER & TIM DI SELURUH INDONESIA</p>
          <div className="flex flex-wrap justify-center gap-12 text-gray-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm mt-1">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm mt-1">Query Diproses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">&lt; 1s</div>
              <div className="text-sm mt-1">Rata-rata Respons</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Semua yang kamu butuhkan</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Dari RAG hingga Agent AI — satu platform untuk semua kebutuhan AI-mu.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Cara kerja Enasverse</h2>
          <p className="text-gray-400 mb-16">Tiga langkah, langsung bisa dipakai.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Daftar & Login', desc: 'Buat akun gratis dalam 30 detik. Tidak perlu kartu kredit.' },
              { step: '02', title: 'Upload Konteks', desc: 'Upload dokumen atau index repository GitHub-mu.' },
              { step: '03', title: 'Tanya & Delegasikan', desc: 'Mulai tanya AI atau jalankan Agent untuk task kompleks.' }
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent z-10" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Harga yang transparan</h2>
            <p className="text-gray-400 text-lg">Mulai gratis, upgrade saat kamu siap.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl bg-gray-900 border-2 ${plan.color} transition-all hover:scale-105`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {plan.price !== 'Custom' && <span className="text-gray-400 text-sm">Rp</span>}
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{plan.period}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-indigo-400">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push(plan.name === 'Enterprise' ? '#faq' : '/register')}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pertanyaan umum</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-medium">{faq.q}</span>
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20">
            <h2 className="text-4xl font-bold mb-4">
              Siap memulai?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Bergabung dengan ratusan pengguna yang sudah menggunakan Enasverse untuk bekerja lebih cerdas.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
              Daftar Sekarang — Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Enasverse
              </span>
              <p className="text-gray-600 text-sm mt-1">AI Memory Platform untuk Developer Indonesia</p>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="/login" className="hover:text-white transition-colors">Login</a>
              <a href="https://enasversexclaude-production.up.railway.app/docs" target="_blank" className="hover:text-white transition-colors">API Docs</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-700 text-xs">
            © 2026 Enasverse. Dibuat dengan ❤️ di Indonesia. Powered by Claude AI.
          </div>
        </div>
      </footer>

    </div>
  )
}
