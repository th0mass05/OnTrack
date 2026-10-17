// Shapes from the API contract in the plan. Keep in sync with API.md.

export type User = {
  id: number;
  name: string;
  email: string;
};

export type House = {
  id: number;
  name: string;
  join_code: string;
};

export type AuthResponse = { token: string; user: User };
export type MeResponse = { user: User & { xp: number }; house: House | null };

export type AssignmentStatus = "open" | "done" | "missed";

export type Assignment = {
  id: number;
  chore_name: string;
  xp: number;
  user: User;
  due_date: string; // ISO date, e.g. "2026-10-17"
  status: AssignmentStatus;
};

export type ActivityType =
  | "CHORE_CREATED"
  | "CHORE_COMPLETED"
  | "MEMBER_JOINED"
  | "LEVEL_UP";

export type Activity = {
  type: ActivityType;
  user: User;
  metadata: Record<string, unknown>;
  created_at: string; // ISO datetime
};

export type HomeResponse = {
  user: User & { xp: number };
  my_due: Assignment[];
  week_completion_pct: number;
  recent_activity: Activity[];
};

export type LeaderboardRow = { user: User; xp: number };

export type CompleteResponse = {
  assignment: Assignment;
  xp_awarded: number;
  user_total_xp: number;
};

export type NewChore = {
  name: string;
  xp: 10 | 30 | 50;
  repeats_weekly: boolean;
  assignment_mode: "fixed" | "rotating";
  fixed_user_id?: number;
};

export type Chore = NewChore & { id: number; house_id: number; active: boolean };

export const levelFor = (xp: number) => Math.floor(xp / 100);
