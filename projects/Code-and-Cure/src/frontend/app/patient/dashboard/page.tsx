"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, Doctor } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type ChatMessage =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; suggestion?: { specialty: string; rationale: string } };

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="text-xs text-gray-500">
      <span className="text-yellow-400">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
      {" "}({count})
    </span>
  );
}

function DoctorCard({ doc, onBook }: { doc: Doctor; onBook: (doc: Doctor) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 truncate">{doc.name}</p>
        <p className="text-sm text-indigo-600">{doc.specialty}</p>
        <p className="text-xs text-gray-400 truncate">{doc.location}</p>
        <StarRating rating={doc.rating} count={doc.review_count} />
      </div>
      <button
        onClick={() => onBook(doc)}
        className="ml-4 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
      >
        Book
      </button>
    </div>
  );
}

function ChatSuggestionPill({
  specialty,
  onConfirm,
  onDismiss,
}: {
  specialty: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <p className="text-xs text-gray-500">Do you want to search for a {specialty}?</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg py-1.5 font-medium transition"
        >
          Yes, search
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs rounded-lg py-1.5 transition"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  // Doctor list state
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hi! I'm your AI Care Navigator. Not sure which doctor you need? Describe your symptoms and I'll suggest the right specialist.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load all doctors on mount
  useEffect(() => {
    api.doctors
      .list()
      .then((data) => {
        setAllDoctors(data);
        setFiltered(data);
      })
      .catch((e: Error) => setDocsError(e.message))
      .finally(() => setDocsLoading(false));
  }, []);

  // Filter whenever search text changes
  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(allDoctors);
      return;
    }
    setFiltered(
      allDoctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      )
    );
  }, [search, allDoctors]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setDocsError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await api.doctors.list();
          setAllDoctors(data);
          setFiltered(
            search
              ? data.filter(
                  (d) =>
                    d.name.toLowerCase().includes(search.toLowerCase()) ||
                    d.specialty.toLowerCase().includes(search.toLowerCase())
                )
              : data
          );
          setNearMeActive(true);
        } catch (e: unknown) {
          setDocsError(e instanceof Error ? e.message : "Failed to load nearby doctors");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setDocsError("Location access denied. Please allow location to use this feature.");
        setGeoLoading(false);
      }
    );
  };

  const clearNearMe = () => {
    setNearMeActive(false);
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      const result = await api.symptoms.analyze(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Based on what you've described, you may benefit from seeing a **${result.recommended_specialty}**. ${result.rationale}`,
          suggestion: { specialty: result.recommended_specialty, rationale: result.rationale },
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I had trouble analyzing those symptoms. Try rephrasing them." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const applySuggestion = (specialty: string) => {
    setSearch(specialty);
    setMessages((prev) =>
      prev.map((m) =>
        "suggestion" in m && m.suggestion?.specialty === specialty
          ? { ...m, suggestion: undefined }
          : m
      )
    );
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: `Showing ${specialty} doctors. Clear the search bar to see all doctors again.` },
    ]);
  };

  const dismissSuggestion = (specialty: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        "suggestion" in m && m.suggestion?.specialty === specialty
          ? { ...m, suggestion: undefined }
          : m
      )
    );
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "No problem! Feel free to browse all available doctors or describe different symptoms." },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-indigo-700">CareIT Patient Portal</h1>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
          Sign out
        </button>
      </nav>

      {/* Body: two-column */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Doctor Browse */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Find a Doctor</h2>
          <p className="text-gray-500 text-sm mb-4">Browse available doctors or use the AI assistant on the right to find the right specialist.</p>

          {/* Search + Near Me */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setNearMeActive(false); }}
                placeholder="Search by name, specialty, or location…"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setNearMeActive(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={nearMeActive ? clearNearMe : handleNearMe}
              disabled={geoLoading}
              className={`shrink-0 text-sm font-medium rounded-xl px-4 py-2.5 border transition ${
                nearMeActive
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 text-gray-700 hover:border-indigo-400 bg-white"
              }`}
            >
              {geoLoading ? "Locating…" : nearMeActive ? "📍 Near Me ×" : "📍 Near Me (50 mi)"}
            </button>
          </div>

          {nearMeActive && (
            <p className="text-xs text-indigo-600 mb-3">Showing doctors near your location</p>
          )}

          {docsError && (
            <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{docsError}</p>
          )}

          {docsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doc={doc}
                  onBook={(d) =>
                    router.push(`/patient/booking/${d.id}?name=${encodeURIComponent(d.name)}`)
                  }
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-sm">No doctors match &quot;{search}&quot;.</p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-2 text-indigo-600 text-sm hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — AI Chatbot Sidebar */}
        <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">AI Care Navigator</p>
            <p className="text-xs text-gray-400">Describe your symptoms to find the right specialist</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                  {"suggestion" in msg && msg.suggestion && (
                    <ChatSuggestionPill
                      specialty={msg.suggestion.specialty}
                      onConfirm={() => applySuggestion(msg.suggestion!.specialty)}
                      onDismiss={() => dismissSuggestion(msg.suggestion!.specialty)}
                    />
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-400 animate-pulse">
                  Analyzing…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Describe your symptoms…"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute role="patient">
      <Dashboard />
    </ProtectedRoute>
  );
}
