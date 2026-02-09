import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react'

function BarSegment({ label, icon: Icon, value, percent, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-400 whitespace-nowrap">{label}:</span>
      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs text-white font-mono whitespace-nowrap">{value}</span>
    </div>
  )
}

export default function ResourceBar({ resources }) {
  if (!resources) {
    return (
      <div className="flex items-center gap-6 px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Activity size={14} className="animate-pulse" />
          Waiting for resource data...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-6 px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-green-400 font-medium">Healthy</span>
      </div>
      <BarSegment
        label="CPU"
        icon={Cpu}
        value={`${resources.cpu.toFixed(1)}%`}
        percent={resources.cpu}
        color={resources.cpu > 80 ? 'bg-red-500' : resources.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500'}
      />
      <BarSegment
        label="MEM"
        icon={MemoryStick}
        value={`${resources.memPercent.toFixed(0)}%`}
        percent={resources.memPercent}
        color={resources.memPercent > 80 ? 'bg-red-500' : resources.memPercent > 50 ? 'bg-yellow-500' : 'bg-blue-500'}
      />
      <BarSegment
        label="Disk"
        icon={HardDrive}
        value={`${resources.diskUsed}/${resources.diskTotal}`}
        percent={50}
        color="bg-purple-500"
      />
    </div>
  )
}
