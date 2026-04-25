"""Render the clinician-facing visualization from the recovery log + alerts.

Produces a single PNG with one subplot per vital. Each subplot shows:
  - the warn band (light yellow) and critical band (light red) from CSV-1
  - the per-cycle averages from the Recovery Log
  - markers where a cycle was classified WARNING or CRITICAL

This is the static export of what the live clinician dashboard would show; in
production it would be a continuously-updating web view.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # no display required
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

from .prescription_parser import read_csv1
from .vitals import VITALS, VITAL_BY_KEY


_VITAL_COLUMNS = {
    "heart_rate":       "heart_rate_avg",
    "hrv":              "hrv_avg",
    "respiratory_rate": "respiratory_rate_avg",
    "spo2":             "spo2_avg",
    "body_temp":        "body_temp_avg",
}


def _load_recovery_log(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _load_alerts(path: Path) -> list[dict]:
    if not path.exists():
        return []
    out = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def render(
    csv1_path: Path,
    recovery_log_path: Path,
    alerts_path: Path,
    out_png: Path,
) -> Path:
    prescription = read_csv1(csv1_path)
    log = _load_recovery_log(recovery_log_path)
    alerts = _load_alerts(alerts_path)

    if not log:
        raise ValueError(f"recovery log is empty: {recovery_log_path}")

    hours = [float(r["window_end_hour"]) for r in log]

    fig, axes = plt.subplots(len(VITALS), 1, figsize=(11, 13.5), sharex=True)
    fig.suptitle("GuardianPost-Op — 24h Recovery Log", fontsize=14,
                 fontweight="bold", y=0.985)

    for ax, spec in zip(axes, VITALS):
        rule = prescription[spec.key]
        col = _VITAL_COLUMNS[spec.key]
        values = [float(r[col]) for r in log]

        # Bands: critical first (wider), warn on top.
        ax.axhspan(rule.critical_low, rule.warn_low,
                   color="#fde2e2", alpha=0.6, label="_critical_low")
        ax.axhspan(rule.warn_high, rule.critical_high,
                   color="#fde2e2", alpha=0.6, label="_critical_high")
        ax.axhspan(rule.warn_low, rule.warn_high,
                   color="#eaf6e6", alpha=0.5, label="_baseline")

        # Trend line.
        ax.plot(hours, values, color="#1a4f8a", linewidth=1.6, marker="o",
                markersize=2.5, label=f"{spec.label} avg")

        # Cycle status markers along the trend line.
        for r in log:
            status = r[f"{spec.key}_status"]
            if status == "NORMAL":
                continue
            x = float(r["window_end_hour"])
            y = float(r[col])
            color = "#d62728" if status == "CRITICAL" else "#e69500"
            ax.scatter([x], [y], color=color, s=42, zorder=5,
                       edgecolor="black", linewidth=0.4)

        ax.set_ylabel(f"{spec.label}\n({spec.unit})", fontsize=9)
        ax.grid(True, alpha=0.3)
        ax.set_xlim(0, 24)

    axes[-1].set_xlabel("Hour since admission to monitoring")

    # Shared legend.
    legend_elems = [
        Patch(facecolor="#eaf6e6", alpha=0.5, label="Baseline (warn) band"),
        Patch(facecolor="#fde2e2", alpha=0.6, label="Critical band"),
        plt.Line2D([0], [0], color="#1a4f8a", linewidth=1.6, label="30-min average"),
        plt.Line2D([0], [0], marker="o", color="white", markerfacecolor="#e69500",
                   markeredgecolor="black", markersize=8, label="Warning"),
        plt.Line2D([0], [0], marker="o", color="white", markerfacecolor="#d62728",
                   markeredgecolor="black", markersize=8, label="Critical"),
    ]
    fig.legend(handles=legend_elems, loc="lower center", ncol=5,
               bbox_to_anchor=(0.5, -0.005), fontsize=9, frameon=False)

    # Caption with active alerts.
    crit_alerts = [a for a in alerts if a["status"] == "CRITICAL"]
    warn_alerts = [a for a in alerts if a["status"] == "WARNING"]
    caption = (
        f"Cycles: {len(log)}    "
        f"Warnings: {len(warn_alerts)}    "
        f"Critical: {len(crit_alerts)}"
    )
    if crit_alerts:
        first = crit_alerts[0]
        caption += (
            f"\nFirst critical: cycle {first['cycle_index']} "
            f"(hour {first['window_end_hour']:.1f}) — "
            f"{first['push']['body']}"
        )
    fig.text(0.5, 0.952, caption, ha="center", fontsize=9, color="#444")

    fig.tight_layout(rect=(0, 0.03, 1, 0.935))
    out_png.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_png, dpi=130, bbox_inches="tight")
    plt.close(fig)
    return out_png


if __name__ == "__main__":
    here = Path(__file__).resolve().parent.parent
    out = render(
        csv1_path=here / "data" / "csv1_prescription.csv",
        recovery_log_path=here / "data" / "recovery_log.csv",
        alerts_path=here / "data" / "alerts.jsonl",
        out_png=here / "demo_output" / "dashboard.png",
    )
    print(f"Wrote dashboard -> {out}")
