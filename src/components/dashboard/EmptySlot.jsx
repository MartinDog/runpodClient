import { Plus } from 'lucide-react'

export default function EmptySlot({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[220px] hover:border-purple-500 hover:bg-gray-900 transition-all group"
    >
      <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-purple-600/20 flex items-center justify-center transition-colors">
        <Plus size={24} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
      </div>
      <span className="text-sm text-gray-500 group-hover:text-purple-400 font-medium transition-colors">
        Click to Deploy...
      </span>
    </button>
  )
}
