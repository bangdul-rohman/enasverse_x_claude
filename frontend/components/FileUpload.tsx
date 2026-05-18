'use client'

import { useState, useRef, useCallback } from 'react'
import api from '@/lib/api'

interface UploadResult {
  filename: string
  file_type: string
  file_size_kb: number
  total_chunks: number
  indexed: number
  message: string
}

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  result?: UploadResult
  error?: string
  progress: number
}

export default function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = ['.pdf', '.docx', '.doc', '.txt', '.md', '.csv']
  const MAX_SIZE_MB = 10

  const processFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setFiles(prev => [...prev, {
        name: file.name, size: file.size, status: 'error',
        error: `Format tidak didukung. Gunakan: ${ACCEPTED.join(', ')}`, progress: 0
      }])
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFiles(prev => [...prev, {
        name: file.name, size: file.size, status: 'error',
        error: `File terlalu besar. Maksimal ${MAX_SIZE_MB}MB.`, progress: 0
      }])
      return
    }

    const entry: UploadedFile = { name: file.name, size: file.size, status: 'uploading', progress: 0 }
    setFiles(prev => [...prev, entry])
    const idx = -1

    // Simulate progress
    const timer = setInterval(() => {
      setFiles(prev => prev.map(f =>
        f.name === file.name && f.status === 'uploading'
          ? { ...f, progress: Math.min(f.progress + 15, 85) }
          : f
      ))
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenant_id', 'default')

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(timer)
      setFiles(prev => prev.map(f =>
        f.name === file.name && f.status === 'uploading'
          ? { ...f, status: 'success', progress: 100, result: res.data }
          : f
      ))
    } catch (err: any) {
      clearInterval(timer)
      const errMsg = err?.response?.data?.detail || 'Gagal mengupload file.'
      setFiles(prev => prev.map(f =>
        f.name === file.name && f.status === 'uploading'
          ? { ...f, status: 'error', progress: 0, error: errMsg }
          : f
      ))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    Array.from(e.dataTransfer.files).forEach(processFile)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile)
      e.target.value = ''
    }
  }

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Upload Dokumen</h2>
        <p className="text-gray-500 text-sm">Mendukung PDF, DOCX, TXT, MD, CSV — maksimal 10MB per file</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-4xl mb-3">
          {isDragging ? '📂' : '📄'}
        </div>
        <p className="text-white font-medium mb-1">
          {isDragging ? 'Lepaskan file di sini' : 'Drag & drop file, atau klik untuk pilih'}
        </p>
        <p className="text-gray-500 text-sm">PDF, DOCX, TXT, MD, CSV — maks 10MB</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {f.status === 'uploading' ? '⏳' : f.status === 'success' ? '✅' : '❌'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">{f.name}</p>
                  <button
                    onClick={() => removeFile(f.name)}
                    className="text-gray-600 hover:text-gray-400 flex-shrink-0 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatSize(f.size)}</p>

                {/* Progress bar */}
                {f.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: f.progress + '%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mengupload & mengindeks...</p>
                  </div>
                )}

                {/* Success info */}
                {f.status === 'success' && f.result && (
                  <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400">{f.result.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {f.result.total_chunks} bagian · {f.result.file_size_kb} KB
                    </p>
                  </div>
                )}

                {/* Error */}
                {f.status === 'error' && (
                  <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{f.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
        <p className="text-xs text-gray-500 font-medium mb-2">Tips penggunaan:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Setelah upload, dokumen langsung bisa ditanya di tab "Tanya AI"</li>
          <li>• File besar akan dipecah otomatis menjadi beberapa bagian</li>
          <li>• Bisa upload beberapa file sekaligus</li>
        </ul>
      </div>
    </div>
  )
}
