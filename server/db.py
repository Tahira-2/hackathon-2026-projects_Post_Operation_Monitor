"""Dual-backend DB wrapper.

If the env var DATABASE_URL is set (Postgres connection string, e.g. from
Neon/Supabase/Render Postgres), the gateway uses Postgres via psycopg3.
Otherwise it falls back to a local SQLite file at data/guardian.db.

Both paths expose the SAME surface to application code:

  - get_db()                 - Flask request-scoped connection
  - standalone_connection()  - background-thread connection (caller closes)
  - init_db(reset=False)     - create schema if missing (or recreate if reset)

App code uses `?` placeholders everywhere; the Postgres wrapper translates
them to psycopg's `%s` at execute time. All INSERTs use `RETURNING id` to
get the new row id (works in both backends — SQLite >=3.35 and Postgres),
so we don't need a `lastrowid` shim.
"""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from flask import g

from .config import DB_PATH


# Detect backend at import time. The choice is fixed for the lifetime of
# the process — handy because most app code reaches for get_db() without
# caring which backend it talks to.
_DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
USE_POSTGRES = bool(_DATABASE_URL)

if USE_POSTGRES:
    import psycopg                       # type: ignore
    from psycopg.rows import dict_row    # type: ignore


# ============================================================================
# psycopg adapter — wraps a psycopg connection so it looks like a sqlite3
# connection to app code (.execute returns a cursor, ? placeholders, etc.).
# ============================================================================

class _PgCursor:
    def __init__(self, cur):
        self._cur = cur
    def fetchone(self):
        return self._cur.fetchone()
    def fetchall(self):
        return self._cur.fetchall()
    @property
    def rowcount(self):
        return self._cur.rowcount
    def close(self):
        self._cur.close()


class _PgConnection:
    """Surface mirrors sqlite3.Connection: execute() / commit() / close()."""
    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=()):
        if "?" in sql:
            sql = sql.replace("?", "%s")
        cur = self._conn.cursor()
        cur.execute(sql, tuple(params) if params else None)
        return _PgCursor(cur)

    def executescript(self, script: str):
        # Postgres doesn't support multi-statement execute via psycopg's
        # parameterized API; run as a single string with autocommit off.
        with self._conn.cursor() as cur:
            cur.execute(script)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


# ============================================================================
# Connection factories
# ============================================================================

def _connect_sqlite(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _connect_postgres():
    raw = psycopg.connect(_DATABASE_URL, row_factory=dict_row)
    raw.autocommit = False
    return _PgConnection(raw)


def _open_connection():
    return _connect_postgres() if USE_POSTGRES else _connect_sqlite(DB_PATH)


# ============================================================================
# Schema bootstrap
# ============================================================================

def _postgres_table_exists(conn) -> bool:
    cur = conn.execute(
        "SELECT to_regclass('public.patients') AS t",
    )
    row = cur.fetchone()
    return row and row.get("t") is not None


def _drop_postgres_schema(conn) -> None:
    # Drop child tables first (FK order). CASCADE handles any leftovers.
    for tbl in (
        "live_alerts", "summary_sends", "summaries", "sessions",
        "care_links", "doctors", "patients",
    ):
        conn.execute(f"DROP TABLE IF EXISTS {tbl} CASCADE")
    conn.commit()


def init_db(path: Path = DB_PATH, *, reset: bool = False) -> None:
    """Create the schema if missing. With reset=True, drop + recreate."""
    if USE_POSTGRES:
        conn = _connect_postgres()
        try:
            if reset:
                _drop_postgres_schema(conn)
            if reset or not _postgres_table_exists(conn):
                schema = (Path(__file__).parent / "schema_postgres.sql").read_text(
                    encoding="utf-8"
                )
                conn.executescript(schema)
                conn.commit()
        finally:
            conn.close()
        return

    # SQLite path
    path.parent.mkdir(parents=True, exist_ok=True)
    if reset and path.exists():
        path.unlink()
    if not path.exists():
        schema_sql = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
        conn = _connect_sqlite(path)
        try:
            conn.executescript(schema_sql)
            conn.commit()
        finally:
            conn.close()


# ============================================================================
# Flask request-scoped connection + background-thread connection
# ============================================================================

def get_db():
    """Per-request connection cached on flask.g."""
    if "db" not in g:
        g.db = _open_connection()
    return g.db


def close_db(_exc=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def standalone_connection():
    """Connection for background threads. Caller is responsible for closing."""
    return _open_connection()
