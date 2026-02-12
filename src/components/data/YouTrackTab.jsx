import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Save, Upload, FileSpreadsheet } from 'lucide-react'

export default function YouTrackTab({ apiBase }) {
  const [mode, setMode] = useState('single') // 'single' | 'excel'

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'single' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Single Issue
        </button>
        <button
          onClick={() => setMode('excel')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'excel' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Excel Upload
        </button>
      </div>

      {mode === 'single' ? (
        <SingleIssueForm apiBase={apiBase} />
      ) : (
        <ExcelUploadForm apiBase={apiBase} />
      )}
    </div>
  )
}

function SingleIssueForm({ apiBase }) {
  const [form, setForm] = useState({
    id: '',
    title: '',
    body: '',
    comments: '',
    priority: 'Normal',
    stage: '',
    requester: '',
    assignee: '',
    createdDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.id.trim() || !form.title.trim()) {
      toast.error('Issue ID and Title are required')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${apiBase}/knowledge-base/issues`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      toast.success(`Issue ${form.id} upserted`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">Upsert YouTrack Issue</h2>
      <p className="text-sm text-gray-400 mb-6">
        Add or update a single YouTrack issue in ChromaDB. Uses upsert (creates or updates).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Issue ID *</label>
            <input
              type="text"
              value={form.id}
              onChange={set('id')}
              placeholder="e.g. PATALK-1246"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Issue title"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Body</label>
          <textarea
            value={form.body}
            onChange={set('body')}
            placeholder="Issue description..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Comments</label>
          <textarea
            value={form.comments}
            onChange={set('comments')}
            placeholder="Comments text..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={set('priority')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Normal">Normal</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Stage</label>
            <input
              type="text"
              value={form.stage}
              onChange={set('stage')}
              placeholder="e.g. Staging"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Requester</label>
            <input
              type="text"
              value={form.requester}
              onChange={set('requester')}
              placeholder="Name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Assignee</label>
            <input
              type="text"
              value={form.assignee}
              onChange={set('assignee')}
              placeholder="Name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="w-1/2">
          <label className="block text-sm text-gray-400 mb-1.5">Created Date</label>
          <input
            type="date"
            value={form.createdDate}
            onChange={set('createdDate')}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.id.trim() || !form.title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Saving...' : 'Upsert Issue'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg">
          <p className="text-sm text-green-400 font-medium">{result.message}</p>
          <p className="text-sm text-gray-300 mt-1">
            Issue ID: <code className="text-white bg-gray-800 px-1.5 py-0.5 rounded">{result.issueId}</code>
          </p>
        </div>
      )}
    </div>
  )
}

function ExcelUploadForm({ apiBase }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select an Excel file')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${apiBase}/knowledge-base/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      toast.success(data.message || 'Excel upload complete')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">Upload YouTrack Excel</h2>
      <p className="text-sm text-gray-400 mb-6">
        Bulk import YouTrack issues from an Excel (.xlsx) export. Expected columns: ID, 제목, 본문, 댓글목록, Priority, Stage, 업무 요청자, Assignee, 생성일
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="hidden"
            accept=".xlsx,.xls"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet size={24} className="text-green-400" />
              <div className="text-left">
                <p className="text-sm text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <FileSpreadsheet size={32} className="mx-auto text-gray-500 mb-3" />
              <p className="text-sm text-gray-400">
                Click to select YouTrack Excel export (<span className="text-purple-400">.xlsx</span>)
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {loading ? 'Uploading & Processing...' : 'Upload Excel'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg space-y-2">
          <p className="text-sm text-green-400 font-medium">{result.message}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-white">{result.totalParsed}</div>
              <div className="text-gray-400">Total Parsed</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{result.successCount}</div>
              <div className="text-gray-400">Success</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{result.failCount}</div>
              <div className="text-gray-400">Failed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
