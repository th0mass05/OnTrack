import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path

DB_PATH = Path(os.environ.get("ONTRACK_DB", Path(__file__).parent.parent / "ontrack.db"))
SCHEMA = Path(__file__).with_name("schema.sql")


def connect() -> sqlite3.Connection:
    # FastAPI may run a dependency and its endpoint on different worker threads.
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = connect()
    conn.execute("PRAGMA journal_mode = WAL")  # readers don't block the writer
    conn.executescript(SCHEMA.read_text())
    conn.close()


def get_db() -> Iterator[sqlite3.Connection]:
    # Writes are committed explicitly with `with db:` in the endpoint; anything uncommitted is rolled back on close.
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
