import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Dashboard from './components/dashboard/Dashboard'
import SettingsModal from './components/settings/SettingsModal'
import NewSessionModal from './components/dashboard/NewSessionModal'
import ChatHistory from './components/chat/ChatHistory'
import DataManager from './components/data/DataManager'
import RunpodManager from './components/runpod/RunpodManager'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard' | 'chatHistory' | 'dataManager' | 'runpod'
  const [userId, setUserId] = useState(() => localStorage.getItem('chatgpt_userId') || '')

  const handleSetUserId = (id) => {
    localStorage.setItem('chatgpt_userId', id)
    setUserId(id)
  }

  const goBack = () => {
    setViewMode('dashboard')
    setSelectedSession(null)
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
        userId={userId}
        onSettingsClick={() => setSettingsOpen(true)}
        onBackClick={viewMode === 'chatHistory' ? goBack : null}
        onDataClick={() => setViewMode(viewMode === 'dataManager' ? 'dashboard' : 'dataManager')}
        onRunpodClick={() => setViewMode(viewMode === 'runpod' ? 'dashboard' : 'runpod')}
        viewMode={viewMode}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'dashboard' && (
          <Dashboard
            userId={userId}
            onSetUserId={handleSetUserId}
            onNewSession={() => setNewSessionOpen(true)}
            onViewHistory={(session) => {
              setSelectedSession(session)
              setViewMode('chatHistory')
            }}
          />
        )}

        {viewMode === 'chatHistory' && selectedSession && (
          <ChatHistory session={selectedSession} userId={userId} onClose={goBack} />
        )}

        {viewMode === 'dataManager' && (
          <DataManager />
        )}

        {viewMode === 'runpod' && (
          <RunpodManager />
        )}
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NewSessionModal
        open={newSessionOpen}
        onClose={() => setNewSessionOpen(false)}
        userId={userId}
      />
    </div>
  )
}
