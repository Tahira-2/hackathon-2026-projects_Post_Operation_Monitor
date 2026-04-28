"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useState, useRef, Suspense, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  api,
  SOAPDraftWithMeta,
  EMRHandoffResponse,
  EHRExportResponse,
  TranscribeUploadResponse,
  Prescription,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Stage =
  | "upload"
  | "transcribing"
  | "review"
  | "approved"
  | "fhir_exported"
  | "emr_submitted";

type InputMode = "video" | "manual";

const QUALITY_BADGE: Record<string, { label: string; cls: string }> = {
  minimal:    { label: "Incomplete – review carefully",   cls: "bg-error-container text-error" },
  partial:    { label: "Partial – edit before approving", cls: "bg-secondary-fixed text-on-secondary-container" },
  sufficient: { label: "Ready to approve",                cls: "bg-primary-fixed text-primary" },
};

const ACCEPTED_TYPES = ".mp4,.webm,.mov,.m4a,.mp3,.wav,.ogg";

// ---------------------------------------------------------------------------
// Main workflow component
// ---------------------------------------------------------------------------

function ConsultationWorkflow({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();

  const [stage, setStage]         = useState<Stage>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("video");

  const [dragOver, setDragOver]         = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<TranscribeUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualText, setManualText]       = useState("");
  const [generating, setGenerating]       = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [soapDraft, setSoapDraft] = useState<SOAPDraftWithMeta | null>(null);
  const [transcript, setTranscript] = useState("");

  const [approving, setApproving]       = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const [exporting, setExporting]       = useState(false);
  const [exportResult, setExportResult] = useState<EHRExportResponse | null>(null);
  const [exportError, setExportError]   = useState<string | null>(null);

  const [submitting, setSubmitting]   = useState(false);
  const [emrResult, setEmrResult]     = useState<EMRHandoffResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [prescriptions, setPrescriptions]       = useState<Prescription[]>([]);
  const [medicationInput, setMedicationInput]   = useState("");
  const [prescribing, setPrescribing]           = useState(false);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docEmail, setDocEmail]           = useState("");
  const [docActionMsg, setDocActionMsg]   = useState<string | null>(null);

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
      const note = await api.soap.generate(manualText);
      setSoapDraft({
        subjective: note.subjective,
        objective:  note.objective,
        assessment: note.assessment,
        plan:       note.plan,
        metadata: {
          derived_from_transcript:     true,
          transcript_chars_processed:  manualText.length,
          update_timestamp:            new Date().toISOString(),
          chunk_index:                 0,
          quality_hint:                note.assessment ? "sufficient" : note.subjective ? "partial" : "minimal",
          change_summary:              "Generated from manual transcript.",
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
    if (!window.confirm("Approve this SOAP note? This locks the note and cannot be undone.")) return;
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

  useEffect(() => {
    api.prescriptions
      .list()
      .then((rows) => setPrescriptions(rows.filter((p) => p.appointment_id === appointmentId)))
      .catch(() => {});
  }, [appointmentId]);

  const createPrescription = async () => {
    if (!medicationInput.trim()) return;
    setPrescribing(true);
    setPrescriptionError(null);
    try {
      const created = await api.prescriptions.create(appointmentId, medicationInput.trim());
      setPrescriptions((prev) => [created, ...prev]);
      setMedicationInput("");
    } catch (e: unknown) {
      setPrescriptionError(e instanceof Error ? e.message : "Failed to create prescription");
    } finally {
      setPrescribing(false);
    }
  };

  const removePrescription = async (prescriptionId: string) => {
    const confirmed = window.confirm("Remove this prescription?");
    if (!confirmed) return;
    setPrescriptionError(null);
    try {
      await api.prescriptions.remove(prescriptionId);
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
    } catch (e: unknown) {
      setPrescriptionError(e instanceof Error ? e.message : "Failed to remove prescription");
    }
  };

  const downloadSoapDoc = async () => {
    const blob = await api.soap.downloadDocument(appointmentId);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `soap-${appointmentId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reuploadSoapDoc = async () => {
    if (!docUploadFile) return;
    const res = await api.soap.reuploadDocument(appointmentId, docUploadFile);
    setDocActionMsg(res.message);
  };

  const emailSoapDoc = async () => {
    if (!docEmail.trim()) return;
    const res = await api.soap.emailDocument(appointmentId, docEmail.trim());
    setDocActionMsg(`${res.message} (${res.target_email})`);
  };

  // ---------------------------------------------------------------------------
  // Progress steps
  // ---------------------------------------------------------------------------

  const progressSteps = [
    { key: "review",        label: "SOAP Draft" },
    { key: "approved",      label: "Approved" },
    { key: "fhir_exported", label: "FHIR Exported" },
    { key: "emr_submitted", label: "EMR Submitted" },
  ];
  const stageOrder = ["upload", "transcribing", "review", "approved", "fhir_exported", "emr_submitted"];
  const stageIdx   = stageOrder.indexOf(stage);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary text-label-md font-semibold hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Dashboard
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-headline-md text-on-surface font-bold">Clinical Documentation</h2>
          <p className="text-caption text-outline font-mono truncate">{appointmentId}</p>
        </div>
        <StagePill stage={stage} />
      </div>

      {/* Progress bar */}
      {stage !== "upload" && stage !== "transcribing" && (
        <div className="flex items-center glass-card rounded-2xl px-md py-sm shadow-sm">
          {progressSteps.map((step, i) => {
            const stepIdx = stageOrder.indexOf(step.key);
            const done    = stageIdx > stepIdx;
            const active  = stageIdx === stepIdx;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    done   ? "bg-primary text-on-primary" :
                    active ? "bg-primary-fixed text-primary ring-2 ring-primary" :
                             "bg-surface-container-low text-outline"
                  }`}>
                    {done
                      ? <span className="material-symbols-outlined text-[14px]">check</span>
                      : i + 1}
                  </div>
                  <p className={`text-caption hidden sm:block whitespace-nowrap ${done || active ? "text-primary font-semibold" : "text-outline"}`}>
                    {step.label}
                  </p>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-primary" : "bg-outline-variant"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── UPLOAD STAGE ── */}
      {(stage === "upload" || stage === "transcribing") && (
        <div className="space-y-md">

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-outline-variant overflow-hidden w-fit">
            {(["video", "manual"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setInputMode(m); setUploadError(null); setGenerateError(null); }}
                className={`px-5 py-2.5 text-label-md font-semibold transition flex items-center gap-2 ${
                  inputMode === m
                    ? "bg-primary text-on-primary"
                    : "bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {m === "video" ? "videocam" : "edit_note"}
                </span>
                {m === "video" ? "Upload Recording" : "Paste Transcript"}
              </button>
            ))}
          </div>

          {/* Video upload panel */}
          {inputMode === "video" && (
            <div className="space-y-md">
              {stage !== "transcribing" ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                    dragOver
                      ? "border-primary bg-primary-fixed/30"
                      : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span
                    className="material-symbols-outlined text-primary mb-md block"
                    style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
                  >
                    videocam
                  </span>
                  <p className="text-headline-md text-on-surface font-bold mb-xs">
                    Drop your consultation recording here
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    or click to browse — MP4, WebM, MOV, M4A, MP3, WAV
                  </p>
                  <p className="text-caption text-outline mt-sm">
                    Recorded with Zoom, Google Meet, or MS Teams? Download and upload the recording here.
                    <br />Max 25 MB · For longer sessions, export a 5–10 min audio clip.
                  </p>
                </div>
              ) : (
                <TranscribingSpinner filename={selectedFile?.name} />
              )}

              {uploadError && (
                <div className="bg-error-container border border-error/20 rounded-xl px-md py-sm">
                  <p className="text-error text-label-md font-semibold">Upload failed</p>
                  <p className="text-error/80 text-caption mt-xs">{uploadError}</p>
                  {uploadError.includes("TRANSCRIPTION_PROVIDER_UNAVAILABLE") && (
                    <p className="text-tertiary text-caption mt-xs font-semibold">
                      Set OPENAI_API_KEY in your .env to enable Whisper API transcription, or switch to "Paste Transcript" mode.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual transcript panel */}
          {inputMode === "manual" && (
            <div className="glass-card rounded-2xl p-md shadow-sm space-y-md">
              <h3 className="text-label-md text-on-surface font-semibold">Paste consultation transcript</h3>
              <p className="text-caption text-outline">
                For best SOAP parsing, include section headers like
                <span className="font-mono bg-surface-container-low px-1 rounded mx-1">Subjective:</span>
                <span className="font-mono bg-surface-container-low px-1 rounded mx-1">Objective:</span>
                <span className="font-mono bg-surface-container-low px-1 rounded mx-1">Assessment:</span>
                <span className="font-mono bg-surface-container-low px-1 rounded">Plan:</span>
              </p>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste the full consultation transcript here…"
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md resize-none min-h-[180px] focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
              {generateError && (
                <p className="text-error text-caption">{generateError}</p>
              )}
              <button
                onClick={generateFromManual}
                disabled={generating || !manualText.trim()}
                className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 text-label-md transition hover:scale-[1.01] active:scale-[0.99] shadow-md disabled:opacity-40"
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
          <div className="space-y-md">

            {/* Transcription info */}
            {uploadResult && (
              <div className="bg-primary-fixed/40 border border-primary/20 rounded-xl px-md py-sm space-y-xs">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-label-md text-primary font-semibold">Transcription complete</p>
                </div>
                <div className="text-caption text-on-surface-variant space-y-0.5">
                  <p>File: <span className="font-semibold text-on-surface">{uploadResult.file_info.filename}</span> ({uploadResult.file_info.size_mb} MB)</p>
                  <p>Provider: <span className="font-semibold text-on-surface">{uploadResult.transcription_provider.replace(/_/g, " ")}</span></p>
                  {uploadResult.duration_seconds && (
                    <p>Duration: <span className="font-semibold text-on-surface">{Math.round(uploadResult.duration_seconds)}s</span></p>
                  )}
                  <p>Language: <span className="font-semibold text-on-surface">{uploadResult.language_detected}</span></p>
                </div>
                {uploadResult.warning && (
                  <p className="text-tertiary text-caption border-t border-outline-variant/30 pt-xs">
                    {uploadResult.warning}
                  </p>
                )}
              </div>
            )}

            {/* Transcript (collapsible) */}
            {transcript && (
              <details className="glass-card rounded-xl border border-white/20">
                <summary className="px-md py-sm cursor-pointer text-label-md font-semibold text-on-surface select-none">
                  Full transcript ({transcript.length} chars)
                </summary>
                <div className="px-md pb-md max-h-48 overflow-y-auto text-caption text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-sm">
                  {transcript}
                </div>
              </details>
            )}

            {/* Approve */}
            <div className="glass-card rounded-xl p-md shadow-sm">
              <h3 className="text-label-md text-on-surface font-semibold mb-sm">SOAP Approval Gate</h3>
              {stage === "review" ? (
                <>
                  <p className="text-caption text-outline mb-sm">
                    Review the SOAP sections on the right. Edit any section directly before approving.
                    Approval locks the note and unlocks FHIR export.
                  </p>
                  <button
                    onClick={approve}
                    disabled={approving || !soapDraft}
                    className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 text-label-md transition hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-40"
                  >
                    {approving ? "Approving…" : "Approve SOAP Note"}
                  </button>
                  {approveError && <p className="text-error text-caption mt-xs">{approveError}</p>}
                </>
              ) : (
                <div className="flex items-center gap-xs text-primary">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-label-md font-semibold">SOAP note approved</span>
                </div>
              )}
            </div>

            {/* FHIR Export */}
            <div className="glass-card rounded-xl p-md shadow-sm">
              <h3 className="text-label-md text-on-surface font-semibold mb-sm">FHIR R4 Export</h3>
              {stage === "approved" ? (
                <>
                  <p className="text-caption text-outline mb-sm">
                    Packages the approved SOAP note into an interoperable FHIR R4 Bundle
                    (Consent + Composition + optional MedicationRequest).
                  </p>
                  <button
                    onClick={exportFhir}
                    disabled={exporting}
                    className="w-full bg-secondary text-on-secondary font-bold rounded-xl py-3 text-label-md transition hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-40"
                  >
                    {exporting ? "Generating bundle…" : "Export FHIR R4 Bundle"}
                  </button>
                  {exportError && <p className="text-error text-caption mt-xs">{exportError}</p>}
                </>
              ) : stage === "fhir_exported" || stage === "emr_submitted" ? (
                <FhirSummary result={exportResult} />
              ) : (
                <p className="text-caption text-outline">Approve SOAP note to unlock.</p>
              )}
            </div>

            {/* EMR Submit */}
            <div className="glass-card rounded-xl p-md shadow-sm">
              <h3 className="text-label-md text-on-surface font-semibold mb-sm">EMR Handoff</h3>
              {stage === "fhir_exported" ? (
                <>
                  <p className="text-caption text-outline mb-sm">
                    Submits the FHIR bundle to the simulated Athenahealth endpoint and
                    returns a traceable ACK with status history.
                  </p>
                  <button
                    onClick={submitEmr}
                    disabled={submitting}
                    className="w-full bg-tertiary text-on-tertiary font-bold rounded-xl py-3 text-label-md transition hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-40"
                  >
                    {submitting ? "Submitting…" : "Submit to EMR (Athenahealth-sim)"}
                  </button>
                  {submitError && <p className="text-error text-caption mt-xs">{submitError}</p>}
                </>
              ) : stage === "emr_submitted" && emrResult ? (
                <EMRTimeline result={emrResult} />
              ) : (
                <p className="text-caption text-outline">Export FHIR bundle first.</p>
              )}
            </div>

            {/* Document Transfer */}
            <div className="glass-card rounded-xl p-md shadow-sm space-y-sm">
              <h3 className="text-label-md text-on-surface font-semibold">SOAP Document Transfer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <button
                  onClick={downloadSoapDoc}
                  className="border border-outline-variant rounded-xl px-sm py-2 text-label-md text-on-surface hover:bg-surface-container-low transition"
                >
                  Download PDF
                </button>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => setDocUploadFile(e.target.files?.[0] || null)}
                  className="text-caption text-on-surface-variant"
                />
                <button
                  onClick={reuploadSoapDoc}
                  disabled={!docUploadFile}
                  className="bg-primary text-on-primary rounded-xl px-sm py-2 text-label-md font-semibold disabled:opacity-40 transition"
                >
                  Reupload
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  placeholder="next-system@clinic.com"
                  className="flex-1 border border-outline-variant rounded-xl px-sm py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
                <button
                  onClick={emailSoapDoc}
                  className="bg-secondary text-on-secondary rounded-xl px-sm py-2 text-label-md font-semibold transition"
                >
                  Email
                </button>
              </div>
              {docActionMsg && <p className="text-caption text-primary font-semibold">{docActionMsg}</p>}
            </div>

            {/* Prescription */}
            <div className="glass-card rounded-xl p-md shadow-sm space-y-sm">
              <h3 className="text-label-md text-on-surface font-semibold">Prescription</h3>
              <div className="flex gap-2">
                <input
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  placeholder="Medication name"
                  className="flex-1 border border-outline-variant rounded-xl px-sm py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
                <button
                  onClick={createPrescription}
                  disabled={prescribing || !medicationInput.trim()}
                  className="bg-primary text-on-primary rounded-xl px-sm py-2 text-label-md font-semibold disabled:opacity-40 transition"
                >
                  Add
                </button>
              </div>
              {prescriptionError && <p className="text-caption text-error">{prescriptionError}</p>}
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {prescriptions.map((p) => (
                  <div key={p.id} className="text-caption border border-outline-variant/30 rounded-xl px-sm py-xs bg-surface-container-low flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-on-surface">{p.requested_medication}</span>
                      <span className="text-outline"> · {p.approval_status}</span>
                      {p.block_reason ? <span className="text-error"> ({p.block_reason})</span> : null}
                    </div>
                    <button
                      onClick={() => removePrescription(p.id)}
                      className="text-error text-caption font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {prescriptions.length === 0 && <p className="text-caption text-outline">No prescriptions yet.</p>}
              </div>
            </div>
          </div>

          {/* Right panel — SOAP draft */}
          <div>
            <div className="glass-card rounded-2xl p-md shadow-sm sticky top-24">
              <div className="flex items-start justify-between mb-sm gap-2">
                <h3 className="text-label-md text-on-surface font-semibold">SOAP Note</h3>
                {soapDraft && (
                  <span className={`text-caption font-bold px-3 py-0.5 rounded-full whitespace-nowrap ${
                    QUALITY_BADGE[soapDraft.metadata.quality_hint]?.cls || ""
                  }`}>
                    {QUALITY_BADGE[soapDraft.metadata.quality_hint]?.label}
                  </span>
                )}
              </div>

              {soapDraft?.metadata.change_summary && (
                <p className="text-caption text-outline italic mb-sm">{soapDraft.metadata.change_summary}</p>
              )}

              {!soapDraft ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-outline text-5xl mb-xs block">description</span>
                  <p className="text-body-md text-outline">SOAP draft will appear here after transcription.</p>
                </div>
              ) : (
                <div className="space-y-sm">
                  {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
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
                <div className="mt-sm pt-sm border-t border-outline-variant/30 flex justify-between text-caption text-outline">
                  <span>{soapDraft.metadata.transcript_chars_processed} chars processed</span>
                  <span>{stage === "review" ? "Editable" : "Locked"}</span>
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
  subjective: { border: "border-primary/20 bg-primary-fixed/40",     label: "S — Subjective", labelCls: "text-primary"              },
  objective:  { border: "border-secondary/20 bg-secondary-fixed/40", label: "O — Objective",  labelCls: "text-secondary"            },
  assessment: { border: "border-tertiary/20 bg-tertiary-fixed/40",   label: "A — Assessment", labelCls: "text-on-tertiary-container" },
  plan:       { border: "border-outline-variant bg-surface-container-low", label: "P — Plan", labelCls: "text-on-surface-variant"   },
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
    <div className={`rounded-xl border p-sm ${border}`}>
      <p className={`text-caption font-bold uppercase tracking-wide mb-xs ${labelCls}`}>{label}</p>
      {readonly ? (
        <p className="text-on-surface text-body-md leading-relaxed min-h-[1.5rem]">
          {value || <span className="italic text-outline">—</span>}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Edit before approving…"
          className="w-full bg-transparent text-on-surface text-body-md leading-relaxed resize-none focus:outline-none min-h-[56px]"
        />
      )}
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const config: Record<Stage, { label: string; cls: string }> = {
    upload:        { label: "Waiting for upload", cls: "bg-surface-container text-outline" },
    transcribing:  { label: "Transcribing…",       cls: "bg-secondary-fixed text-secondary animate-pulse" },
    review:        { label: "Review draft",        cls: "bg-secondary-fixed text-on-secondary-container" },
    approved:      { label: "SOAP Approved",       cls: "bg-primary-fixed text-primary" },
    fhir_exported: { label: "FHIR Ready",          cls: "bg-secondary-fixed text-secondary" },
    emr_submitted: { label: "EMR Submitted",       cls: "bg-primary-fixed text-primary" },
  };
  const { label, cls } = config[stage];
  return <span className={`text-caption font-bold px-3 py-1 rounded-full capitalize ${cls}`}>{label}</span>;
}

function TranscribingSpinner({ filename }: { filename?: string }) {
  return (
    <div className="border-2 border-dashed border-primary/30 bg-primary-fixed/20 rounded-2xl p-12 text-center">
      <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-md" />
      <p className="text-headline-md text-primary font-bold">Transcribing…</p>
      {filename && (
        <p className="text-caption text-on-surface-variant mt-xs font-mono truncate max-w-xs mx-auto">{filename}</p>
      )}
      <p className="text-caption text-outline mt-sm">
        This usually takes 20–60 seconds depending on the recording length.
        <br />Do not close this tab.
      </p>
    </div>
  );
}

function FhirSummary({ result }: { result: EHRExportResponse | null }) {
  if (!result) return null;
  const entries = (result.fhir_bundle as { entry?: Array<{ resource?: { resourceType?: string } }> }).entry || [];
  const types   = entries.map((e) => e.resource?.resourceType).filter(Boolean).join(", ");
  return (
    <div className="space-y-xs">
      <div className="flex items-center gap-xs text-secondary mb-xs">
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
        <span className="text-label-md font-semibold">FHIR R4 Bundle Ready</span>
      </div>
      <div className="text-caption text-on-surface-variant space-y-0.5">
        <p>Export ID: <span className="font-mono text-on-surface">{result.export_id.slice(0, 16)}…</span></p>
        <p>Resources: <span className="font-semibold text-on-surface">{types || "Bundle"}</span></p>
        <p>Status: <span className="text-primary font-semibold">{result.status}</span></p>
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
    { label: "Prepared",                 at: result.submitted_at },
    { label: "Sent to Athenahealth-sim", at: result.submitted_at },
    { label: "Acknowledged",             at: result.acknowledged_at || result.submitted_at },
  ];
  return (
    <div className="space-y-sm">
      <div className="flex items-center gap-xs text-primary mb-xs">
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
        <span className="text-label-md font-semibold">EMR Handoff Complete</span>
        <span className="ml-auto text-caption bg-primary-fixed text-primary px-2 py-0.5 rounded-full font-bold">
          {result.status}
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary" style={{ fontSize: "10px" }}>check</span>
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-4 bg-primary-fixed mt-1" />}
            </div>
            <div>
              <p className="text-caption font-semibold text-on-surface">{s.label}</p>
              <p className="text-caption text-outline">{new Date(s.at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface-container-low rounded-xl p-sm space-y-xs text-caption">
        {([
          ["Submission ID", result.submission_id.slice(0, 16) + "…", true],
          ["Transaction",   sim.transaction_id || "",                true],
          ["ACK Code",      sim.ack_code || "AA",                   false],
          ["FHIR Version",  sim.fhir_version || "R4",               false],
          ["Payload Hash",  result.payload_hash,                    true],
        ] as [string, string, boolean][]).map(([k, v, mono]) => (
          <div key={k} className="flex justify-between">
            <span className="text-outline">{k}</span>
            <span className={`text-on-surface ${mono ? "font-mono" : ""}`}>{v}</span>
          </div>
        ))}
      </div>
      {sim.message && <p className="text-caption text-on-surface-variant italic">{sim.message}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page entry
// ---------------------------------------------------------------------------

function ConsultationPageInner() {
  const params       = useSearchParams();
  const appointmentId = params.get("appointment_id") || "";

  if (!appointmentId) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center px-4">
        <span className="material-symbols-outlined text-outline text-5xl mb-md block">warning</span>
        <p className="text-headline-md text-on-surface font-bold mb-xs">No appointment selected.</p>
        <a
          href="/doctor/dashboard"
          className="text-primary text-label-md font-semibold hover:underline inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Go to Dashboard
        </a>
      </div>
    );
  }

  return <ConsultationWorkflow appointmentId={appointmentId} />;
}

export default function ConsultationPage() {
  return (
    <ProtectedRoute role="doctor">
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 hero-gradient z-0 pointer-events-none" />

        <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3 glass-panel border-b border-white/20 shadow-[0_4px_24px_rgba(0,77,64,0.08)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <h1 className="font-black text-primary">careIT</h1>
          </div>
          <div className="h-5 w-px bg-outline-variant" />
          <span className="text-caption text-outline font-semibold uppercase tracking-wider">Clinical Documentation</span>
          <div className="ml-auto hidden md:block">
            <p className="text-caption text-outline">Upload → Transcribe → SOAP → FHIR R4 → EMR</p>
          </div>
        </header>

        <main className="relative z-10 pt-20 pb-xl">
          <Suspense fallback={<div className="p-8 text-outline text-body-md">Loading…</div>}>
            <ConsultationPageInner />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
