import hashlib
import hmac
import secrets
import sqlite3
from typing import Annotated

from fastapi import Depends, Header, HTTPException

from .db import get_db

ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    _, iterations, salt, expected = stored.split("$")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(iterations))
    return hmac.compare_digest(digest.hex(), expected)


def new_session(db: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    db.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    return token


DB = Annotated[sqlite3.Connection, Depends(get_db)]


def current_user(db: DB, authorization: Annotated[str | None, Header()] = None) -> sqlite3.Row:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please log in")
    user = db.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?",
        (authorization.removeprefix("Bearer "),),
    ).fetchone()
    if user is None:
        raise HTTPException(401, "Your session has expired, please log in again")
    return user


CurrentUser = Annotated[sqlite3.Row, Depends(current_user)]


def current_house_id(user: CurrentUser) -> int:
    if user["house_id"] is None:
        raise HTTPException(409, "Create or join a house first")
    return user["house_id"]


HouseId = Annotated[int, Depends(current_house_id)]
