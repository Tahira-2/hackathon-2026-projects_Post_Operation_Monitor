"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Share2 } from "lucide-react";
import SavingsDashboard from "./SavingsDashboard";
import DocumentsUpload, { UploadedFile } from "./DocumentsUpload";
import KnowledgeGraph from "./KnowledgeGraph";

const TABS = [
  { id: "savings", label: "Savings Dashboard", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "knowledge", label: "Knowledge Graph", icon: Share2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Portal() {
  const [activeTab, setActiveTab] = useState<TabId>("savings");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Load persisted files from sessionStorage on mount
  useEffect(() => {
    const persistedFiles = sessionStorage.getItem('policy-pilot-files');
    if (persistedFiles) {
      try {
        const parsed = JSON.parse(persistedFiles);
        if (parsed.files) {
          setUploadedFiles(parsed.files);
        }
      } catch (error) {
        console.error('Failed to load persisted files:', error);
      }
    }
  }, []);

  // Save files to sessionStorage whenever they change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const persistedData = sessionStorage.getItem('policy-pilot-files');
      const existingData = persistedData ? JSON.parse(persistedData) : {};
      
      sessionStorage.setItem('policy-pilot-files', JSON.stringify({
        ...existingData,
        files: uploadedFiles
      }));
    }
  }, [uploadedFiles]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-[57px] z-10">
        <div className="w-full px-6 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="w-full px-4 sm:px-6 py-6">
        {activeTab === "savings" && <SavingsDashboard />}
        {activeTab === "documents" && (
          <DocumentsUpload files={uploadedFiles} setFiles={setUploadedFiles} />
        )}
        {activeTab === "knowledge" && <KnowledgeGraph files={uploadedFiles} />}
      </div>
    </div>
  );
}