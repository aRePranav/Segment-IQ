"""
SQLite persistence for segmentation runs. Every call to /segment — sample
or uploaded — writes a real row here, and /analytics, /history read it
back out. Same pragmatic single-file-DB approach as VeriNews; swap for
Postgres if this needs to survive high traffic.
"""
import json
import os
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone

DB_PATH = os.environ.get(
    "SEGMENTIQ_DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "data", "segmentiq.db"),
)

_lock = threading.Lock()


def init_db():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                dataset_name TEXT NOT NULL,
                customer_count INTEGER NOT NULL,
                chosen_k INTEGER NOT NULL,
                silhouette REAL NOT NULL,
                davies_bouldin REAL NOT NULL,
                processing_seconds REAL NOT NULL,
                segment_distribution TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def insert_run(
    run_id: str,
    source: str,
    dataset_name: str,
    customer_count: int,
    chosen_k: int,
    silhouette: float,
    davies_bouldin: float,
    processing_seconds: float,
    segment_distribution: dict,
):
    with _lock, get_conn() as conn:
        conn.execute(
            """
            INSERT INTO runs
                (run_id, source, dataset_name, customer_count, chosen_k,
                 silhouette, davies_bouldin, processing_seconds,
                 segment_distribution, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run_id,
                source,
                dataset_name,
                customer_count,
                chosen_k,
                silhouette,
                davies_bouldin,
                processing_seconds,
                json.dumps(segment_distribution),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()


def get_analytics() -> dict:
    with get_conn() as conn:
        total_runs = conn.execute("SELECT COUNT(*) AS c FROM runs").fetchone()["c"]
        total_customers = conn.execute(
            "SELECT COALESCE(SUM(customer_count), 0) AS s FROM runs"
        ).fetchone()["s"]
        total_uploads = conn.execute(
            "SELECT COUNT(*) AS c FROM runs WHERE source = 'upload'"
        ).fetchone()["c"]
        avg_silhouette = conn.execute(
            "SELECT AVG(silhouette) AS a FROM runs"
        ).fetchone()["a"] or 0.0
    return {
        "total_runs": total_runs,
        "total_customers_processed": total_customers,
        "total_datasets_uploaded": total_uploads,
        "average_silhouette": round(avg_silhouette, 3),
    }


def get_recent(limit: int = 10) -> list[dict]:
    limit = max(1, min(limit, 50))
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT run_id, source, dataset_name, customer_count, chosen_k, "
            "silhouette, processing_seconds, created_at FROM runs "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]
