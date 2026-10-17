"""House rules shared by the routers: weeks, rotation, activity and row -> JSON shapes (see frontend lib/types.ts)."""
import json
import sqlite3
from datetime import date, timedelta
from typing import Any


def level_for(xp: int) -> int:
    return xp // 100  # keep in sync with levelFor in the frontend


def week_bounds(day: date | None = None) -> tuple[str, str]:
    """Monday and Sunday of the week containing `day`, as ISO dates."""
    day = day or date.today()
    monday = day - timedelta(days=day.weekday())
    return monday.isoformat(), (monday + timedelta(days=6)).isoformat()


# ---- Shapes ----


def public_user(row: sqlite3.Row, prefix: str = "") -> dict[str, Any]:
    return {"id": row[f"{prefix}id"], "name": row[f"{prefix}name"], "email": row[f"{prefix}email"]}


def house_json(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return None if row is None else {"id": row["id"], "name": row["name"], "join_code": row["join_code"]}


ASSIGNMENT_SELECT = """
    SELECT a.id, c.name AS chore_name, a.xp, a.due_date, a.status,
           u.id AS u_id, u.name AS u_name, u.email AS u_email
    FROM assignments a
    JOIN chores c ON c.id = a.chore_id
    JOIN users u ON u.id = a.user_id
"""


def assignment_json(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "chore_name": row["chore_name"],
        "xp": row["xp"],
        "user": public_user(row, "u_"),
        "due_date": row["due_date"],
        "status": row["status"],
    }


def chore_json(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "house_id": row["house_id"],
        "name": row["name"],
        "xp": row["xp"],
        "repeats_weekly": bool(row["repeats_weekly"]),
        "assignment_mode": row["assignment_mode"],
        "fixed_user_id": row["fixed_user_id"],
        "active": bool(row["active"]),
    }


def recent_activity(db: sqlite3.Connection, house_id: int, limit: int) -> list[dict[str, Any]]:
    rows = db.execute(
        """SELECT a.type, a.metadata, a.created_at, u.id AS u_id, u.name AS u_name, u.email AS u_email
           FROM activity a JOIN users u ON u.id = a.user_id
           WHERE a.house_id = ? ORDER BY a.created_at DESC, a.id DESC LIMIT ?""",
        (house_id, limit),
    )
    return [
        {"type": r["type"], "user": public_user(r, "u_"), "metadata": json.loads(r["metadata"]), "created_at": r["created_at"]}
        for r in rows
    ]


# ---- Writes (callers own the transaction) ----


def log_activity(db: sqlite3.Connection, house_id: int, user_id: int, type: str, metadata: dict | None = None) -> None:
    db.execute(
        "INSERT INTO activity (house_id, user_id, type, metadata) VALUES (?, ?, ?, ?)",
        (house_id, user_id, type, json.dumps(metadata or {})),
    )


def pick_assignee(db: sqlite3.Connection, chore: sqlite3.Row) -> int:
    if chore["assignment_mode"] == "fixed" and chore["fixed_user_id"] is not None:
        return chore["fixed_user_id"]
    members = [r["id"] for r in db.execute("SELECT id FROM users WHERE house_id = ? ORDER BY id", (chore["house_id"],))]
    last = db.execute(
        "SELECT user_id FROM assignments WHERE chore_id = ? ORDER BY due_date DESC LIMIT 1", (chore["id"],)
    ).fetchone()
    if last is not None and last["user_id"] in members:
        # Rotate to the next housemate after whoever had it last time.
        return members[(members.index(last["user_id"]) + 1) % len(members)]
    # First time round: give it to whoever has the fewest open chores this week.
    monday, sunday = week_bounds()
    load = dict.fromkeys(members, 0)
    for r in db.execute(
        "SELECT user_id, COUNT(*) AS n FROM assignments WHERE status = 'open' AND due_date BETWEEN ? AND ? GROUP BY user_id",
        (monday, sunday),
    ):
        if r["user_id"] in load:
            load[r["user_id"]] = r["n"]
    return min(members, key=lambda m: (load[m], m))


def assign_for_this_week(db: sqlite3.Connection, chore: sqlite3.Row) -> None:
    _, sunday = week_bounds()
    db.execute(
        "INSERT OR IGNORE INTO assignments (chore_id, user_id, xp, due_date) VALUES (?, ?, ?, ?)",
        (chore["id"], pick_assignee(db, chore), chore["xp"], sunday),
    )


def refresh_house(db: sqlite3.Connection, house_id: int) -> None:
    """Bring a house up to date: overdue chores become missed, weekly chores get this week's assignment.

    Run lazily before reads, so no background scheduler is needed.
    """
    monday, _ = week_bounds()
    with db:
        db.execute(
            """UPDATE assignments SET status = 'missed'
               WHERE status = 'open' AND due_date < ?
                 AND chore_id IN (SELECT id FROM chores WHERE house_id = ?)""",
            (date.today().isoformat(), house_id),
        )
        stale = db.execute(
            """SELECT c.* FROM chores c
               WHERE c.house_id = ? AND c.active = 1 AND c.repeats_weekly = 1
                 AND NOT EXISTS (SELECT 1 FROM assignments a WHERE a.chore_id = c.id AND a.due_date >= ?)""",
            (house_id, monday),
        ).fetchall()
        for chore in stale:
            assign_for_this_week(db, chore)
