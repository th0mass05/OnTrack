import type { ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-3 pb-safe shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
        <h2 className="mb-4 text-lg font-bold">{title}</h2>
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}
