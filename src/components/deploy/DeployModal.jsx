import { useState, useEffect } from "react";
import { Rocket, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import { useDeployPod } from "../../hooks/usePods";
import toast from "react-hot-toast";

export default function DeployModal({ open, onClose }) {
  const [TEMPLATES, setTEMPLATES] = useState([]);
  const [name, setName] = useState("My-GPU-Server");
  const [template, setTemplate] = useState([]);
  const [gpuType, setGpuType] = useState("");
  const [volumeSize, setVolumeSize] = useState(50);
  const [gpuTypes, setGpuTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const deployPod = useDeployPod();

  useEffect(() => {
    if (open) {
      fetch("/api/templates")
        .then((r) => r.json())
        .then((templates) => {
          setTEMPLATES(templates);
          if (templates.length > 0 && !template) {
            setTemplate(templates[0].imageName);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetch("/api/gpu-types")
        .then((r) => r.json())
        .then((types) => {
          const available = types
            .filter((t) => t.lowestPrice?.uninterruptablePrice)
            .sort(
              (a, b) =>
                (a.lowestPrice.uninterruptablePrice || 99) -
                (b.lowestPrice.uninterruptablePrice || 99),
            );
          setGpuTypes(available);
          if (available.length > 0 && !gpuType) {
            setGpuType(available[0].id);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const selectedGpu = gpuTypes.find((g) => g.id === gpuType);
  const estimatedCost = selectedGpu?.lowestPrice?.uninterruptablePrice || 0;

  const handleDeploy = async () => {
    if (!name.trim()) return toast.error("Pod name is required");
    if (!gpuType) return toast.error("Select a GPU type");

    setLoading(true);
    try {
      await deployPod.mutateAsync({
        name: name.trim(),
        imageName: template,
        gpuTypeId: gpuType,
        gpuCount: 1,
        volumeInGb: volumeSize,
        containerDiskInGb: 20,
      });
      toast.success("Pod deployed successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Deploy New GPU Pod">
      <div className="space-y-4">
        {/* Pod Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            1. Pod Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Template */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            2. Select Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
            {TEMPLATES.map((t) => (
              <option key={t.imageName} value={t.imageName}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* GPU Type */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            3. Select GPU
          </label>
          <select
            value={gpuType}
            onChange={(e) => setGpuType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
            {gpuTypes.length === 0 && (
              <option value="">Loading GPU types...</option>
            )}
            {gpuTypes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.displayName} ($
                {g.lowestPrice?.uninterruptablePrice?.toFixed(2) || "?"}/hr) -{" "}
                {g.memoryInGb}GB
              </option>
            ))}
          </select>
        </div>

        {/* Volume Size */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            4. Volume Size (GB)
          </label>
          <input
            type="number"
            value={volumeSize}
            onChange={(e) => setVolumeSize(Number(e.target.value))}
            min={0}
            max={500}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Cost + Deploy */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Estimated Cost:{" "}
            <span className="text-white font-semibold text-lg">
              ${estimatedCost.toFixed(2)}/hr
            </span>
          </div>
          <button
            onClick={handleDeploy}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Rocket size={16} />
            )}
            Deploy Now!
          </button>
        </div>
      </div>
    </Modal>
  );
}
