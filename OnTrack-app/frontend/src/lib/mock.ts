// In-memory fake backend so the frontend can be built before the API exists.
// Data resets on page reload. Shapes match lib/types.ts.
import type { Activity, Assignment, House, User } from "./types";

const today = new Date();
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const ago = (minutes: number) =>
  new Date(today.getTime() - minutes * 60_000).toISOString();

export const users: User[] = [
  { id: 1, name: "Tom", email: "tom@example.com" },
  { id: 2, name: "Jack", email: "jack@example.com" },
  { id: 3, name: "Ben", email: "ben@example.com" },
  { id: 4, name: "Ed", email: "ed@example.com" },
];

export const db = {
  me: users[0],
  house: { id: 1, name: "22 Chamberlain Rd", join_code: "K7Q2XD" } as House | null,
  xp: { 1: 425, 2: 380, 3: 330, 4: 295 } as Record<number, number>,
  weekXp: { 1: 70, 2: 60, 3: 40, 4: 20 } as Record<number, number>,
  nextId: 100,
  assignments: [
    { id: 1, chore_name: "Clean the kitchen", xp: 30, user: users[0], due_date: day(0), status: "open" },
    { id: 2, chore_name: "Take the bins out", xp: 10, user: users[0], due_date: day(2), status: "open" },
    { id: 3, chore_name: "Clean the bathroom", xp: 50, user: users[2], due_date: day(1), status: "open" },
    { id: 4, chore_name: "Vacuum downstairs", xp: 30, user: users[3], due_date: day(-1), status: "done" },
    { id: 5, chore_name: "Recycling", xp: 10, user: users[1], due_date: day(3), status: "open" },
    { id: 6, chore_name: "Wipe the hob", xp: 10, user: users[0], due_date: day(-2), status: "done" },
  ] as Assignment[],
  activity: [
    { type: "CHORE_COMPLETED", user: users[0], metadata: { chore_name: "Wipe the hob", xp: 10 }, created_at: ago(20) },
    { type: "CHORE_CREATED", user: users[1], metadata: { chore_name: "Recycling" }, created_at: ago(60) },
    { type: "LEVEL_UP", user: users[2], metadata: { level: 3 }, created_at: ago(60 * 20) },
    { type: "CHORE_COMPLETED", user: users[3], metadata: { chore_name: "Vacuum downstairs", xp: 30 }, created_at: ago(60 * 26) },
    { type: "MEMBER_JOINED", user: users[3], metadata: {}, created_at: ago(60 * 24 * 3) },
  ] as Activity[],
};

export const delay = <T,>(value: T, ms = 300) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
