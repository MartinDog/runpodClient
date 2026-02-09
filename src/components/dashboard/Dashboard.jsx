import { Loader2 } from 'lucide-react'
import PodCard from './PodCard'
import EmptySlot from './EmptySlot'

export default function Dashboard({ pods, isLoading, onDeploy, onViewLogs, onOpenTerminal }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">GPU Pods</h1>
        <button
          onClick={onDeploy}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          + New Deployment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pods.map((pod) => (
          <PodCard
            key={pod.id}
            pod={pod}
            onViewLogs={() => onViewLogs(pod)}
            onOpenTerminal={() => onOpenTerminal(pod)}
          />
        ))}
        <EmptySlot onClick={onDeploy} />
      </div>
    </div>
  )
}
