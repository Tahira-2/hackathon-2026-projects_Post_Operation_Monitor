"""Runtime configuration for the GuardianPost-Op gateway server.

Tuned for hackathon-grade demos:
  - SQLite file alongside the rest of the data/ artifacts
  - DEMO_TIME_SCALE compresses simulated time so a 24h recovery and a 12h
    auto-summary window play out in seconds-to-minutes of wall time
"""

from __future__ import annotations

import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
WEBAPP_DIR = ROOT / "webapp"

DB_PATH = Path(os.environ.get("GUARDIAN_DB", DATA_DIR / "guardian.db"))

# Session lifetime (seconds). 12h is fine for a clinical-grade web app.
SESSION_TTL_SECONDS = 12 * 60 * 60

# Time scale for the simulated wearable. 1.0 = real-time. 60.0 = 1 wall second
# becomes 1 simulated minute, so a 24h recovery replays in 24 wall minutes; a
# 12h auto-summary fires every 12 wall minutes. The default here (240.0)
# replays a 24h recovery in 6 wall minutes and triggers the 12h summary every
# 3 wall minutes — good for a live demo. Override with GUARDIAN_TIME_SCALE.
DEMO_TIME_SCALE = float(os.environ.get("GUARDIAN_TIME_SCALE", "240.0"))

# Period (in *simulated* hours) between automatic summary sends.
AUTO_SUMMARY_PERIOD_HOURS = 12.0

# Length of the recent window summarized on demand (manual or auto), in
# simulated hours. 12h reads as a "shift summary" the doctor can scan quickly.
SUMMARY_WINDOW_HOURS = 12.0
