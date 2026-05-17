'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ChatSession {
  id: number
  session_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ChatHistory({ isOpen, onClose }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ChatSession[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/history/sessions')
      setSessions(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) fetchSessions()
  }, [isOpen, fetchSessions])

  const openSession = async (session: ChatSession) => {
    setSelectedSession(session)
    setLoadingMsg(true)
    try {
      const res = await api.get(`/history/sessions/${session.session_id}`)
      setMessages(res.data.messages || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMsg(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/history/sessions/${sessionId}`)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null)
        setMessages([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeleteId(null)
    }
  }

  const exportSession = async (sessionId: string) => {
    try {
      const res = await api.get(`/history/export/${sessionId}`)
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${sessionId}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (!q.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await api.get(`/history/sessions?search=${encodeURIComponent(q)}`)
      setSearchResults(res.data)
    } catch (e) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const displayedSessions = search.trim() ? searchResults : sessions

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-4xl mx-auto shadow-2xl overflow-hidden rounded-none md:rounded-2xl md:m-auto md:h-[85vh]">
        
        {/* Sidebar — Session List */}
        <div className="flex flex-col w-72 bg-gray-950 border-r border-gray-800 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕐</span>
              <h2 className="text-white font-semibold text-sm">Riwayat Chat</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-3 border-b border-gray-800">
            <div className="relative">
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Cari sesi..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm gap-2">
                <span className="text-2xl">{search ? '🔍' : '💬'}</span>
                <span>{search ? 'Tidak ditemukan' : 'Belum ada riwayat'}</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {displayedSessions.map(session => (
                  <div
                    key={session.session_id}
                    onClick={() => openSession(session)}
                    className={`group px-3 py-3 cursor-pointer transition-colors ${
                      selectedSession?.session_id === session.session_id
                        ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                        : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate font-medium">
                          {session.title || 'Sesi tanpa judul'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(session.updated_at)} · {session.message_count} pesan
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); exportSession(session.session_id) }}
                          title="Export JSON"
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(session.session_id) }}
                          title="Hapus"
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main — Chat Bubbles */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
                <div>
                  <h3 className="text-white font-semibold text-sm truncate max-w-xs">
                    {selectedSession.title || 'Sesi tanpa judul'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(selectedSession.created_at)} · {formatTime(selectedSession.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => exportSession(selectedSession.session_id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export JSON
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {loadingMsg ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Tidak ada pesan
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-1">
                          AI
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-indigo-300' : 'text-gray-500'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs flex-shrink-0 ml-2 mt-1">
                          You
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
              <span className="text-5xl">💬</span>
              <p className="text-sm">Pilih sesi untuk melihat percakapan</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {deleteId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Hapus sesi ini?</h3>
            <p className="text-gray-400 text-sm mb-5">Semua pesan dalam sesi ini akan dihapus permanen.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => deleteSession(deleteId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
