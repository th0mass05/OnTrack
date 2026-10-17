import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..domain import house_json, log_activity, public_user
from ..security import DB, CurrentUser, HouseId

router = APIRouter(prefix="/houses")

CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I, so codes are easy to read out


class NewHouseIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class JoinIn(BaseModel):
    code: str = Field(min_length=6, max_length=6)


@router.post("")
def create_house(body: NewHouseIn, user: CurrentUser, db: DB):
    if user["house_id"] is not None:
        raise HTTPException(409, "You're already in a house")
    with db:
        while True:
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
            if not db.execute("SELECT 1 FROM houses WHERE join_code = ?", (code,)).fetchone():
                break
        cur = db.execute("INSERT INTO houses (name, join_code) VALUES (?, ?)", (body.name.strip(), code))
        db.execute("UPDATE users SET house_id = ? WHERE id = ?", (cur.lastrowid, user["id"]))
    house = db.execute("SELECT * FROM houses WHERE id = ?", (cur.lastrowid,)).fetchone()
    return {"house": house_json(house)}


@router.post("/join")
def join_house(body: JoinIn, user: CurrentUser, db: DB):
    house = db.execute("SELECT * FROM houses WHERE join_code = ?", (body.code.strip().upper(),)).fetchone()
    if house is None:
        raise HTTPException(404, "No house has that code")
    if user["house_id"] == house["id"]:
        return {"house": house_json(house)}
    if user["house_id"] is not None:
        raise HTTPException(409, "You're already in a house")
    with db:
        db.execute("UPDATE users SET house_id = ? WHERE id = ?", (house["id"], user["id"]))
        log_activity(db, house["id"], user["id"], "MEMBER_JOINED")
    return {"house": house_json(house)}


@router.get("/members")
def members(house_id: HouseId, db: DB):
    rows = db.execute("SELECT * FROM users WHERE house_id = ? ORDER BY id", (house_id,))
    return [public_user(r) for r in rows]
