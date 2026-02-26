import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usePods } from '../../hooks/usePods'
import PodCard from '../dashboard/PodCard'
import EmptySlot from '../dashboard/EmptySlot'
import DeployModal from '../deploy/DeployModal'
import LogViewer from '../terminal/LogViewer'

export default function RunpodManager() {
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedPod, setSelectedPod] = useState(null)
  const [subView, setSubView] = useState('pods') // 'pods' | 'logs'

  const { data: pods, isLoading, error } = usePods()

  const totalCost = pods?.reduce((sum, pod) => sum + (pod.costPerHr || 0), 0) || 0

  const goBack = () => {
    setSubView('pods')
    setSelectedPod(null)
  }

  if (subView === 'logs' && selectedPod) {
    return <LogViewer pod={selectedPod} onClose={goBack} />
  }

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
        <div>
          <h1 className="text-xl font-semibold">GPU Pods</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Total cost:{' '}
            <span className="text-purple-400">${totalCost.toFixed(2)}/hr</span>
          </p>
        </div>
        <button
          onClick={() => setDeployOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          + New Deployment
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(pods || []).map((pod) => (
          <PodCard
            key={pod.id}
            pod={pod}
            onViewLogs={() => {
              setSelectedPod(pod)
              setSubView('logs')
            }}
          />
        ))}
        <EmptySlot onClick={() => setDeployOpen(true)} label="New Deployment" />
      </div>

      <DeployModal open={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
