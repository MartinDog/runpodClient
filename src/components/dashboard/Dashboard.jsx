import { useState } from 'react'
import { Loader2, UserCircle, LogIn } from 'lucide-react'
import { useSessions, loginUser } from '../../hooks/useSessions'
import SessionCard from './SessionCard'
import EmptySlot from './EmptySlot'
import toast from 'react-hot-toast'

export default function Dashboard({ userId, onSetUserId, onNewSession, onViewHistory }) {
  const [userIdInput, setUserIdInput] = useState('')
  const [logging, setLogging] = useState(false)

  const { data: sessions, isLoading, error } = useSessions(userId)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!userIdInput.trim()) return
    setLogging(true)
    try {
      await loginUser(userIdInput.trim())
      onSetUserId(userIdInput.trim())
      toast.success('Logged in successfully')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLogging(false)
    }
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6">
        <div className="text-center">
          <UserCircle size={48} className="mx-auto text-gray-600 mb-3" />
          <h2 className="text-xl font-semibold">Set User ID</h2>
          <p className="text-sm text-gray-400 mt-1">Enter your user ID to view chat sessions</p>
        </div>
        <form onSubmit={handleLogin} className="flex gap-2 w-full max-w-sm">
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="Enter user ID..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!userIdInput.trim() || logging}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
          >
            {logging ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Login
          </button>
        </form>
      </div>
    )
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
          <h1 className="text-xl font-semibold">Chat Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            User: <span className="text-purple-400">{userId}</span>
          </p>
        </div>
        <button
          onClick={onNewSession}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          + New Session
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(sessions || []).map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onViewHistory={() => onViewHistory(session)}
          />
        ))}
        <EmptySlot onClick={onNewSession} label="New Session" />
      </div>
    </div>
  )
}
