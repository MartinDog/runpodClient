import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'

const MAX_LOG_LINES = 5000

export function useLogs(podId) {
  const socket = useSocket()
  const [logs, setLogs] = useState([])
  const [resources, setResources] = useState(null)
  const [connected, setConnected] = useState(false)
  const subscribed = useRef(false)

  useEffect(() => {
    if (!socket || !podId) return

    if (!subscribed.current) {
      socket.emit('logs:subscribe', { podId })
      subscribed.current = true
    }

    const onLogData = (data) => {
      setLogs((prev) => {
        const next = [...prev, ...data.lines]
        return next.length > MAX_LOG_LINES ? next.slice(-MAX_LOG_LINES) : next
      })
    }

    const onResourceData = (data) => {
      setResources(data)
    }

    const onLogConnected = () => setConnected(true)
    const onLogDisconnected = () => setConnected(false)

    socket.on('logs:data', onLogData)
    socket.on('resources:data', onResourceData)
    socket.on('logs:connected', onLogConnected)
    socket.on('logs:disconnected', onLogDisconnected)

    return () => {
      socket.off('logs:data', onLogData)
      socket.off('resources:data', onResourceData)
      socket.off('logs:connected', onLogConnected)
      socket.off('logs:disconnected', onLogDisconnected)
      socket.emit('logs:unsubscribe', { podId })
      subscribed.current = false
    }
  }, [socket, podId])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { logs, resources, connected, clearLogs }
}
