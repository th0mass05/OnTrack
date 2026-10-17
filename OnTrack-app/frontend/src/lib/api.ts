// One function per endpoint in the contract.
// With no VITE_API_URL set, every call is answered by the mock backend in mock.ts.
// Set VITE_API_URL=http://localhost:8000 in a .env.local file to use the real API.
import { getToken } from "./auth";
import { db, delay, users } from "./mock";
import type {
  Activity,
  Assignment,
  AuthResponse,
  Chore,
  CompleteResponse,
  HomeResponse,
  House,
  LeaderboardRow,
  MeResponse,
  NewChore,
  User,
} from "./types";
import { levelFor } from "./types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCKS = !API_URL;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json() as Promise<T>;
}

const post = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

const weekEnd = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

// ---- Auth ----

export function register(body: { name: string; email: string; password: string }) {
  if (!USE_MOCKS) return post<AuthResponse>("/auth/register", body);
  db.me = { ...users[0], name: body.name, email: body.email };
  db.house = null;
  return delay<AuthResponse>({ token: "mock-token", user: db.me });
}

export function login(body: { email: string; password: string }) {
  if (!USE_MOCKS) return post<AuthResponse>("/auth/login", body);
  return delay<AuthResponse>({ token: "mock-token", user: db.me });
}

export function getMe() {
  if (!USE_MOCKS) return request<MeResponse>("/me");
  return delay<MeResponse>({ user: { ...db.me, xp: db.xp[db.me.id] ?? 0 }, house: db.house });
}

// ---- Houses ----

export function createHouse(body: { name: string }) {
  if (!USE_MOCKS) return post<{ house: House }>("/houses", body);
  db.house = { id: 1, name: body.name, join_code: "K7Q2XD" };
  return delay({ house: db.house });
}

export function joinHouse(body: { code: string }) {
  if (!USE_MOCKS) return post<{ house: House }>("/houses/join", body);
  db.house = { id: 1, name: "22 Chamberlain Rd", join_code: body.code.toUpperCase() };
  return delay({ house: db.house });
}

// ---- Home ----

export function getHome() {
  if (!USE_MOCKS) return request<HomeResponse>("/home");
  const week = db.assignments.filter((a) => a.due_date <= weekEnd());
  const done = week.filter((a) => a.status === "done").length;
  return delay<HomeResponse>({
    user: { ...db.me, xp: db.xp[db.me.id] ?? 0 },
    my_due: db.assignments.filter((a) => a.user.id === db.me.id && a.status === "open"),
    week_completion_pct: week.length ? Math.round((done / week.length) * 100) : 0,
    recent_activity: db.activity.slice(0, 3),
  });
}

// ---- Chores & assignments ----

export function getAssignments(scope: "mine" | "all") {
  if (!USE_MOCKS) return request<Assignment[]>(`/assignments?scope=${scope}&week=current`);
  return delay(
    scope === "mine" ? db.assignments.filter((a) => a.user.id === db.me.id) : db.assignments,
  );
}

export function createChore(body: NewChore) {
  if (!USE_MOCKS) return post<{ chore: Chore }>("/chores", body);
  const id = db.nextId++;
  const user = users.find((u) => u.id === body.fixed_user_id) ?? db.me;
  db.assignments.push({ id, chore_name: body.name, xp: body.xp, user, due_date: weekEnd(), status: "open" });
  db.activity.unshift({
    type: "CHORE_CREATED",
    user: db.me,
    metadata: { chore_name: body.name },
    created_at: new Date().toISOString(),
  });
  return delay({ chore: { ...body, id, house_id: 1, active: true } satisfies Chore });
}

export function completeAssignment(id: number) {
  if (!USE_MOCKS) return post<CompleteResponse>(`/assignments/${id}/complete`);
  const a = db.assignments.find((x) => x.id === id);
  if (!a) return Promise.reject(new Error("Assignment not found"));
  const before = db.xp[a.user.id] ?? 0;
  const after = before + a.xp;
  a.status = "done";
  db.xp[a.user.id] = after;
  db.weekXp[a.user.id] = (db.weekXp[a.user.id] ?? 0) + a.xp;
  const now = new Date().toISOString();
  db.activity.unshift({ type: "CHORE_COMPLETED", user: a.user, metadata: { chore_name: a.chore_name, xp: a.xp }, created_at: now });
  if (levelFor(after) > levelFor(before)) {
    db.activity.unshift({ type: "LEVEL_UP", user: a.user, metadata: { level: levelFor(after) }, created_at: now });
  }
  return delay<CompleteResponse>({ assignment: a, xp_awarded: a.xp, user_total_xp: after });
}

// ---- House ----

export function getLeaderboard() {
  if (!USE_MOCKS) return request<LeaderboardRow[]>("/leaderboard?period=week");
  return delay<LeaderboardRow[]>(
    users.map((user) => ({ user, xp: db.weekXp[user.id] ?? 0 })).sort((a, b) => b.xp - a.xp),
  );
}

export function getActivity(limit = 30) {
  if (!USE_MOCKS) return request<Activity[]>(`/activity?limit=${limit}`);
  return delay(db.activity.slice(0, limit));
}

// Not in the contract yet: the add-chore sheet needs the house's members for the assignee picker.
// The backend could add GET /houses/members, or include members in GET /me.
export function getHousemates(): Promise<User[]> {
  return delay(users);
}
