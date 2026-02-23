import { MessageSquare, Clock, Bot } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SessionCard({ session, onViewHistory }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
            <Bot size={16} className="text-purple-400" />
          </div>
          <h3 className="font-semibold text-white truncate">{session.title || 'Untitled Session'}</h3>
        </div>
        <span className="text-xs font-mono text-gray-600 shrink-0">#{session.id}</span>
      </div>

      {/* System Prompt */}
      {session.systemPrompt && (
        <p className="text-xs text-gray-400 line-clamp-2 bg-gray-800/50 rounded-lg p-2 font-mono">
          {session.systemPrompt}
        </p>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock size={12} />
        <span>{formatDate(session.createdAt)}</span>
      </div>

      {/* Action */}
      <div className="pt-2 border-t border-gray-800">
        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageSquare size={16} />
          View Chat History
        </button>
      </div>
    </div>
  )
}
