import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { useCreateSession } from '../../hooks/useSessions'
import toast from 'react-hot-toast'

export default function NewSessionModal({ open, onClose, userId }) {
  const [title, setTitle] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  const createSession = useCreateSession()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    try {
      await createSession.mutateAsync({
        userId,
        title: title.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
      })
      toast.success('Session created')
      setTitle('')
      setSystemPrompt('')
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Chat Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Session Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 코딩 도우미"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">System Prompt (optional)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. 당신은 친절한 프로그래밍 튜터입니다."
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSession.isPending || !title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            {createSession.isPending && <Loader2 size={16} className="animate-spin" />}
            Create Session
          </button>
        </div>
      </form>
    </Modal>
  )
}
