from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..domain import house_json, public_user
from ..security import DB, CurrentUser, hash_password, new_session, verify_password

router = APIRouter()


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=6)


class LoginIn(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
def register(body: RegisterIn, db: DB):
    with db:
        if db.execute("SELECT 1 FROM users WHERE email = ?", (body.email,)).fetchone():
            raise HTTPException(409, "That email is already registered")
        cur = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (body.name.strip(), body.email.strip().lower(), hash_password(body.password)),
        )
        token = new_session(db, cur.lastrowid)
    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return {"token": token, "user": public_user(user)}


@router.post("/auth/login")
def login(body: LoginIn, db: DB):
    user = db.execute("SELECT * FROM users WHERE email = ?", (body.email.strip(),)).fetchone()
    if user is None or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Wrong email or password")
    with db:
        token = new_session(db, user["id"])
    return {"token": token, "user": public_user(user)}


@router.get("/me")
def me(user: CurrentUser, db: DB):
    house = db.execute("SELECT * FROM houses WHERE id = ?", (user["house_id"],)).fetchone()
    return {"user": {**public_user(user), "xp": user["xp"]}, "house": house_json(house)}
