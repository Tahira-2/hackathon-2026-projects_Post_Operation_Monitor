"use client";

import { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import { FileText, Upload, Trash2, File, ImageIcon, CheckCircle, XCircle, Loader2, Star } from "lucide-react";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  type: string;
  isLatest?: boolean;
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

type FileEntry = UploadedFile & {
  status: UploadStatus;
  errorMsg?: string;
};

interface Props {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const SAMPLE_DOCS: FileEntry[] = [
  {
    id: "sample-1",
    name: "BlueCross_Policy_2026.pdf",
    size: 2_340_000,
    uploadDate: "2026-01-15",
    type: "application/pdf",
    status: "success",
  },
  {
    id: "sample-2",
    name: "SunLife_Benefits_Schedule.pdf",
    size: 1_820_000,
    uploadDate: "2026-01-15",
    type: "application/pdf",
    status: "success",
  },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function FileTypeIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-teal-500" />;
  return <FileText className="w-5 h-5 text-teal-500" />;
}

function StatusBadge({ status, errorMsg }: { status: UploadStatus; errorMsg?: string }) {
  if (status === "uploading") {
    return (
      <div className="flex items-center gap-1 text-xs text-teal-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Uploading…</span>
      </div>
    );
  }
  if (status === "success") {
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-1 text-xs text-red-500" title={errorMsg}>
        <XCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Failed</span>
      </div>
    );
  }
  return null;
}

export default function DocumentsUpload({ files, setFiles }: Props) {
  const [dragging, setDragging] = useState(false);
  // Track upload status for user-uploaded files
  const [uploadEntries, setUploadEntries] = useState<FileEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted uploadEntries from sessionStorage on mount
  useEffect(() => {
    const persistedFiles = sessionStorage.getItem('policy-pilot-files');
    if (persistedFiles) {
      try {
        const parsed = JSON.parse(persistedFiles);
        if (parsed.uploadEntries) {
          setUploadEntries(parsed.uploadEntries);
        }
      } catch (error) {
        console.error('Failed to load persisted upload entries:', error);
      }
    }
  }, []);

  // Save uploadEntries to sessionStorage whenever they change
  useEffect(() => {
    if (uploadEntries.length > 0) {
      const persistedData = sessionStorage.getItem('policy-pilot-files');
      const existingData = persistedData ? JSON.parse(persistedData) : {};
      
      sessionStorage.setItem('policy-pilot-files', JSON.stringify({
        ...existingData,
        uploadEntries
      }));
    }
  }, [uploadEntries]);

  const allEntries: FileEntry[] = [
    ...SAMPLE_DOCS,
    ...uploadEntries,
  ];

  async function uploadFile(file: File): Promise<void> {
    const id = `${file.name}-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];
    const entry: FileEntry = {
      id,
      name: file.name,
      size: file.size,
      uploadDate: today,
      type: file.type,
      status: "uploading",
      isLatest: true, // Mark as latest
    };

    // Remove "latest" from other files and add new entry
    setUploadEntries((prev) => [
      ...prev.map(e => ({ ...e, isLatest: false })), // Remove latest from existing
      entry
    ]);
    setFiles((prev) => [
      ...prev.map(f => ({ ...f, isLatest: false })), // Remove latest from existing
      { id, name: file.name, size: file.size, uploadDate: today, type: file.type, isLatest: true }
    ]);

    // Build FormData matching the backend contract
    const formData = new FormData();
    formData.append("file", file);
    formData.append("policy_name", file.name.replace(/\.[^.]+$/, "")); // strip extension
    formData.append("upload_source", "frontend");

    try {
      // Call our frontend API which forwards to the backend
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "success" } : e))
        );
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error ?? `HTTP ${res.status}`;
        setUploadEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "error", errorMsg: msg } : e))
        );
      }
    } catch (err) {
      setUploadEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "error", errorMsg: String(err) } : e
        )
      );
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      Array.from(e.target.files).forEach(uploadFile);
      e.target.value = ""; // reset so same file can be re-selected
    }
  }

  function deleteEntry(id: string) {
    setUploadEntries((prev) => prev.filter((e) => e.id !== id));
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function clearAllFiles() {
    setUploadEntries([]);
    setFiles([]);
    sessionStorage.removeItem('policy-pilot-files');
  }

  const successCount = uploadEntries.filter((e) => e.status === "success").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Insurance Documents</h2>
        <p className="text-sm text-gray-500">
          Upload your policy PDFs — they&apos;re sent to the backend and used to build your knowledge graph.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
            dragging
              ? "border-teal-500 bg-teal-50 scale-[1.01]"
              : "border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleChange}
          />
          <Upload
            className={`w-12 h-12 mx-auto mb-3 transition-colors ${
              dragging ? "text-teal-600" : "text-gray-400"
            }`}
          />
          {dragging ? (
            <p className="text-teal-600 font-semibold text-lg">Drop to upload!</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium text-lg">Drag &amp; drop files here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-3">PDF · DOC · DOCX · JPG · PNG</p>
            </>
          )}
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">
              {allEntries.length} document{allEntries.length !== 1 ? "s" : ""}
            </h3>
            <div className="flex items-center gap-3">
              {uploadEntries.length > 0 && (
                <button
                  onClick={clearAllFiles}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear session files"
                >
                  Clear All
                </button>
              )}
              <span className="text-xs text-gray-400">Status</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {allEntries.map((entry) => {
              const isSample = SAMPLE_DOCS.some((s) => s.id === entry.id);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* File type icon */}
                  <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileTypeIcon type={entry.type} />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{entry.name}</p>
                      {entry.isLatest && (
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-xs font-medium">
                          <Star className="w-3 h-3" />
                          latest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatBytes(entry.size)} · {entry.uploadDate}
                      {isSample && (
                        <span className="ml-2 bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded text-xs">
                          sample
                        </span>
                      )}
                    </p>
                    {/* Inline progress bar while uploading */}
                    {entry.status === "uploading" && (
                      <div className="mt-1.5 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-1 rounded-full animate-pulse w-2/3" />
                      </div>
                    )}
                    {entry.status === "error" && entry.errorMsg && (
                      <p className="text-xs text-red-400 mt-0.5 truncate">{entry.errorMsg}</p>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="shrink-0">
                    {isSample ? (
                      <File className="w-4 h-4 text-gray-300" />
                    ) : (
                      <StatusBadge status={entry.status} errorMsg={entry.errorMsg} />
                    )}
                  </div>

                  {/* Delete (user uploads only) */}
                  {!isSample && entry.status !== "uploading" && (
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {successCount > 0 && (
            <div className="px-5 py-3 bg-teal-50 border-t border-teal-100">
              <p className="text-sm text-teal-700">
                ✓ {successCount} document{successCount !== 1 ? "s" : ""} processed — check the Knowledge Graph tab
              </p>
              <p className="text-xs text-teal-600 mt-1">
                Files persist during your browser session
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}