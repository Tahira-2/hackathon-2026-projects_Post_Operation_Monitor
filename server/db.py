"""Thin SQLite wrapper. One connection per Flask request via flask.g.

Hand-rolled SQL is fine for ~6 tables. Avoids SQLAlchemy in the dep tree.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

from flask import g

from .config import DB_PATH


def _connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(path: Path = DB_PATH, *, reset: bool = False) -> None:
    """Create the schema if the file does not exist (or if `reset=True`)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if reset and path.exists():
        path.unlink()
    needs_init = not path.exists()
    if needs_init:
        schema_sql = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
        conn = _connect(path)
        try:
            conn.executescript(schema_sql)
            conn.commit()
        finally:
            conn.close()


def get_db() -> sqlite3.Connection:
    """Per-request connection cached on flask.g."""
    if "db" not in g:
        g.db = _connect(DB_PATH)
    return g.db


def close_db(_exc=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


# Standalone (non-Flask) connection — used by background threads. Caller is
# responsible for closing it.
def standalone_connection() -> sqlite3.Connection:
    return _connect(DB_PATH)
