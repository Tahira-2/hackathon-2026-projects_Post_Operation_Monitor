"use client";

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { FileText, Upload, Trash2, ImageIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { PolicyDocument } from "@/lib/cosmosdb";

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
  // Cosmos DB–enriched fields (present after successful upload or DB load)
  policy_id?: string;
  coverage_types?: string[];
  entities_extracted?: number;
  fromCosmos?: boolean;
};

interface Props {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}


function formatBytes(bytes: number) {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function FileTypeIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-teal-500" />;
  return <FileText className="w-5 h-5 text-teal-500" />;
}

function StatusBadge({
  status,
  errorMsg,
}: {
  status: UploadStatus;
  errorMsg?: string;
}) {
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
      <div
        className="flex items-center gap-1 text-xs text-red-500"
        title={errorMsg}
      >
        <XCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Failed</span>
      </div>
    );
  }
  return null;
}

export default function DocumentsUpload({ files, setFiles }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploadEntries, setUploadEntries] = useState<FileEntry[]>([]);
  const [cosmosEntries, setCosmosEntries] = useState<FileEntry[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted policy documents from Cosmos DB on mount
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((docs: PolicyDocument[]) => {
        const entries: FileEntry[] = docs.map((doc) => ({
          id: doc.id,
          name: doc.document_name,
          size: 0,
          uploadDate: doc.upload_date,
          type: "application/pdf",
          status: "success" as UploadStatus,
          policy_id: doc.policy_id,
          coverage_types: doc.graph_preview?.coverage_types,
          entities_extracted: doc.extraction_summary?.entities_extracted,
          fromCosmos: true,
        }));
        setCosmosEntries(entries);
      })
      .catch(() => {}) // graceful — Cosmos not configured won't break the UI
      .finally(() => setLoadingDocs(false));
  }, []);

  const allEntries: FileEntry[] = [...cosmosEntries, ...uploadEntries];

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

    // Add to list immediately with uploading state
    setUploadEntries((prev) => [...prev, entry]);
    setFiles((prev) => [
      ...prev,
      { id, name: file.name, size: file.size, uploadDate: today, type: file.type },
    ]);

    // Build FormData matching the backend contract
    const formData = new FormData();
    formData.append("file", file);
    formData.append("policy_name", file.name.replace(/\.[^.]+$/, "")); // strip extension
    formData.append("upload_source", "frontend");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Enrich the entry with Cosmos DB response data
        setUploadEntries((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "success" as UploadStatus,
                  policy_id: data.policy_id,
                  coverage_types: data.graph_preview?.coverage_types,
                  entities_extracted:
                    data.extraction_summary?.entities_extracted,
                }
              : e
          )
        );
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error ?? `HTTP ${res.status}`;
        setUploadEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: "error" as UploadStatus, errorMsg: msg } : e
          )
        );
      }
    } catch (err) {
      setUploadEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "error" as UploadStatus, errorMsg: String(err) }
            : e
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

  async function deleteEntry(id: string) {
    // Optimistically remove from UI
    setUploadEntries((prev) => prev.filter((e) => e.id !== id));
    setCosmosEntries((prev) => prev.filter((e) => e.id !== id));
    setFiles((prev) => prev.filter((f) => f.id !== id));

    // Delete from Cosmos DB (best-effort — UI already updated)
    try {
      await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Silently ignore network errors; document is already gone from UI
    }
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
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Insurance Documents
        </h2>
        <p className="text-sm text-gray-500">
          Upload your policy PDFs — they&apos;re sent to the backend and used
          to build your knowledge graph.
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
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
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
            <p className="text-teal-600 font-semibold text-lg">
              Drop to upload!
            </p>
          ) : (
            <>
              <p className="text-gray-600 font-medium text-lg">
                Drag &amp; drop files here
              </p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-3">
                PDF · DOC · DOCX · JPG · PNG
              </p>
            </>
          )}
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">
              {loadingDocs ? "Documents" : `${allEntries.length} document${allEntries.length !== 1 ? "s" : ""}`}
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
            {loadingDocs ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading documents…</span>
              </div>
            ) : allEntries.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No documents yet — upload a policy PDF to get started.
              </div>
            ) : (
              allEntries.map((entry) => {
                const sizeLabel = formatBytes(entry.size);
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* File type icon */}
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <FileTypeIcon type={entry.type} />
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {entry.name}
                      </p>

                      {/* Size / date */}
                      <p className="text-xs text-gray-400">
                        {sizeLabel && `${sizeLabel} · `}
                        {entry.uploadDate}
                      </p>

                      {/* Policy ID */}
                      {entry.policy_id && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                          ID: {entry.policy_id}
                        </p>
                      )}

                      {/* Coverage type chips */}
                      {entry.coverage_types && entry.coverage_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {entry.coverage_types.slice(0, 3).map((ct) => (
                            <span
                              key={ct}
                              className="bg-teal-50 text-teal-700 text-xs px-1.5 py-0.5 rounded-full"
                            >
                              {ct}
                            </span>
                          ))}
                          {entry.coverage_types.length > 3 && (
                            <span className="text-xs text-gray-400 self-center">
                              +{entry.coverage_types.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Entity count */}
                      {entry.entities_extracted !== undefined && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.entities_extracted} entities extracted
                        </p>
                      )}

                      {/* Inline progress bar while uploading */}
                      {entry.status === "uploading" && (
                        <div className="mt-1.5 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-1 rounded-full animate-pulse w-2/3" />
                        </div>
                      )}
                      {entry.status === "error" && entry.errorMsg && (
                        <p className="text-xs text-red-400 mt-0.5 truncate">
                          {entry.errorMsg}
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0 mt-0.5">
                      <StatusBadge status={entry.status} errorMsg={entry.errorMsg} />
                    </div>

                    {/* Delete */}
                    {entry.status !== "uploading" && (
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {successCount > 0 && (
            <div className="px-5 py-3 bg-teal-50 border-t border-teal-100">
              <p className="text-sm text-teal-700">
                ✓ {successCount} document
                {successCount !== 1 ? "s" : ""} processed — check the
                Knowledge Graph tab
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
