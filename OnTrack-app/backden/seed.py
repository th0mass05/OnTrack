"""Fill an empty database with the same demo house the frontend mocks use.

Run from backden/:  python seed.py
Log in as tom@example.com (or jack/ben/ed) with password "password".
"""
from app.db import connect, init_db
from app.domain import assign_for_this_week, log_activity
from app.security import hash_password

init_db()
db = connect()
if db.execute("SELECT 1 FROM users").fetchone():
    raise SystemExit("Database already has data; delete ontrack.db to reseed.")

with db:
    house_id = db.execute("INSERT INTO houses (name, join_code) VALUES ('22 Chamberlain Rd', 'K7Q2XD')").lastrowid
    password = hash_password("password")
    ids = {}
    for name, xp in [("Tom", 360), ("Jack", 380), ("Ben", 330), ("Ed", 295)]:
        ids[name] = db.execute(
            "INSERT INTO users (name, email, password_hash, house_id, xp) VALUES (?, ?, ?, ?, ?)",
            (name, f"{name.lower()}@example.com", password, house_id, xp),
        ).lastrowid
        log_activity(db, house_id, ids[name], "MEMBER_JOINED")

    for name, xp, mode, owner in [
        ("Clean the kitchen", 30, "fixed", "Tom"),
        ("Take the bins out", 10, "fixed", "Tom"),
        ("Clean the bathroom", 50, "fixed", "Ben"),
        ("Vacuum downstairs", 30, "rotating", None),
        ("Recycling", 10, "fixed", "Jack"),
        ("Wipe the hob", 10, "rotating", None),
    ]:
        chore_id = db.execute(
            "INSERT INTO chores (house_id, name, xp, repeats_weekly, assignment_mode, fixed_user_id) VALUES (?, ?, ?, 1, ?, ?)",
            (house_id, name, xp, mode, ids.get(owner)),
        ).lastrowid
        assign_for_this_week(db, db.execute("SELECT * FROM chores WHERE id = ?", (chore_id,)).fetchone())
        log_activity(db, house_id, ids[owner or "Jack"], "CHORE_CREATED", {"chore_name": name})

print("Seeded '22 Chamberlain Rd' (join code K7Q2XD) with Tom, Jack, Ben and Ed.")
