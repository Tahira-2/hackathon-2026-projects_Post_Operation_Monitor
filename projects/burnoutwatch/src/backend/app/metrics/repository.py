from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from pathlib import Path


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS daily_metric_summaries (
    worker_id TEXT NOT NULL,
    local_date TEXT NOT NULL,
    canonical_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(worker_id, local_date)
)
"""


class MetricsRepository:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.initialize()

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        with closing(self.connect()) as connection:
            with connection:
                connection.execute(CREATE_TABLE_SQL)

    def get_summary(self, worker_id: str, local_date: str) -> dict | None:
        with closing(self.connect()) as connection:
            row = connection.execute(
                """
                SELECT canonical_json
                FROM daily_metric_summaries
                WHERE worker_id = ? AND local_date = ?
                """,
                (worker_id, local_date),
            ).fetchone()
        if row is None:
            return None
        return json.loads(row["canonical_json"])

    def upsert_summary(self, summary: dict) -> None:
        with closing(self.connect()) as connection:
            with connection:
                connection.execute(
                    """
                    INSERT INTO daily_metric_summaries (
                        worker_id,
                        local_date,
                        canonical_json,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(worker_id, local_date) DO UPDATE SET
                        canonical_json = excluded.canonical_json,
                        updated_at = excluded.updated_at
                    """,
                    (
                        summary["worker_id"],
                        summary["local_date"],
                        json.dumps(summary, sort_keys=True),
                        summary["ingested_at"],
                        summary["ingested_at"],
                    ),
                )

    def list_summaries(self, worker_id: str, start_date: str, end_date: str) -> list[dict]:
        with closing(self.connect()) as connection:
            rows = connection.execute(
                """
                SELECT canonical_json
                FROM daily_metric_summaries
                WHERE worker_id = ?
                  AND local_date >= ?
                  AND local_date <= ?
                ORDER BY local_date ASC
                """,
                (worker_id, start_date, end_date),
            ).fetchall()
        return [json.loads(row["canonical_json"]) for row in rows]
