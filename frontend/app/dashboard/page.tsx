'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

type Tab = 'query' | 'agent' | 'upload' | 'indexer'

export default function DashboardPage() {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [tab, setTab] = useState<Tab>('query')
  const [user, setUser] = useState<{email: string; full_name: string} | null>(null)

  // Query state
  const [question, setQuestion] = useState('')
  const [queryResult, setQueryResult] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)

  // Agent state
  const [task, setTask] = useState('')
  const [agentResult, setAgentResult] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)

  // Upload state
  const [uploadText, setUploadText] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')

  // Indexer state
  const [repo, setRepo] = useState('')
  const [indexMsg, setIndexMsg] = useState('')
  const [indexLoading, setIndexLoading] = useState(false)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => { logout(); router.push('/login') })
  }, [token])

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    setQueryLoading(true)
    setQueryResult('')
    try {
      const res = await api.post('/query', { question, tenant_id: 'tenant-1' })
      setQueryResult(res.data.answer)
    } catch { setQueryResult('Gagal mengambil jawaban.') }
    finally { setQueryLoading(false) }
  }

  const handleAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAgentLoading(true)
    setAgentResult('')
    try {
      const res = await api.post('/agent/run', { task, tenant_id: 'tenant-1' })
      setAgentResult(res.data.result)
    } catch { setAgentResult('Agent gagal menjalankan task.') }
    finally { setAgentLoading(false) }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/documents/index', { content: uploadText, tenant_id: 'tenant-1', metadata: {} })
      setUploadMsg('Dokumen berhasil diindeks!')
      setUploadText('')
    } catch { setUploadMsg('Gagal mengindeks dokumen.') }
  }

  const handleIndex = async (e: React.FormEvent) => {
    e.preventDefault()
    setIndexLoading(true)
    setIndexMsg('')
    try {
      await api.post('/indexer/index-repo', { repo, branch: 'main', tenant_id: 'tenant-1' })
      setIndexMsg(`Repo ${repo} berhasil diindeks!`)
    } catch { setIndexMsg('Gagal mengindeks repo.') }
    finally { setIndexLoading(false) }
  }

  const tabs: {id: Tab; label: string; icon: string}[] = [
    { id: 'query', label: 'Chat RAG', icon: '💬' },
    { id: 'agent', label: 'Agent', icon: '🤖' },
    { id: 'upload', label: 'Upload Dokumen', icon: '📄' },
    { id: 'indexer', label: 'Index Repo', icon: '🗂️' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-400">Enasverse</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-gray-400 text-sm">{user.email}</span>}
          <button onClick={() => { logout(); router.push('/login') }}
            className="text-gray-400 hover:text-white text-sm transition">Keluar</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'query' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chat dengan RAG</h2>
            <form onSubmit={handleQuery} className="space-y-3">
              <textarea value={question} onChange={e => setQuestion(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                rows={3} placeholder="Tanya sesuatu..." required />
              <button type="submit" disabled={queryLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition">
                {queryLoading ? 'Memproses...' : 'Kirim'}
              </button>
            </form>
            {queryResult && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 whitespace-pre-wrap">
                {queryResult}
              </div>
            )}
          </div>
        )}

        {tab === 'agent' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Jalankan Agent</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg p-3 text-sm">
              ⚠️ Agent bisa membaca dan menulis file. Pastikan task yang diberikan aman.
            </div>
            <form onSubmit={handleAgent} className="space-y-3">
              <textarea value={task} onChange={e => setTask(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                rows={3} placeholder="Contoh: Cari bug di file main.py dan jelaskan" required />
              <button type="submit" disabled={agentLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition">
                {agentLoading ? 'Agent berjalan...' : 'Jalankan Agent'}
              </button>
            </form>
            {agentResult && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 whitespace-pre-wrap">
                {agentResult}
              </div>
            )}
          </div>
        )}

        {tab === 'upload' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upload Dokumen</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <textarea value={uploadText} onChange={e => setUploadText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                rows={6} placeholder="Paste konten dokumen di sini..." required />
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                Index Dokumen
              </button>
            </form>
            {uploadMsg && (
              <div className={`rounded-lg p-3 text-sm ${uploadMsg.includes('berhasil') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {uploadMsg}
              </div>
            )}
          </div>
        )}

        {tab === 'indexer' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Index GitHub Repo</h2>
            <form onSubmit={handleIndex} className="space-y-3">
              <input value={repo} onChange={e => setRepo(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                placeholder="username/repo-name" required />
              <button type="submit" disabled={indexLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition">
                {indexLoading ? 'Mengindeks...' : 'Index Repo'}
              </button>
            </form>
            {indexMsg && (
              <div className={`rounded-lg p-3 text-sm ${indexMsg.includes('berhasil') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {indexMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
