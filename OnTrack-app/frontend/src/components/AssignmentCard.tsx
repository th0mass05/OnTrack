import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Check } from "lucide-react";
import { useCompleteAssignment } from "../lib/useCompleteAssignment";
import type { Assignment } from "../lib/types";

export function dueLabel(dueDate: string) {
  const date = parseISO(dueDate);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE d MMM");
}

export function AssignmentCard({ assignment, showUser = false }: { assignment: Assignment; showUser?: boolean }) {
  const complete = useCompleteAssignment();
  const done = assignment.status === "done";

  return (
    <button
      type="button"
      disabled={done}
      onClick={() => complete.mutate(assignment)}
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 active:scale-[0.99] disabled:opacity-60"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
          done ? "border-accent bg-accent text-white" : "border-slate-300"
        }`}
      >
        {done && <Check size={20} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-semibold ${done ? "line-through" : ""}`}>
          {assignment.chore_name}
        </span>
        <span className="block text-sm text-slate-500">
          {showUser && `${assignment.user.name} · `}
          {dueLabel(assignment.due_date)}
        </span>
      </span>
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
        +{assignment.xp} XP
      </span>
    </button>
  );
}
