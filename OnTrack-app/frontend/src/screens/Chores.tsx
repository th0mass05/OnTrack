import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isToday, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AssignmentCard } from "../components/AssignmentCard";
import { BottomSheet } from "../components/BottomSheet";
import { useToast } from "../components/Toast";
import { Button, Empty, Input, Screen, Segmented, Skeleton } from "../components/ui";
import { createChore, getAssignments, getHousemates } from "../lib/api";
import type { Assignment, NewChore } from "../lib/types";

function group(assignments: Assignment[]) {
  const sorted = [...assignments].sort((a, b) => a.due_date.localeCompare(b.due_date));
  return [
    { title: "Today", items: sorted.filter((a) => a.status === "open" && isToday(parseISO(a.due_date))) },
    { title: "This week", items: sorted.filter((a) => a.status === "open" && !isToday(parseISO(a.due_date))) },
    { title: "Done", items: sorted.filter((a) => a.status === "done") },
  ];
}

export function Chores() {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [adding, setAdding] = useState(false);
  const { data, isPending } = useQuery({
    queryKey: ["assignments", scope],
    queryFn: () => getAssignments(scope),
  });

  return (
    <Screen title="Chores">
      <div className="mb-5">
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: "mine", label: "Mine" },
            { value: "all", label: "Everyone" },
          ]}
        />
      </div>

      {isPending ? (
        <Skeleton rows={4} />
      ) : data?.length ? (
        group(data).map(
          (section) =>
            section.items.length > 0 && (
              <section key={section.title} className="mb-6">
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">{section.title}</h2>
                <div className="space-y-2">
                  {section.items.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} showUser={scope === "all"} />
                  ))}
                </div>
              </section>
            ),
        )
      ) : (
        <Empty>No chores yet, add one.</Empty>
      )}

      <button
        aria-label="Add chore"
        onClick={() => setAdding(true)}
        className="fixed right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg active:scale-95"
      >
        <Plus size={28} />
      </button>

      <BottomSheet open={adding} onClose={() => setAdding(false)} title="Add chore">
        <AddChoreForm onDone={() => setAdding(false)} />
      </BottomSheet>
    </Screen>
  );
}

const SIZES = [
  { value: "10", label: "Small 10" },
  { value: "30", label: "Medium 30" },
  { value: "50", label: "Large 50" },
] as const;

// Four fields max (plan rule): name, XP size, repeats weekly, assignee or rotate.
function AddChoreForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: housemates = [] } = useQuery({ queryKey: ["housemates"], queryFn: getHousemates });
  const [name, setName] = useState("");
  const [xp, setXp] = useState<"10" | "30" | "50">("30");
  const [weekly, setWeekly] = useState<"yes" | "no">("yes");
  const [assignee, setAssignee] = useState("rotate");

  const create = useMutation({
    mutationFn: (chore: NewChore) => createChore(chore),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast("Chore added");
      onDone();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({
      name,
      xp: Number(xp) as NewChore["xp"],
      repeats_weekly: weekly === "yes",
      assignment_mode: assignee === "rotate" ? "rotating" : "fixed",
      fixed_user_id: assignee === "rotate" ? undefined : Number(assignee),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Chore" placeholder="Take the bins out" value={name} onChange={(e) => setName(e.target.value)} required />
      <div>
        <p className="mb-1 text-sm font-medium text-slate-600">Size</p>
        <Segmented value={xp} onChange={setXp} options={[...SIZES]} />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-slate-600">Repeats weekly</p>
        <Segmented value={weekly} onChange={setWeekly} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-600">Who does it</span>
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="min-h-12 w-full rounded-2xl bg-white px-4 text-base ring-1 ring-slate-200"
        >
          <option value="rotate">Rotate between everyone</option>
          {housemates.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" disabled={create.isPending}>
        Add chore
      </Button>
    </form>
  );
}
