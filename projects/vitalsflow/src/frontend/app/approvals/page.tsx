"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCcw, ShieldAlert } from "lucide-react";

import { getApprovals, type ApprovalItem } from "@/lib/api";

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApprovals(30);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApprovals();
  }, []);

  const highPriorityCount = useMemo(
    () => items.filter((item) => ["stat", "asap", "urgent"].includes(String(item.priority).toLowerCase())).length,
    [items]
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Action & Approval Queue</h1>
          <p className="page-subtitle">
            Live draft/proposal `ServiceRequest` resources from backend + FHIR
          </p>
        </div>
        <div className="inline-flex min-h-11 items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          <ShieldAlert className="h-3.5 w-3.5" />
          {items.length} Pending Drafts
        </div>
      </div>

      <div className="mb-8 glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            High priority drafts: <strong style={{ color: "var(--text-primary)" }}>{highPriorityCount}</strong>
          </div>
          <button type="button" onClick={() => void loadApprovals()} className="btn-secondary">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
      </div>

      <section className="glass-card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" role="grid" aria-label="Approval queue">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Action", "Patient ID", "Priority", "Status", "Authored", "Review"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading approvals...
                    </span>
                  </td>
                </tr>
              )}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                    No live approval drafts found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-6 py-5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      <div>{item.headline}</div>
                      {item.note && (
                        <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                      {item.patient_id || "Unknown"}
                    </td>
                    <td className="px-6 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {item.priority || "routine"}
                    </td>
                    <td className="px-6 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {item.status}
                    </td>
                    <td className="px-6 py-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {item.authored_on ? new Date(item.authored_on).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <Link href={item.patient_id ? `/patient/${item.patient_id}` : "/"} className="btn-secondary rounded-full text-xs">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
