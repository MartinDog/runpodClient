import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Dashboard from './components/dashboard/Dashboard'
import SettingsModal from './components/settings/SettingsModal'
import DeployModal from './components/deploy/DeployModal'
import LogViewer from './components/terminal/LogViewer'
import Terminal from './components/terminal/Terminal'
import DataManager from './components/data/DataManager'
import { usePods } from './hooks/usePods'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedPod, setSelectedPod] = useState(null)
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard' | 'logs' | 'terminal' | 'dataManager'

  const { data: pods, isLoading, error } = usePods()

  const totalCost = pods?.reduce((sum, pod) => sum + (pod.costPerHr || 0), 0) || 0
  const apiConnected = !error

  const goBack = () => {
    setViewMode('dashboard')
    setSelectedPod(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />

      <Header
        totalCost={totalCost}
        apiConnected={apiConnected}
        onSettingsClick={() => setSettingsOpen(true)}
        onBackClick={viewMode !== 'dashboard' ? goBack : null}
        onDataClick={() => setViewMode(viewMode === 'dataManager' ? 'dashboard' : 'dataManager')}
        viewMode={viewMode}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'dashboard' && (
          <Dashboard
            pods={pods || []}
            isLoading={isLoading}
            onDeploy={() => setDeployOpen(true)}
            onViewLogs={(pod) => {
              setSelectedPod(pod)
              setViewMode('logs')
            }}
            onOpenTerminal={(pod) => {
              setSelectedPod(pod)
              setViewMode('terminal')
            }}
          />
        )}

        {viewMode === 'logs' && selectedPod && (
          <LogViewer pod={selectedPod} onClose={goBack} />
        )}

        {viewMode === 'terminal' && selectedPod && (
          <Terminal pod={selectedPod} onClose={goBack} />
        )}

        {viewMode === 'dataManager' && (
          <DataManager />
        )}
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DeployModal open={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
