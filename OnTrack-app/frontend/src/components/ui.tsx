// Small shared building blocks so every screen looks the same.
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="px-4 pt-safe">
      <header className="mb-5 pt-2">
        {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>
      {children}
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      {title && <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>}
      {children}
    </section>
  );
}

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const styles =
    variant === "primary"
      ? "bg-accent text-white active:brightness-95"
      : "bg-white text-slate-900 ring-1 ring-slate-200 active:bg-slate-50";
  return (
    <button
      className={`min-h-12 w-full rounded-2xl px-4 font-semibold disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {/* text-base (16px) stops iOS zooming in when the field is focused */}
      <input
        className="min-h-12 w-full rounded-2xl bg-white px-4 text-base ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-accent"
        {...props}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-2xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`min-h-11 flex-1 rounded-xl text-sm font-semibold ${
            value === option.value ? "bg-white shadow-sm" : "text-slate-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate-500">{children}</p>;
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200/70" />
      ))}
    </div>
  );
}
