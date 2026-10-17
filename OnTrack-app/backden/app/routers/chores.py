from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..domain import (
    ASSIGNMENT_SELECT,
    assign_for_this_week,
    assignment_json,
    chore_json,
    level_for,
    log_activity,
    refresh_house,
    week_bounds,
)
from ..security import DB, CurrentUser, HouseId

router = APIRouter()


class NewChoreIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    xp: Literal[10, 30, 50]
    repeats_weekly: bool
    assignment_mode: Literal["fixed", "rotating"]
    fixed_user_id: int | None = None


@router.get("/assignments")
def assignments(
    user: CurrentUser, house_id: HouseId, db: DB, scope: Literal["mine", "all"] = "all", week: Literal["current"] = "current"
):
    refresh_house(db, house_id)
    monday, sunday = week_bounds()
    sql = ASSIGNMENT_SELECT + " WHERE c.house_id = ? AND a.due_date BETWEEN ? AND ?"
    params: list = [house_id, monday, sunday]
    if scope == "mine":
        sql += " AND a.user_id = ?"
        params.append(user["id"])
    rows = db.execute(sql + " ORDER BY a.due_date, a.id", params)
    return [assignment_json(r) for r in rows]


@router.post("/chores")
def create_chore(body: NewChoreIn, user: CurrentUser, house_id: HouseId, db: DB):
    if body.assignment_mode == "fixed":
        if body.fixed_user_id is None:
            raise HTTPException(422, "Pick who this chore is for")
        if not db.execute("SELECT 1 FROM users WHERE id = ? AND house_id = ?", (body.fixed_user_id, house_id)).fetchone():
            raise HTTPException(422, "That person isn't in your house")
    with db:
        cur = db.execute(
            """INSERT INTO chores (house_id, name, xp, repeats_weekly, assignment_mode, fixed_user_id)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                house_id,
                body.name.strip(),
                body.xp,
                body.repeats_weekly,
                body.assignment_mode,
                body.fixed_user_id if body.assignment_mode == "fixed" else None,
            ),
        )
        chore = db.execute("SELECT * FROM chores WHERE id = ?", (cur.lastrowid,)).fetchone()
        assign_for_this_week(db, chore)
        log_activity(db, house_id, user["id"], "CHORE_CREATED", {"chore_name": chore["name"]})
    return {"chore": chore_json(chore)}


@router.post("/assignments/{assignment_id}/complete")
def complete(assignment_id: int, house_id: HouseId, db: DB):
    # Any housemate can tick a chore off (covering for someone); the XP goes to whoever it was assigned to.
    refresh_house(db, house_id)
    row = db.execute(ASSIGNMENT_SELECT + " WHERE a.id = ? AND c.house_id = ?", (assignment_id, house_id)).fetchone()
    if row is None:
        raise HTTPException(404, "Assignment not found")
    if row["status"] != "open":
        raise HTTPException(409, "This chore was already done" if row["status"] == "done" else "This chore was missed")
    assignee_id = row["u_id"]
    with db:
        db.execute(
            "UPDATE assignments SET status = 'done', completed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?",
            (assignment_id,),
        )
        before = db.execute("SELECT xp FROM users WHERE id = ?", (assignee_id,)).fetchone()["xp"]
        after = before + row["xp"]
        db.execute("UPDATE users SET xp = ? WHERE id = ?", (after, assignee_id))
        log_activity(db, house_id, assignee_id, "CHORE_COMPLETED", {"chore_name": row["chore_name"], "xp": row["xp"]})
        if level_for(after) > level_for(before):
            log_activity(db, house_id, assignee_id, "LEVEL_UP", {"level": level_for(after)})
    updated = db.execute(ASSIGNMENT_SELECT + " WHERE a.id = ?", (assignment_id,)).fetchone()
    return {"assignment": assignment_json(updated), "xp_awarded": row["xp"], "user_total_xp": after}
