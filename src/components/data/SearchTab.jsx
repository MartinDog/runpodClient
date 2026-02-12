import { useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Loader2 } from 'lucide-react'

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources', endpoint: '/knowledge-base/search/all' },
  { value: 'youtrack', label: 'YouTrack', endpoint: '/knowledge-base/search' },
  { value: 'confluence', label: 'Confluence', endpoint: '/knowledge-base/search/confluence' },
]

export default function SearchTab({ apiBase }) {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [nResults, setNResults] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error('Search query is required')
      return
    }

    setLoading(true)
    setResults(null)
    try {
      const sourceConfig = SOURCE_OPTIONS.find((s) => s.value === source)
      const params = new URLSearchParams({ query: query.trim(), nResults: String(nResults) })
      const res = await fetch(`${apiBase}${sourceConfig.endpoint}?${params}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResults(data)
      toast.success(`Found ${data.length} result(s)`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-1">Search Knowledge Base</h2>
        <p className="text-sm text-gray-400 mb-6">
          Semantic search across stored documents to verify data insertion
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Query *</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Results</label>
              <input
                type="number"
                min={1}
                max={20}
                value={nResults}
                onChange={(e) => setNResults(Number(e.target.value))}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h3>

          {results.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500">No matching documents found</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-gray-500 shrink-0">#{idx + 1}</span>
                    <code className="text-xs bg-gray-800 text-purple-400 px-1.5 py-0.5 rounded truncate">
                      {item.id}
                    </code>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    distance: {typeof item.distance === 'number' ? item.distance.toFixed(4) : item.distance}
                  </span>
                </div>

                {/* Metadata */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(item.metadata)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-flex text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                        >
                          <span className="text-gray-500 mr-1">{k}:</span>
                          {v}
                        </span>
                      ))}
                  </div>
                )}

                {/* Document content */}
                <div className="text-sm text-gray-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg p-3">
                  {item.document}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
