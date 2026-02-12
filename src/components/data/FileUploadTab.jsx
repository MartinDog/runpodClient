import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Upload, Loader2, FileUp, X } from 'lucide-react'

export default function FileUploadTab({ apiBase }) {
  const [userId, setUserId] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId.trim() || 'default')
      formData.append('ingestToVectorDb', 'true')

      const res = await fetch(`${apiBase}/files/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      toast.success(`File uploaded: ${data.chunksStored || 0} chunks stored`)
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">File Upload</h2>
      <p className="text-sm text-gray-400 mb-6">
        Upload PDF, Word, Excel, or text files. Text is extracted, chunked, and stored in ChromaDB.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. user123"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.html,.htm"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileUp size={24} className="text-purple-400" />
              <div className="text-left">
                <p className="text-sm text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileRef.current) fileRef.current.value = ''
                }}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mx-auto text-gray-500 mb-3" />
              <p className="text-sm text-gray-400">
                Drag & drop a file here, or <span className="text-purple-400">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel, Text, HTML</p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {loading ? 'Uploading...' : 'Upload & Ingest'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg space-y-2">
          <p className="text-sm text-green-400 font-medium">File Ingested Successfully</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Original File:</div>
            <div className="text-white">{result.originalFilename}</div>
            <div className="text-gray-400">Text Length:</div>
            <div className="text-white">{result.textLength?.toLocaleString()} chars</div>
            <div className="text-gray-400">Chunks Stored:</div>
            <div className="text-white">{result.chunksStored}</div>
          </div>
          {result.vectorDbDocIds?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Document IDs:</p>
              <div className="flex flex-wrap gap-1">
                {result.vectorDbDocIds.map((id) => (
                  <code key={id} className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                    {id}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
