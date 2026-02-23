import { Settings, ArrowLeft, Database, MessageSquare } from 'lucide-react'

export default function Header({ userId, onSettingsClick, onBackClick, onDataClick, viewMode }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <span className="text-lg font-bold">ChatGPT Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userId && (
            <div className="text-sm text-gray-400">
              User: <span className="text-purple-400 font-medium">{userId}</span>
            </div>
          )}

          <button
            onClick={onDataClick}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'dataManager'
                ? 'text-purple-400 bg-purple-600/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Knowledge Base"
          >
            <Database size={20} />
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
