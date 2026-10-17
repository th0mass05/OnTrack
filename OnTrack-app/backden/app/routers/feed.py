from typing import Literal

from fastapi import APIRouter, Query

from ..domain import ASSIGNMENT_SELECT, assignment_json, public_user, recent_activity, refresh_house, week_bounds
from ..security import DB, CurrentUser, HouseId

router = APIRouter()


@router.get("/home")
def home(user: CurrentUser, house_id: HouseId, db: DB):
    refresh_house(db, house_id)
    monday, sunday = week_bounds()
    my_due = db.execute(
        ASSIGNMENT_SELECT + " WHERE a.user_id = ? AND a.status = 'open' AND a.due_date BETWEEN ? AND ? ORDER BY a.due_date, a.id",
        (user["id"], monday, sunday),
    )
    week = db.execute(
        """SELECT COUNT(*) AS total, SUM(a.status = 'done') AS done
           FROM assignments a JOIN chores c ON c.id = a.chore_id
           WHERE c.house_id = ? AND a.due_date BETWEEN ? AND ?""",
        (house_id, monday, sunday),
    ).fetchone()
    return {
        "user": {**public_user(user), "xp": user["xp"]},
        "my_due": [assignment_json(r) for r in my_due],
        "week_completion_pct": round(100 * week["done"] / week["total"]) if week["total"] else 0,
        "recent_activity": recent_activity(db, house_id, 3),
    }


@router.get("/leaderboard")
def leaderboard(house_id: HouseId, db: DB, period: Literal["week"] = "week"):
    monday, sunday = week_bounds()
    rows = db.execute(
        """SELECT u.id, u.name, u.email,
                  COALESCE(SUM(CASE WHEN a.status = 'done' AND a.due_date BETWEEN ? AND ? THEN a.xp END), 0) AS week_xp
           FROM users u LEFT JOIN assignments a ON a.user_id = u.id
           WHERE u.house_id = ?
           GROUP BY u.id ORDER BY week_xp DESC, u.name""",
        (monday, sunday, house_id),
    )
    return [{"user": public_user(r), "xp": r["week_xp"]} for r in rows]


@router.get("/activity")
def activity(house_id: HouseId, db: DB, limit: int = Query(30, ge=1, le=100)):
    return recent_activity(db, house_id, limit)
