"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  api,
  SOAPDraftWithMeta,
  EMRHandoffResponse,
  EHRExportResponse,
  TranscribeUploadResponse,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Stage =
  | "upload"        // waiting for file
  | "transcribing"  // file uploaded, server is transcribing
  | "review"        // transcript + SOAP draft ready; doctor edits
  | "approved"      // SOAP approved
  | "fhir_exported" // FHIR bundle generated
  | "emr_submitted"; // EMR handoff complete

type InputMode = "video" | "manual";

const QUALITY_BADGE: Record<string, { label: string; cls: string }> = {
  minimal:   { label: "Incomplete – review carefully", cls: "bg-red-100 text-red-700" },
  partial:   { label: "Partial – edit before approving",  cls: "bg-yellow-100 text-yellow-700" },
  sufficient:{ label: "Ready to approve",               cls: "bg-green-100 text-green-700" },
};

const ACCEPTED_TYPES = ".mp4,.webm,.mov,.m4a,.mp3,.wav,.ogg";

// ---------------------------------------------------------------------------
// Main workflow component
// ---------------------------------------------------------------------------

function ConsultationWorkflow({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();

  // Stage and input mode
  const [stage, setStage]       = useState<Stage>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("video");

  // Upload / transcription
  const [dragOver, setDragOver]       = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<TranscribeUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual transcript fallback
  const [manualText, setManualText]     = useState("");
  const [generating, setGenerating]     = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // SOAP draft (shared between both input modes)
  const [soapDraft, setSoapDraft]   = useState<SOAPDraftWithMeta | null>(null);
  const [transcript, setTranscript] = useState("");

  // Approve
  const [approving, setApproving]     = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // FHIR Export
  const [exporting, setExporting]     = useState(false);
  const [exportResult, setExportResult] = useState<EHRExportResponse | null>(null);
  const [exportError, setExportError]   = useState<string | null>(null);

  // EMR Submit
  const [submitting, setSubmitting] = useState(false);
  const [emrResult, setEmrResult]   = useState<EMRHandoffResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const processFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    setTranscribing(true);
    setStage("transcribing");
    try {
      const res = await api.soap.transcribeUpload(appointmentId, file);
      setUploadResult(res);
      setSoapDraft(res.soap_draft);
      setTranscript(res.transcript);
      setStage("review");
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
      setStage("upload");
    } finally {
      setTranscribing(false);
    }
  }, [appointmentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const generateFromManual = async () => {
    if (!manualText.trim()) return;
    setGenerateError(null);
    setGenerating(true);
    try {
      // Use the existing /generate endpoint which just parses transcript → SOAP
      const res = await fetch("http://localhost:8000/api/v1/soap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("careit_access_token")
            ? { Authorization: `Bearer ${localStorage.getItem("careit_access_token")}` }
            : {}),
        },
        body: JSON.stringify({ appointment_id: appointmentId, transcript: manualText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Generation failed");
      }
      const note = await res.json();
      setSoapDraft({
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        metadata: {
          derived_from_transcript: true,
          transcript_chars_processed: manualText.length,
          update_timestamp: new Date().toISOString(),
          chunk_index: 0,
          quality_hint: note.assessment ? "sufficient" : note.subjective ? "partial" : "minimal",
          change_summary: "Generated from manual transcript.",
        },
      });
      setTranscript(manualText);
      setStage("review");
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const approve = async () => {
    if (!soapDraft) return;
    setApproveError(null);
    setApproving(true);
    try {
      await api.soap.approve(appointmentId, {
        subjective: soapDraft.subjective,
        objective:  soapDraft.objective,
        assessment: soapDraft.assessment,
        plan:       soapDraft.plan,
      });
      setStage("approved");
    } catch (e: unknown) {
      setApproveError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const exportFhir = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const res = await api.fhir.export(appointmentId);
      setExportResult(res);
      setStage("fhir_exported");
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const submitEmr = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.fhir.submit(appointmentId);
      setEmrResult(res);
      setStage("emr_submitted");
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Progress steps (only shown after review stage)
  // ---------------------------------------------------------------------------

  const progressSteps = [
    { key: "review",        label: "SOAP Draft" },
    { key: "approved",      label: "Approved" },
    { key: "fhir_exported", label: "FHIR Exported" },
    { key: "emr_submitted", label: "EMR Submitted" },
  ];
  const stageOrder = ["upload","transcribing","review","approved","fhir_exported","emr_submitted"];
  const stageIdx   = stageOrder.indexOf(stage);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => router.back()} className="text-indigo-600 text-sm hover:underline mt-1">
          ← Dashboard
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-800">Clinical Documentation</h2>
          <p className="text-xs text-gray-400 font-mono truncate">{appointmentId}</p>
        </div>
        <StagePill stage={stage} />
      </div>

      {/* Progress bar (visible after upload completes) */}
      {stage !== "upload" && stage !== "transcribing" && (
        <div className="flex items-center">
          {progressSteps.map((step, i) => {
            const stepIdx = stageOrder.indexOf(step.key);
            const done    = stageIdx > stepIdx;
            const active  = stageIdx === stepIdx;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    done   ? "bg-indigo-600 text-white" :
                    active ? "bg-indigo-200 text-indigo-800 ring-2 ring-indigo-400" :
                             "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs hidden sm:block whitespace-nowrap ${done || active ? "text-indigo-700 font-medium" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-indigo-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── UPLOAD STAGE ── */}
      {(stage === "upload" || stage === "transcribing") && (
        <div className="space-y-4">

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
            {(["video", "manual"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setInputMode(m); setUploadError(null); setGenerateError(null); }}
                className={`px-5 py-2 text-sm font-medium transition ${
                  inputMode === m
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {m === "video" ? "📹 Upload Recording" : "✏️ Paste Transcript"}
              </button>
            ))}
          </div>

          {/* Video upload panel */}
          {inputMode === "video" && (
            <div className="space-y-4">
              {stage !== "transcribing" ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-5xl mb-4">🎬</p>
                  <p className="text-lg font-semibold text-gray-700">
                    Drop your consultation recording here
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    or click to browse — MP4, WebM, MOV, M4A, MP3, WAV
                  </p>
                  <p className="text-xs text-gray-300 mt-3">
                    Recorded with Zoom, Google Meet, or MS Teams? Download and upload the recording here.
                    <br />Max 25 MB · For longer sessions, export a 5–10 min audio clip.
                  </p>
                </div>
              ) : (
                <TranscribingSpinner filename={selectedFile?.name} />
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium">Upload failed</p>
                  <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                  {uploadError.includes("TRANSCRIPTION_PROVIDER_UNAVAILABLE") && (
                    <p className="text-amber-600 text-xs mt-2 font-medium">
                      💡 Set OPENAI_API_KEY in your .env to enable Whisper API transcription,
                      or switch to "Paste Transcript" mode.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual transcript panel */}
          {inputMode === "manual" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-700">Paste consultation transcript</h3>
              <p className="text-xs text-gray-400">
                For best SOAP parsing, include section headers like
                <span className="font-mono bg-gray-100 px-1 rounded mx-1">Subjective:</span>
                <span className="font-mono bg-gray-100 px-1 rounded mx-1">Objective:</span>
                <span className="font-mono bg-gray-100 px-1 rounded mx-1">Assessment:</span>
                <span className="font-mono bg-gray-100 px-1 rounded">Plan:</span>
              </p>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste the full consultation transcript here…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none min-h-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {generateError && (
                <p className="text-red-500 text-xs">{generateError}</p>
              )}
              <button
                onClick={generateFromManual}
                disabled={generating || !manualText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
              >
                {generating ? "Generating SOAP…" : "Generate SOAP from Transcript"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── REVIEW / POST-UPLOAD STAGE ── */}
      {(stage === "review" || stage === "approved" || stage === "fhir_exported" || stage === "emr_submitted") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left panel — actions */}
          <div className="space-y-4">

            {/* File / transcription info */}
            {uploadResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-green-700">✅ Transcription complete</p>
                <div className="text-xs text-green-600 space-y-0.5">
                  <p>File: <span className="font-medium">{uploadResult.file_info.filename}</span> ({uploadResult.file_info.size_mb} MB)</p>
                  <p>Provider: <span className="font-medium">{uploadResult.transcription_provider.replace(/_/g, " ")}</span></p>
                  {uploadResult.duration_seconds && (
                    <p>Duration: <span className="font-medium">{Math.round(uploadResult.duration_seconds)}s</span></p>
                  )}
                  <p>Language: <span className="font-medium">{uploadResult.language_detected}</span></p>
                </div>
                {uploadResult.warning && (
                  <p className="text-amber-600 text-xs mt-2 border-t border-amber-200 pt-2">
                    ⚠️ {uploadResult.warning}
                  </p>
                )}
              </div>
            )}

            {/* Transcript (collapsible) */}
            {transcript && (
              <details className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 select-none">
                  Full transcript ({transcript.length} chars)
                </summary>
                <div className="px-4 pb-4 max-h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {transcript}
                </div>
              </details>
            )}

            {/* Approve */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">SOAP Approval Gate</h3>
              {stage === "review" ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Review the SOAP sections on the right. Edit any section directly before approving.
                    Approval locks the note and unlocks FHIR export.
                  </p>
                  <button
                    onClick={approve}
                    disabled={approving || !soapDraft}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-40"
                  >
                    {approving ? "Approving…" : "Approve SOAP Note"}
                  </button>
                  {approveError && <p className="text-red-500 text-xs mt-2">{approveError}</p>}
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-medium">SOAP note approved</span>
                </div>
              )}
            </div>

            {/* FHIR Export */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">FHIR R4 Export</h3>
              {stage === "approved" ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Packages the approved SOAP note into an interoperable FHIR R4 Bundle
                    (Consent + Composition + optional MedicationRequest).
                  </p>
                  <button
                    onClick={exportFhir}
                    disabled={exporting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-40"
                  >
                    {exporting ? "Generating bundle…" : "Export FHIR R4 Bundle"}
                  </button>
                  {exportError && <p className="text-red-500 text-xs mt-2">{exportError}</p>}
                </>
              ) : stage === "fhir_exported" || stage === "emr_submitted" ? (
                <FhirSummary result={exportResult} />
              ) : (
                <p className="text-xs text-gray-400">Approve SOAP note to unlock.</p>
              )}
            </div>

            {/* EMR Submit */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">EMR Handoff</h3>
              {stage === "fhir_exported" ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Submits the FHIR bundle to the simulated Athenahealth endpoint and
                    returns a traceable ACK with status history.
                  </p>
                  <button
                    onClick={submitEmr}
                    disabled={submitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-40"
                  >
                    {submitting ? "Submitting…" : "Submit to EMR (Athenahealth-sim)"}
                  </button>
                  {submitError && <p className="text-red-500 text-xs mt-2">{submitError}</p>}
                </>
              ) : stage === "emr_submitted" && emrResult ? (
                <EMRTimeline result={emrResult} />
              ) : (
                <p className="text-xs text-gray-400">Export FHIR bundle first.</p>
              )}
            </div>
          </div>

          {/* Right panel — SOAP draft */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-semibold text-gray-700">SOAP Note</h3>
                {soapDraft && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    QUALITY_BADGE[soapDraft.metadata.quality_hint]?.cls || ""
                  }`}>
                    {QUALITY_BADGE[soapDraft.metadata.quality_hint]?.label}
                  </span>
                )}
              </div>

              {soapDraft?.metadata.change_summary && (
                <p className="text-xs text-gray-400 italic mb-3">{soapDraft.metadata.change_summary}</p>
              )}

              {!soapDraft ? (
                <div className="text-center py-10 text-gray-300">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-sm">SOAP draft will appear here after transcription.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(["subjective","objective","assessment","plan"] as const).map((field) => (
                    <SOAPField
                      key={field}
                      field={field}
                      value={soapDraft[field]}
                      readonly={stage !== "review"}
                      onChange={(v) => setSoapDraft((d) => d ? { ...d, [field]: v } : d)}
                    />
                  ))}
                </div>
              )}

              {soapDraft && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                  <span>{soapDraft.metadata.transcript_chars_processed} chars processed</span>
                  <span>
                    {stage === "review" ? "Editable" : "Locked"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SOAP_FIELD_STYLE: Record<string, { border: string; label: string; labelCls: string }> = {
  subjective: { border: "border-indigo-200 bg-indigo-50", label: "S — Subjective", labelCls: "text-indigo-700" },
  objective:  { border: "border-blue-200 bg-blue-50",     label: "O — Objective",  labelCls: "text-blue-700"   },
  assessment: { border: "border-violet-200 bg-violet-50", label: "A — Assessment", labelCls: "text-violet-700" },
  plan:       { border: "border-purple-200 bg-purple-50", label: "P — Plan",       labelCls: "text-purple-700" },
};

function SOAPField({
  field, value, readonly, onChange,
}: {
  field: "subjective" | "objective" | "assessment" | "plan";
  value: string;
  readonly: boolean;
  onChange: (v: string) => void;
}) {
  const { border, label, labelCls } = SOAP_FIELD_STYLE[field];
  return (
    <div className={`rounded-lg border p-3 ${border}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${labelCls}`}>{label}</p>
      {readonly ? (
        <p className="text-gray-700 text-sm leading-relaxed min-h-[1.5rem]">
          {value || <span className="italic text-gray-300">—</span>}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Edit before approving…"
          className="w-full bg-transparent text-gray-700 text-sm leading-relaxed resize-none focus:outline-none min-h-[56px]"
        />
      )}
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const config: Record<Stage, { label: string; cls: string }> = {
    upload:        { label: "Waiting for upload",  cls: "bg-gray-100 text-gray-500"            },
    transcribing:  { label: "Transcribing…",        cls: "bg-blue-100 text-blue-700 animate-pulse" },
    review:        { label: "Review draft",         cls: "bg-yellow-100 text-yellow-700"         },
    approved:      { label: "SOAP Approved",        cls: "bg-green-100 text-green-700"           },
    fhir_exported: { label: "FHIR Ready",           cls: "bg-blue-100 text-blue-700"             },
    emr_submitted: { label: "EMR Submitted",        cls: "bg-purple-100 text-purple-700"         },
  };
  const { label, cls } = config[stage];
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>{label}</span>;
}

function TranscribingSpinner({ filename }: { filename?: string }) {
  return (
    <div className="border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-2xl p-12 text-center">
      <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-lg font-semibold text-indigo-700">Transcribing…</p>
      {filename && (
        <p className="text-sm text-indigo-500 mt-1 font-mono truncate max-w-xs mx-auto">{filename}</p>
      )}
      <p className="text-xs text-indigo-400 mt-3">
        This usually takes 20–60 seconds depending on the recording length.
        <br />Do not close this tab.
      </p>
    </div>
  );
}

function FhirSummary({ result }: { result: EHRExportResponse | null }) {
  if (!result) return null;
  const entries = (result.fhir_bundle as { entry?: Array<{ resource?: { resourceType?: string } }> }).entry || [];
  const types = entries.map((e) => e.resource?.resourceType).filter(Boolean).join(", ");
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-blue-600 mb-2">
        <span className="text-lg">📦</span>
        <span className="text-sm font-medium">FHIR R4 Bundle Ready</span>
      </div>
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>Export ID: <span className="font-mono">{result.export_id.slice(0, 16)}…</span></p>
        <p>Resources: <span className="font-medium text-gray-700">{types || "Bundle"}</span></p>
        <p>Status: <span className="text-green-600 font-medium">{result.status}</span></p>
      </div>
    </div>
  );
}

function EMRTimeline({ result }: { result: EMRHandoffResponse }) {
  const sim = result.simulated_response as {
    ack_code?: string; message?: string;
    transaction_id?: string; fhir_version?: string;
  };
  const steps = [
    { label: "Prepared",                  at: result.submitted_at },
    { label: "Sent to Athenahealth-sim",  at: result.submitted_at },
    { label: "Acknowledged",              at: result.acknowledged_at || result.submitted_at },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-purple-600 mb-2">
        <span className="text-lg">🏥</span>
        <span className="text-sm font-medium">EMR Handoff Complete</span>
        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
          {result.status}
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-4 bg-purple-200 mt-1" />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400">{new Date(s.at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
        {([
          ["Submission ID", result.submission_id.slice(0, 16) + "…", true],
          ["Transaction",   sim.transaction_id || "",               true],
          ["ACK Code",      sim.ack_code || "AA",                  false],
          ["FHIR Version",  sim.fhir_version || "R4",              false],
          ["Payload Hash",  result.payload_hash,                   true],
        ] as [string, string, boolean][]).map(([k, v, mono]) => (
          <div key={k} className="flex justify-between">
            <span className="text-gray-400">{k}</span>
            <span className={`text-gray-700 ${mono ? "font-mono" : ""}`}>{v}</span>
          </div>
        ))}
      </div>
      {sim.message && <p className="text-xs text-gray-500 italic">{sim.message}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page entry
// ---------------------------------------------------------------------------

function ConsultationPageInner() {
  const params = useSearchParams();
  const appointmentId = params.get("appointment_id") || "";

  if (!appointmentId) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center text-gray-500 px-4">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-medium mb-2">No appointment selected.</p>
        <a href="/doctor/dashboard" className="text-indigo-600 text-sm hover:underline">
          ← Go to Dashboard
        </a>
      </div>
    );
  }

  return <ConsultationWorkflow appointmentId={appointmentId} />;
}

export default function ConsultationPage() {
  return (
    <ProtectedRoute role="doctor">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4">
          <h1 className="text-lg font-bold text-indigo-700">CareIT — Clinical Documentation</h1>
          <p className="text-xs text-gray-400">Upload recording → Auto-transcribe → SOAP → FHIR R4 → EMR</p>
        </nav>
        <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
          <ConsultationPageInner />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
