import { useState, useRef, useEffect } from 'react'
import { Loader2, User, Bot, Send } from 'lucide-react'
import { useChatHistory, useSendMessage } from '../../hooks/useSessions'
import toast from 'react-hot-toast'

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatHistory({ session, userId, onClose }) {
  const [message, setMessage] = useState('')
  const bottomRef = useRef(null)

  const { data: history, isLoading } = useChatHistory(session.sessionId)
  const sendMessage = useSendMessage()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || sendMessage.isPending) return
    const msg = message.trim()
    setMessage('')
    try {
      await sendMessage.mutateAsync({ sessionId: session.sessionId, userId, message: msg })
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Session Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-400 shrink-0" />
          <h2 className="font-semibold">{session.title || 'Chat History'}</h2>
          <span className="text-xs text-gray-600 font-mono">#{session.id}</span>
        </div>
        {session.systemPrompt && (
          <p className="text-xs text-gray-400 mt-1 font-mono truncate">{session.systemPrompt}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          history.map((msg, idx) => {
            const isUser = msg.role === 'USER' || msg.role === 'user'
            return (
              <div key={msg.id || idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-purple-600/30' : 'bg-gray-700'
                  }`}
                >
                  {isUser
                    ? <User size={16} className="text-purple-400" />
                    : <Bot size={16} className="text-gray-300" />
                  }
                </div>
                <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-600">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            )
          })
        )}

        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot size={16} className="text-gray-300" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
          className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMessage.isPending}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
