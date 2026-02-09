import { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowDown, Trash2, Search, Download, X, Loader2,
} from 'lucide-react'
import { useLogs } from '../../hooks/useLogs'
import ResourceBar from './ResourceBar'

export default function LogViewer({ pod, onClose }) {
  const { logs, resources, connected, clearLogs } = useLogs(pod.id)
  const [autoScroll, setAutoScroll] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const logsEndRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Detect manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }

  // Filter logs by search
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter((line) => line.toLowerCase().includes(q))
  }, [logs, searchQuery])

  // Download logs
  const handleDownload = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pod.name || pod.id}-logs.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Logs: {pod.name || pod.id}</h2>
          {connected ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Connecting...
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Resource Bar */}
      <ResourceBar resources={resources} />

      {/* Log Content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-5 bg-gray-950"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            {connected ? 'Waiting for log data...' : 'Connecting to pod...'}
          </div>
        ) : (
          filteredLogs.map((line, i) => (
            <div key={i} className="hover:bg-gray-900/50">
              <LogLine line={line} searchQuery={searchQuery} />
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Search Bar (inline) */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-t border-gray-800">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <span className="text-xs text-gray-500">{filteredLogs.length} matches</span>
          <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              autoScroll ? 'bg-green-600/20 text-green-400' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <ArrowDown size={12} />
            Autoscroll: {autoScroll ? 'On' : 'Off'}
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <Trash2 size={12} />
            Clear
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <Search size={12} />
            Search
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Download size={12} />
          Download Logs
        </button>
      </div>
    </div>
  )
}

function LogLine({ line, searchQuery }) {
  // Color code by log level
  let color = 'text-gray-300'
  if (line.includes('ERROR') || line.includes('[STDERR]')) color = 'text-red-400'
  else if (line.includes('WARN')) color = 'text-yellow-400'
  else if (line.includes('DEBUG')) color = 'text-gray-500'
  else if (line.includes('INFO')) color = 'text-blue-300'

  if (searchQuery) {
    const parts = line.split(new RegExp(`(${searchQuery})`, 'gi'))
    return (
      <span className={color}>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    )
  }

  return <span className={color}>{line}</span>
}
