import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";

export default function DocumentTab({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [source, setSource] = useState("manual");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/vectordb/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          userId: userId.trim() || undefined,
          source: source.trim() || "manual",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      toast.success("Document stored successfully");
      setContent("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">Add Manual Document</h2>
      <p className="text-sm text-gray-400 mb-6">
        Store a text document directly into ChromaDB vector database
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. user123"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="manual"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document text to store in ChromaDB..."
            rows={8}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {loading ? "Storing..." : "Store Document"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg">
          <p className="text-sm text-green-400 font-medium">Document Stored</p>
          <p className="text-sm text-gray-300 mt-1">
            Document ID:{" "}
            <code className="text-white bg-gray-800 px-1.5 py-0.5 rounded">
              {result.documentId}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
