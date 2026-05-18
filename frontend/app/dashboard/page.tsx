'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import ChatHistory from '@/components/ChatHistory'
import FileUpload from '@/components/FileUpload'

type Tab = 'query' | 'agent' | 'upload' | 'indexer'

export default function DashboardPage() {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [tab, setTab] = useState<Tab>('query')
  const [showHistory, setShowHistory] = useState(false)
  const [user, setUser] = useState<{email: string; full_name: string} | null>(null)

  const [question, setQuestion] = useState('')
  const [queryResult, setQueryResult] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)

  const [task, setTask] = useState('')
  const [agentResult, setAgentResult] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)

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

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-bold text-lg">Enasverse</span>
            {user && <span className="text-gray-500 text-sm ml-2">{user.email}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Riwayat Chat
            </button>
            <button
              onClick={() => { logout(); router.push('/login') }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="flex gap-1 px-6 pt-4">
          {(['query', 'agent', 'upload', 'indexer'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t === 'query' ? 'Tanya AI' : t === 'agent' ? 'Agent' : t === 'upload' ? 'Upload File' : 'Index GitHub'}
            </button>
          ))}
        </div>

        <div className="flex-1 px-6 py-6 max-w-3xl w-full mx-auto">

          {tab === 'query' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tanya AI</h2>
              <form onSubmit={handleQuery} className="space-y-3">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Tulis pertanyaanmu..." required
                />
                <button type="submit" disabled={queryLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition">
                  {queryLoading ? 'Memproses...' : 'Tanya'}
                </button>
              </form>
              {queryResult && (
                <div className="rounded-lg p-4 text-sm bg-gray-800 border border-gray-700 text-gray-100 whitespace-pre-wrap">
                  {queryResult}
                </div>
              )}
            </div>
          )}

          {tab === 'agent' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Agent Task</h2>
              <form onSubmit={handleAgent} className="space-y-3">
                <input
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Deskripsi task untuk agent..." required
                />
                <button type="submit" disabled={agentLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition">
                  {agentLoading ? 'Menjalankan...' : 'Jalankan Agent'}
                </button>
              </form>
              {agentResult && (
                <div className="rounded-lg p-4 text-sm bg-gray-800 border border-gray-700 text-gray-100 whitespace-pre-wrap">
                  {agentResult}
                </div>
              )}
            </div>
          )}

          {tab === 'upload' && <FileUpload />}

          {tab === 'indexer' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Index GitHub Repo</h2>
              <form onSubmit={handleIndex} className="space-y-3">
                <input
                  value={repo} onChange={e => setRepo(e.target.value)}
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
      <ChatHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  )
}
