const { Client } = require('ssh2')

class SSHService {
  constructor() {
    this.connections = new Map()
  }

  /**
   * Get SSH connection info from pod runtime ports.
   * RunPod exposes SSH on a public IP with a mapped port.
   */
  getSSHInfo(pod) {
    if (!pod.runtime || !pod.runtime.ports) return null
    const sshPort = pod.runtime.ports.find(
      (p) => p.privatePort === 22 && p.isIpPublic
    )
    if (!sshPort) return null
    return {
      host: sshPort.ip,
      port: sshPort.publicPort,
      username: 'root',
    }
  }

  /**
   * Start log streaming via SSH (tail -f)
   */
  startLogStream(socket, pod) {
    const sshInfo = this.getSSHInfo(pod)
    if (!sshInfo) {
      socket.emit('logs:disconnected', { error: 'No SSH port available' })
      return
    }

    const conn = new Client()
    const connId = `logs-${pod.id}-${socket.id}`

    conn.on('ready', () => {
      this.connections.set(connId, conn)
      socket.emit('logs:connected')

      // Start log tail
      conn.exec('tail -f /var/log/app.log 2>/dev/null || tail -f /root/logs/*.log 2>/dev/null || journalctl -f 2>/dev/null || echo "No logs found"', (err, stream) => {
        if (err) {
          socket.emit('logs:data', { lines: [`Error: ${err.message}`] })
          return
        }

        stream.on('data', (data) => {
          const lines = data.toString().split('\n').filter(Boolean)
          if (lines.length > 0) {
            socket.emit('logs:data', { lines })
          }
        })

        stream.stderr.on('data', (data) => {
          const lines = data.toString().split('\n').filter(Boolean)
          if (lines.length > 0) {
            socket.emit('logs:data', { lines: lines.map((l) => `[STDERR] ${l}`) })
          }
        })

        stream.on('close', () => {
          socket.emit('logs:disconnected')
        })
      })

      // Start resource monitoring (every 5 seconds)
      this.startResourceMonitoring(conn, socket, connId)
    })

    conn.on('error', (err) => {
      socket.emit('logs:disconnected', { error: err.message })
    })

    conn.connect({
      host: sshInfo.host,
      port: sshInfo.port,
      username: sshInfo.username,
      // RunPod pods typically don't require a password for root
      // In production, you'd use key-based auth
      tryKeyboard: true,
    })

    return connId
  }

  /**
   * Monitor resources via docker stats
   */
  startResourceMonitoring(conn, socket, connId) {
    const interval = setInterval(() => {
      if (!this.connections.has(connId)) {
        clearInterval(interval)
        return
      }

      conn.exec(
        'echo "CPU:$(top -bn1 | grep "Cpu(s)" | awk \'{print $2}\')% MEM:$(free -m | awk \'/Mem:/ {printf "%.1f%%|%dMB|%dMB", $3/$2*100, $3, $2}\') DISK:$(df -h / | awk \'NR==2 {print $3\"|\"$2}\')"',
        (err, stream) => {
          if (err) return
          let output = ''
          stream.on('data', (data) => { output += data.toString() })
          stream.on('close', () => {
            const parsed = this.parseResourceOutput(output.trim())
            if (parsed) {
              socket.emit('resources:data', parsed)
            }
          })
        }
      )
    }, 5000)

    // Store interval for cleanup
    const existing = this.connections.get(connId)
    if (existing) {
      existing._resourceInterval = interval
    }
  }

  parseResourceOutput(output) {
    try {
      const cpuMatch = output.match(/CPU:(\d+\.?\d*)%/)
      const memMatch = output.match(/MEM:(\d+\.?\d*)%\|(\d+)MB\|(\d+)MB/)
      const diskMatch = output.match(/DISK:(\S+)\|(\S+)/)

      return {
        cpu: cpuMatch ? parseFloat(cpuMatch[1]) : 0,
        memPercent: memMatch ? parseFloat(memMatch[1]) : 0,
        memUsed: memMatch ? `${memMatch[2]}MB` : '-',
        memTotal: memMatch ? `${memMatch[3]}MB` : '-',
        diskUsed: diskMatch ? diskMatch[1] : '-',
        diskTotal: diskMatch ? diskMatch[2] : '-',
      }
    } catch {
      return null
    }
  }

  /**
   * Create interactive SSH session for xterm.js
   */
  createShell(socket, pod) {
    const sshInfo = this.getSSHInfo(pod)
    if (!sshInfo) {
      socket.emit('ssh:error', { error: 'No SSH port available' })
      return
    }

    const conn = new Client()
    const connId = `ssh-${pod.id}-${socket.id}`

    conn.on('ready', () => {
      this.connections.set(connId, conn)
      socket.emit('ssh:connected')

      conn.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
        if (err) {
          socket.emit('ssh:error', { error: err.message })
          return
        }

        // SSH -> Browser
        stream.on('data', (data) => {
          socket.emit('ssh:data', data.toString('utf-8'))
        })

        stream.on('close', () => {
          socket.emit('ssh:disconnected')
          this.disconnect(connId)
        })

        // Browser -> SSH
        socket.on('ssh:data', (data) => {
          stream.write(data)
        })

        // Terminal resize
        socket.on('ssh:resize', ({ cols, rows }) => {
          stream.setWindow(rows, cols, 0, 0)
        })

        // Store stream ref for cleanup
        conn._stream = stream
      })
    })

    conn.on('error', (err) => {
      socket.emit('ssh:error', { error: err.message })
    })

    conn.connect({
      host: sshInfo.host,
      port: sshInfo.port,
      username: sshInfo.username,
      tryKeyboard: true,
    })

    return connId
  }

  /**
   * Disconnect a specific connection
   */
  disconnect(connId) {
    const conn = this.connections.get(connId)
    if (conn) {
      if (conn._resourceInterval) {
        clearInterval(conn._resourceInterval)
      }
      try { conn.end() } catch {}
      this.connections.delete(connId)
    }
  }

  /**
   * Disconnect all connections for a socket
   */
  disconnectAll(socketId) {
    for (const [connId, conn] of this.connections.entries()) {
      if (connId.includes(socketId)) {
        this.disconnect(connId)
      }
    }
  }
}

module.exports = new SSHService()
