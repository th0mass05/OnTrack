const COLOURS = ["bg-rose-200", "bg-amber-200", "bg-sky-200", "bg-violet-200", "bg-lime-200"];

export function Avatar({ name, id, size = "md" }: { name: string; id: number; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dims = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${dims} ${COLOURS[id % COLOURS.length]} flex shrink-0 items-center justify-center rounded-full font-semibold text-slate-800`}
    >
      {initials}
    </div>
  );
}
