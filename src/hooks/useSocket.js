import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
  }
  return socket
}

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = getSocket()
    return () => {}
  }, [])

  return socketRef.current || getSocket()
}
