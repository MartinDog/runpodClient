import { Server, Settings, ArrowLeft, Wifi, WifiOff } from 'lucide-react'

export default function Header({ totalCost, apiConnected, onSettingsClick, onBackClick }) {
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
              <Server size={18} />
            </div>
            <span className="text-lg font-bold">RunPod Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-400">
            Total Usage:{' '}
            <span className="text-white font-semibold">
              ${totalCost.toFixed(2)}/hr
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {apiConnected ? (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-green-400">API Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
          </div>

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
