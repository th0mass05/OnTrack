import { formatDistanceToNow, parseISO } from "date-fns";
import type { Activity } from "../lib/types";
import { Avatar } from "./Avatar";

// New activity types (photos, polls, Wrapped...) only need a line here.
function describe(activity: Activity) {
  const m = activity.metadata;
  switch (activity.type) {
    case "CHORE_COMPLETED":
      return `completed ${m.chore_name}`;
    case "CHORE_CREATED":
      return `added ${m.chore_name}`;
    case "MEMBER_JOINED":
      return "joined the house";
    case "LEVEL_UP":
      return `reached level ${m.level}`;
  }
}

export function ActivityRow({ activity }: { activity: Activity }) {
  const xp = activity.type === "CHORE_COMPLETED" ? Number(activity.metadata.xp) : null;
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar name={activity.user.name} id={activity.user.id} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{activity.user.name}</span> {describe(activity)}
        </p>
        <p className="text-xs text-slate-500">
          {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
        </p>
      </div>
      {xp ? <span className="text-xs font-bold text-accent">+{xp} XP</span> : null}
    </li>
  );
}
