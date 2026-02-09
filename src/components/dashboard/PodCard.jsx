import { useState } from 'react'
import {
  Play, Square, RotateCcw, Trash2, ScrollText, TerminalSquare, Loader2,
} from 'lucide-react'
import { useStopPod, useStartPod, useRestartPod, useTerminatePod } from '../../hooks/usePods'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  RUNNING: { dot: 'bg-green-400', badge: 'text-green-400 bg-green-400/10', label: 'RUNNING' },
  EXITED: { dot: 'bg-gray-400', badge: 'text-gray-400 bg-gray-400/10', label: 'STOPPED' },
  CREATED: { dot: 'bg-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10', label: 'CREATED' },
}

function getStatus(pod) {
  const runtime = pod.runtime
  if (!runtime) return STATUS_STYLES.EXITED
  const uptimeMs = runtime.uptimeInSeconds
  if (uptimeMs && uptimeMs > 0) return STATUS_STYLES.RUNNING
  return STATUS_STYLES.EXITED
}

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function PodCard({ pod, onViewLogs, onOpenTerminal }) {
  const [confirming, setConfirming] = useState(false)
  const status = getStatus(pod)
  const isRunning = status === STATUS_STYLES.RUNNING

  const stopPod = useStopPod()
  const startPod = useStartPod()
  const restartPod = useRestartPod()
  const terminatePod = useTerminatePod()

  const busy = stopPod.isPending || startPod.isPending || restartPod.isPending || terminatePod.isPending

  const handleAction = async (action, label) => {
    try {
      await action.mutateAsync(pod.id)
      toast.success(`${label} successful`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleTerminate = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setConfirming(false)
    await handleAction(terminatePod, 'Terminate')
  }

  const gpuName = pod.machine?.gpuDisplayName || pod.gpuDisplayName || 'Unknown GPU'
  const gpuCount = pod.gpuCount || 1
  const costPerHr = pod.costPerHr || 0
  const uptime = pod.runtime?.uptimeInSeconds || 0
  const accumulatedCost = ((uptime / 3600) * costPerHr).toFixed(2)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.badge}`}>
            {status.label}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{pod.id.slice(0, 8)}</span>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-white truncate">{pod.name || pod.id}</h3>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-400">
          GPU: <span className="text-white">{gpuName} x{gpuCount}</span>
        </div>
        <div className="text-gray-400">
          Uptime: <span className="text-white">{formatUptime(uptime)}</span>
        </div>
        <div className="text-gray-400">
          Cost/hr: <span className="text-white">${costPerHr.toFixed(2)}</span>
        </div>
        <div className="text-gray-400">
          Spent: <span className="text-white">${accumulatedCost}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-gray-800">
        {isRunning ? (
          <>
            <ActionBtn icon={Square} label="Stop" onClick={() => handleAction(stopPod, 'Stop')} disabled={busy} />
            <ActionBtn icon={RotateCcw} label="Restart" onClick={() => handleAction(restartPod, 'Restart')} disabled={busy} />
            <ActionBtn icon={ScrollText} label="Logs" onClick={onViewLogs} variant="info" />
          </>
        ) : (
          <>
            <ActionBtn icon={Play} label="Start" onClick={() => handleAction(startPod, 'Start')} disabled={busy} variant="success" />
            <ActionBtn
              icon={Trash2}
              label={confirming ? 'Confirm?' : 'Delete'}
              onClick={handleTerminate}
              disabled={busy}
              variant="danger"
            />
          </>
        )}
      </div>

      {/* SSH Terminal Button */}
      <button
        onClick={onOpenTerminal}
        className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
      >
        <TerminalSquare size={16} />
        Open SSH Terminal
      </button>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, disabled, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    success: 'bg-green-600/20 hover:bg-green-600/30 text-green-400',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400',
    info: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${variants[variant]}`}
    >
      {disabled ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  )
}
