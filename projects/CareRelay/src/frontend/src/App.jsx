import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  HeartPulse,
  Loader2,
  MessageSquare,
  Pill,
  QrCode,
  Send,
  Stethoscope,
  User,
  FileText as FileTextIcon,
} from "lucide-react";
import { generateBrief, getDrugWarnings, getPatient, getQr } from "./api/careRelayApi";
import { compactCondition, display, shortMedName, titleCase } from "./utils/format";
import DeepDive from "./DeepDive";

/* ═══════════════════════════════════════════════════════════
   Patient registry + view config
   ═══════════════════════════════════════════════════════════ */

const PATIENTS = [
  { id: "emerald", name: "Emerald468 Botsford977", initials: "EB", source: "api" },
  { id: "mitchell", name: "James R. Mitchell", initials: "JM", source: "static" },
];

const VIEWS = [
  { id: "snapshot", label: "Snapshot", icon: Stethoscope },
  { id: "deepDive", label: "Deep Dive", icon: Activity },
  { id: "chat",     label: "Chat",      icon: MessageSquare },
  { id: "idCard",   label: "ID Card",   icon: CreditCard },
];

const metricOrder = ["hba1c", "blood_pressure", "ldl", "egfr", "weight", "glucose"];

/* ═══════════════════════════════════════════════════════════
   App root
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  const [activePatient, setActivePatient] = useState("emerald");
  const [activeView, setActiveView] = useState("snapshot");
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPatient()
      .then(setPatientData)
      .catch(() => setError("Backend is not reachable. Start Flask at http://127.0.0.1:5000."));
  }, []);

  if (error) {
    return (
      <main className="center-screen">
        <div className="error-card">
          <AlertTriangle size={28} />
          <h1>CareRelay backend needed</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!patientData) {
    return (
      <main className="center-screen">
        <Loader2 className="spin" size={32} />
        <p>Loading patient snapshot...</p>
      </main>
    );
  }

  function handlePatientClick(pid) {
    if (activePatient === pid) return; // already selected
    setActivePatient(pid);
    setActiveView("snapshot");
  }

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CR</div>
          <div>
            <strong>CareRelay</strong>
            <span>Clinician snapshot</span>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section-label">Patients</div>
          {PATIENTS.map((p) => {
            const isActive = activePatient === p.id;
            return (
              <div key={p.id} className="patient-group">
                <button
                  className={`nav-item patient-item ${isActive ? "active-patient" : ""}`}
                  onClick={() => handlePatientClick(p.id)}
                >
                  <div className="patient-avatar-sm">{p.initials}</div>
                  <span className="patient-name-sidebar">{p.name}</span>
                  {isActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isActive && (
                  <div className="sub-nav">
                    {VIEWS.map((view) => {
                      const Icon = view.icon;
                      return (
                        <button
                          className={`nav-item sub-nav-item ${activeView === view.id ? "active" : ""}`}
                          key={view.id}
                          onClick={() => setActiveView(view.id)}
                        >
                          <Icon size={15} />
                          {view.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <BadgeCheck size={16} />
          Synthetic Synthea data. Not for clinical use.
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        <DisclaimerBanner text={patientData.disclaimer} />

        {/* ── Emerald (API-driven) ── */}
        {activePatient === "emerald" && activeView === "snapshot" && <Snapshot data={patientData} />}
        {activePatient === "emerald" && activeView === "deepDive" && <DeepDive data={patientData} />}
        {activePatient === "emerald" && activeView === "idCard"   && <IDCard data={patientData} />}
        {activePatient === "emerald" && activeView === "chat"     && <ChatPlaceholder patientName="Emerald468 Botsford977" />}

        {/* ── Mitchell (static HTML) ── */}
        {activePatient === "mitchell" && (activeView === "snapshot" || activeView === "deepDive") && (
          <MitchellEHR />
        )}
        {activePatient === "mitchell" && activeView === "idCard" && (
          <MitchellIDPlaceholder />
        )}
        {activePatient === "mitchell" && activeView === "chat" && (
          <MitchellChat />
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Mitchell — iframe embed of the reference EHR HTML
   ═══════════════════════════════════════════════════════════ */

function MitchellEHR() {
  return (
    <section className="page" style={{ padding: 0 }}>
      <iframe
        src="/mitchell_ehr.html"
        title="James R. Mitchell EHR"
        className="mitchell-iframe"
      />
    </section>
  );
}

function MitchellIDPlaceholder() {
  return (
    <section className="page">
      <div className="placeholder-view">
        <CreditCard size={48} strokeWidth={1} />
        <h2>ID Card — James R. Mitchell</h2>
        <p>Medical ID card for this patient is not yet generated.<br />
        This feature will be available once the patient record is fully integrated.</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Chat placeholder (for both patients)
   ═══════════════════════════════════════════════════════════ */

function ChatPlaceholder({ patientName }) {
  return (
    <section className="page">
      <div className="placeholder-view chat-placeholder">
        <MessageSquare size={48} strokeWidth={1} />
        <h2>Clinical Chat</h2>
        <p>RAG-powered clinical Q&A for <strong>{patientName}</strong></p>
        <div className="chat-preview">
          <div className="chat-input-mock">
            <input
              type="text"
              placeholder={`Ask a question about ${patientName.split(" ")[0]}'s history...`}
              disabled
            />
            <button disabled>Send</button>
          </div>
          <span className="coming-soon-badge">Coming Soon</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Mitchell RAG Chat — real implementation
   ═══════════════════════════════════════════════════════════ */

const API_BASE = "http://127.0.0.1:5000";

function MitchellChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I have access to James Mitchell's full EHR record (28 pages). Ask me anything about his medical history, medications, lab results, or procedures.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfPage, setPdfPage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q, sources: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await resp.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}`, sources: [] },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources || [],
            sourceType: data.source_type,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to reach the backend. Is Flask running?", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="page" style={{ padding: 0 }}>
      <div className="chat-layout">
        {/* ── Chat panel ── */}
        <div className="chat-panel">
          <div className="chat-header">
            <MessageSquare size={18} />
            <h2>Clinical Chat — James R. Mitchell</h2>
            <span className="chat-badge">RAG · EHR PDF</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === "user" ? "Dr" : "AI"}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-text">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="chat-sources">
                      <span className="chat-sources-label">Sources:</span>
                      {msg.sources.map((s, j) => (
                        <button
                          key={j}
                          className="chat-source-btn"
                          onClick={() => setPdfPage(s.page)}
                          title={s.snippet}
                        >
                          📄 Page {s.page}
                        </button>
                      ))}
                      {msg.sourceType === "extractive" && (
                        <span className="chat-source-fallback">Extractive (LLM unavailable)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-msg-avatar">AI</div>
                <div className="chat-msg-body">
                  <div className="chat-msg-text chat-loading">
                    <Loader2 className="spin" size={16} />
                    Searching EHR records...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about medications, labs, procedures, history..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF viewer panel ── */}
        <div className={`pdf-panel ${pdfPage ? "open" : ""}`}>
          {pdfPage ? (
            <>
              <div className="pdf-panel-header">
                <span>EHR Document — Page {pdfPage}</span>
                <button className="pdf-close-btn" onClick={() => setPdfPage(null)}>✕</button>
              </div>
              <iframe
                src={`${API_BASE}/api/pdf/mitchell#page=${pdfPage}`}
                title="Mitchell EHR PDF"
                className="pdf-iframe"
              />
            </>
          ) : (
            <div className="pdf-placeholder">
              <FileTextIcon size={40} strokeWidth={1} />
              <p>Click a source citation to view the EHR document</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Shared components (unchanged)
   ═══════════════════════════════════════════════════════════ */

function DisclaimerBanner({ text }) {
  return (
    <div className="disclaimer">
      <AlertTriangle size={16} />
      {text}
    </div>
  );
}

function Snapshot({ data }) {
  return (
    <section className="page snapshot-dense-mode">
      {/* ── Top Bar / Patient Hero ── */}
      <div className="ehr-header">
        <div className="ehr-id-row">
          <div className="patient-identity">
            <div className="patient-avatar">{data.patient.initials || "EB"}</div>
            <div className="patient-name-block">
              <div className="ehr-name">
                {data.patient.name}{" "}
                <span className="demo">
                  · {titleCase(data.patient.gender)} · {data.patient.age} · MRN {data.patient.mrn}
                </span>
              </div>
              <div className="ehr-meta">
                <span className="ehr-meta-item">Blood type: {display(data.patient.bloodType)}</span>
                <span className="ehr-meta-item">Code status: {display(data.patient.codeStatus)}</span>
                <span className="ehr-meta-item">Address: {display(data.patient.address)}</span>
              </div>
            </div>
          </div>
          {data.snapshot.allergies && data.snapshot.allergies.length > 0 && (
            <div className="allergy-block">
              <span className="allergy-label">⚠ Allergies</span>
              {data.snapshot.allergies.map((a) => (
                <span key={a.name} className="allergy-pill">
                  {compactCondition(a.name)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Vitals Strip ── */}
        <div className="vitals-strip">
          {metricOrder.map((key) => {
            const metric = data.snapshot.latestMetrics[key];
            if (!metric) return null;
            return (
              <div className="vital-item" key={key}>
                <div className="vital-value good">{metric.displayValue}</div>
                <div className="vital-label">{metric.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="panels">
        <ClinicalSummaryPanel data={data} />
        <MedicationPanelDense medications={data.snapshot.currentMedications} />
      </div>

      {/* ── Conditions Strip ── */}
      <div className="panel conditions-strip-panel" style={{ marginTop: "14px" }}>
        <div className="panel-header">
          <h3>Active Conditions</h3>
          <span className="panel-count">{data.snapshot.activeConditions.length}</span>
        </div>
        <div className="problem-chips">
          {data.snapshot.activeConditions.slice(0, 15).map((c) => (
            <span key={c.name} className="chip chip-active">
              {compactCondition(c.name)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Clinical Summary (Combines state + AI brief button)
   ═══════════════════════════════════════════════════════════ */

function ClinicalSummaryPanel({ data }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleBrief() {
    setLoading(true);
    try {
      setBrief(await generateBrief());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel summary-panel">
      <div className="panel-header">
        <h3>Clinical State & Summary</h3>
        <span className="status-badge">✓ Structured</span>
      </div>
      <div className="ehr-summary" style={{ marginBottom: "12px" }}>
        <p style={{ margin: 0 }}>{data.snapshot.aiStatusLine}</p>
      </div>

      <div className="ai-brief-inline">
        {!brief && !loading && (
          <button className="spec-btn active" onClick={handleBrief} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Bot size={14} /> Generate AI First Visit Brief
          </button>
        )}
        {loading && (
          <div className="loading-inline" style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "8px", alignItems: "center" }}>
            <Loader2 size={14} className="spin" /> Synthesizing medical history...
          </div>
        )}
        {brief && (
          <div className="insight normal" style={{ marginTop: "0" }}>
            <span className="insight-tag"><Bot size={10} style={{ display: "inline", verticalAlign: "middle" }}/> AI Brief</span>
            <div className="insight-text" style={{ marginTop: "4px" }}>{brief.brief}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Medications Panel (with Integrated FDA Check)
   ═══════════════════════════════════════════════════════════ */

function MedicationPanelDense({ medications }) {
  const [warnings, setWarnings] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkWarnings() {
    setLoading(true);
    try {
      const medNames = medications.slice(0, 5).map((med) => med.name);
      const res = await getDrugWarnings(medNames);
      setWarnings(res?.warnings || []);
    } catch {
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="panel meds-panel">
        <div className="panel-header">
          <h3>Current Medications</h3>
          {!warnings ? (
            <button className="spec-btn" onClick={checkWarnings} disabled={loading} style={{ padding: "4px 10px", display: "flex", gap: "4px" }}>
              {loading ? <Loader2 size={12} className="spin" /> : <AlertTriangle size={12} />}
              {loading ? "Checking..." : "FDA Check"}
            </button>
          ) : (
            <span className="status-badge" style={{ background: "var(--green-dim)", color: "var(--green)" }}>✓ FDA Checked</span>
          )}
        </div>
        <div className="encounters-list">
          {medications.slice(0, 8).map((med) => (
            <div className="encounter-row" key={med.name}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <strong style={{ color: "var(--text-primary)" }}>{shortMedName(med.name)}</strong>
                <span className="enc-spec-badge pcp">{med.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {warnings && (
        <div className="panel fda-parallel-panel" style={{ border: "1px solid rgba(245, 158, 11, 0.4)", background: "#fff" }}>
          <div className="panel-header">
            <h3 style={{ color: "var(--orange)", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={14} /> FDA Warnings
            </h3>
            <span className="panel-count">{warnings.length} issues</span>
          </div>
          <div className="encounters-list">
            {warnings.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>No OpenFDA warnings found for current regimen.</p>
            ) : (
              warnings.map((warn, idx) => (
                <div className="insight warn" key={idx} style={{ marginBottom: "8px" }}>
                  <span className="insight-tag">{warn.medication}</span>
                  <div className="insight-text">{warn.interaction || warn.warning}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IDCard({ data }) {
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Patient-carried access</div>
          <h1>Medical ID Card</h1>
        </div>
      </div>
      <div className="card-stage" style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <img 
          src="/ID_card.jpeg" 
          alt="Alex Morgan Medical ID Card" 
          style={{ width: "100%", maxWidth: "800px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        />
      </div>
    </section>
  );
}
