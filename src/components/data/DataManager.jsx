import { useState } from "react";
import { FileText, Upload, Bug, Globe, Search } from "lucide-react";
import DocumentTab from "./DocumentTab";
import FileUploadTab from "./FileUploadTab";
import YouTrackTab from "./YouTrackTab";
import ConfluenceTab from "./ConfluenceTab";
import SearchTab from "./SearchTab";

const API_BASE = "https://d8f5euw4493kgn-8080.proxy.runpod.net/api";

const TABS = [
  { id: "document", label: "Document", icon: FileText },
  { id: "file", label: "File Upload", icon: Upload },
  { id: "youtrack", label: "YouTrack", icon: Bug },
  { id: "confluence", label: "Confluence", icon: Globe },
  { id: "search", label: "Search", icon: Search },
];

export default function DataManager() {
  const [activeTab, setActiveTab] = useState("document");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base Manager</h1>
        <p className="text-sm text-gray-400 mt-1">
          Insert and manage data in ChromaDB and PostgreSQL
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "document" && <DocumentTab apiBase={API_BASE} />}
      {activeTab === "file" && <FileUploadTab apiBase={API_BASE} />}
      {activeTab === "youtrack" && <YouTrackTab apiBase={API_BASE} />}
      {activeTab === "confluence" && <ConfluenceTab apiBase={API_BASE} />}
      {activeTab === "search" && <SearchTab apiBase={API_BASE} />}
    </div>
  );
}
