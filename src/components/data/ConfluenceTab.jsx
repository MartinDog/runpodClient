import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, FolderOpen, Play } from 'lucide-react'

export default function ConfluenceTab({ apiBase }) {
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!path.trim()) {
      toast.error('Directory path is required')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(
        `${apiBase}/knowledge-base/ingest-html?path=${encodeURIComponent(path.trim())}`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      toast.success(data.message || 'Confluence ingestion complete')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">Ingest Confluence HTML</h2>
      <p className="text-sm text-gray-400 mb-6">
        Parse and ingest Confluence HTML exports from a directory on the server.
        Extracts title, breadcrumb, content, author and stores in ChromaDB.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Directory Path *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FolderOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/Users/hyunkyu/Downloads/confluence-export"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Path to the directory containing Confluence HTML files on the server where my_chatgpt is running
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !path.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? 'Ingesting...' : 'Start Ingestion'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg space-y-2">
          <p className="text-sm text-green-400 font-medium">{result.message}</p>
          <div className="text-sm text-gray-400 mb-3">
            Directory: <code className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">{result.directory}</code>
          </div>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">{result.totalParsed}</div>
              <div className="text-gray-400">Parsed</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{result.validDocuments}</div>
              <div className="text-gray-400">Valid</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{result.successCount}</div>
              <div className="text-gray-400">Success</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{result.failCount}</div>
              <div className="text-gray-400">Failed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
