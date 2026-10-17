import { useQuery } from "@tanstack/react-query";
import { ActivityRow } from "../components/ActivityRow";
import { Avatar } from "../components/Avatar";
import { Card, Empty, Screen, Skeleton } from "../components/ui";
import { getActivity, getLeaderboard } from "../lib/api";

export function HouseFeed() {
  const leaderboard = useQuery({ queryKey: ["leaderboard"], queryFn: getLeaderboard });
  const activity = useQuery({ queryKey: ["activity"], queryFn: () => getActivity(30) });

  return (
    <Screen title="House">
      <Card title="This week">
        {leaderboard.isPending ? (
          <Skeleton rows={4} />
        ) : (
          <ol className="space-y-1">
            {leaderboard.data?.map((row, i) => (
              <li key={row.user.id} className="flex min-h-12 items-center gap-3">
                <span className="w-5 text-center font-bold text-slate-400">{i + 1}</span>
                <Avatar name={row.user.name} id={row.user.id} />
                <span className="flex-1 font-semibold">{row.user.name}</span>
                <span className="font-bold text-accent">{row.xp} XP</span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card title="Activity">
        {activity.isPending ? (
          <Skeleton />
        ) : activity.data?.length ? (
          <ul className="divide-y divide-slate-100">
            {activity.data.map((item, i) => (
              <ActivityRow key={i} activity={item} />
            ))}
          </ul>
        ) : (
          <Empty>Nothing has happened yet.</Empty>
        )}
      </Card>
    </Screen>
  );
}
