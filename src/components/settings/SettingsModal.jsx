import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const REGIONS = ['US-East-1', 'US-West-1', 'EU-RO-1', 'CA-MTL-1', 'CZ-PRG-1']

export default function SettingsModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(10)
  const [defaultRegion, setDefaultRegion] = useState('US-East-1')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // null | 'success' | 'fail'
  const [saving, setSaving] = useState(false)

  // Load current settings
  useEffect(() => {
    if (open) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => {
          setPollingInterval(data.pollingInterval || 10)
          setDefaultRegion(data.defaultRegion || 'US-East-1')
          if (data.apiKeySet) setApiKey('••••••••••••••••••••')
        })
        .catch(() => {})
      setTestResult(null)
    }
  }, [open])

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test', { method: 'POST' })
      const data = await res.json()
      setTestResult(data.connected ? 'success' : 'fail')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = { pollingInterval, defaultRegion }
      // Only send API key if user actually typed a new one
      if (apiKey && !apiKey.startsWith('••')) {
        body.apiKey = apiKey
      }
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved')
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="App Settings">
      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">RunPod API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestResult(null) }}
              placeholder="Enter your RunPod API key"
              className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Polling Interval */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Polling Interval (seconds)</label>
          <input
            type="number"
            value={pollingInterval}
            onChange={(e) => setPollingInterval(Number(e.target.value))}
            min={3}
            max={60}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Default Region */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Default Region</label>
          <select
            value={defaultRegion}
            onChange={(e) => setDefaultRegion(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {testing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : testResult === 'fail' ? (
              <XCircle size={16} className="text-red-400" />
            ) : null}
            {testing ? 'Testing...' : testResult === 'success' ? 'Connected!' : testResult === 'fail' ? 'Failed' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  )
}
