import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useSocket } from '../../hooks/useSocket'

export default function Terminal({ pod, onClose }) {
  const socket = useSocket()
  const termRef = useRef(null)
  const containerRef = useRef(null)
  const xtermRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [status, setStatus] = useState('connecting') // connecting | connected | error

  useEffect(() => {
    let xterm, fitAddon
    let disposed = false

    async function init() {
      // Dynamic imports for xterm.js
      const { Terminal: XTerm } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { WebLinksAddon } = await import('@xterm/addon-web-links')

      // Import xterm CSS
      await import('@xterm/xterm/css/xterm.css')

      if (disposed) return

      xterm = new XTerm({
        cursorBlink: true,
        theme: {
          background: '#0a0a0a',
          foreground: '#e5e7eb',
          cursor: '#7c3aed',
          selectionBackground: '#7c3aed40',
          black: '#1f2937',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#f9fafb',
        },
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        scrollback: 5000,
      })

      fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)
      xterm.loadAddon(new WebLinksAddon())

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      if (containerRef.current) {
        xterm.open(containerRef.current)
        fitAddon.fit()
      }

      xterm.writeln('\x1b[1;35m--- RunPod SSH Terminal ---\x1b[0m')
      xterm.writeln(`Connecting to ${pod.name || pod.id}...\n`)

      // Send input to server
      xterm.onData((data) => {
        socket.emit('ssh:data', data)
      })

      // Request SSH connection
      socket.emit('ssh:connect', { podId: pod.id })

      // Receive data from server
      const onData = (data) => {
        xterm.write(data)
      }

      const onConnected = () => {
        setStatus('connected')
        // Send initial size
        const { cols, rows } = xterm
        socket.emit('ssh:resize', { cols, rows })
      }

      const onError = ({ error }) => {
        setStatus('error')
        xterm.writeln(`\n\x1b[1;31mSSH Error: ${error}\x1b[0m`)
      }

      const onDisconnected = () => {
        setStatus('connecting')
        xterm.writeln('\n\x1b[1;33mSSH Disconnected.\x1b[0m')
      }

      socket.on('ssh:data', onData)
      socket.on('ssh:connected', onConnected)
      socket.on('ssh:error', onError)
      socket.on('ssh:disconnected', onDisconnected)

      // Handle resize
      const handleResize = () => {
        if (fitAddon && xterm) {
          fitAddon.fit()
          socket.emit('ssh:resize', { cols: xterm.cols, rows: xterm.rows })
        }
      }

      const resizeObserver = new ResizeObserver(handleResize)
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      // Cleanup stored for disposal
      xterm._cleanup = () => {
        socket.off('ssh:data', onData)
        socket.off('ssh:connected', onConnected)
        socket.off('ssh:error', onError)
        socket.off('ssh:disconnected', onDisconnected)
        resizeObserver.disconnect()
        socket.emit('ssh:disconnect', { podId: pod.id })
      }
    }

    init()

    return () => {
      disposed = true
      if (xtermRef.current) {
        if (xtermRef.current._cleanup) xtermRef.current._cleanup()
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [pod.id, socket])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">SSH: {pod.name || pod.id}</h2>
          {status === 'connecting' && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Connecting...
            </span>
          )}
          {status === 'connected' && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connected
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-400">Connection Error</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Terminal Container */}
      <div ref={containerRef} className="flex-1 p-1 bg-[#0a0a0a]" />
    </div>
  )
}
