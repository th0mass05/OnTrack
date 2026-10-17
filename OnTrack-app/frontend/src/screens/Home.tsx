import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ActivityRow } from "../components/ActivityRow";
import { AssignmentCard } from "../components/AssignmentCard";
import { Card, Empty, Screen, Skeleton } from "../components/ui";
import { getHome } from "../lib/api";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Home() {
  const { data, isPending } = useQuery({ queryKey: ["home"], queryFn: getHome });

  return (
    <Screen subtitle={format(new Date(), "EEEE d MMMM")} title={data ? `${greeting()}, ${data.user.name}` : greeting()}>
      <section className="mb-4 rounded-3xl bg-accent p-5 text-white">
        <p className="text-sm font-medium opacity-80">House this week</p>
        <p className="mb-3 text-4xl font-bold">{data?.week_completion_pct ?? 0}%</p>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${data?.week_completion_pct ?? 0}%` }}
          />
        </div>
      </section>

      <h2 className="mb-2 text-lg font-bold">Your chores</h2>
      <div className="mb-6 space-y-2">
        {isPending ? (
          <Skeleton />
        ) : data?.my_due.length ? (
          data.my_due.map((a) => <AssignmentCard key={a.id} assignment={a} />)
        ) : (
          <Empty>Nothing due. Nice one.</Empty>
        )}
      </div>

      <Card title="Latest">
        {data?.recent_activity.length ? (
          <ul className="divide-y divide-slate-100">
            {data.recent_activity.map((item, i) => (
              <ActivityRow key={i} activity={item} />
            ))}
          </ul>
        ) : (
          !isPending && <Empty>No activity yet.</Empty>
        )}
      </Card>
    </Screen>
  );
}
