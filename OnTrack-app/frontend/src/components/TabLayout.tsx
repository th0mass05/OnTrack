import { House, ListChecks, Trophy, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/chores", label: "Chores", icon: ListChecks },
  { to: "/house", label: "House", icon: Trophy },
  { to: "/me", label: "Me", icon: UserRound },
];

export function TabLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      {/* Bottom padding keeps content clear of the tab bar */}
      <main className="pb-28">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur">
        <ul className="mx-auto flex max-w-md">
          {TABS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                    isActive ? "text-accent" : "text-slate-400"
                  }`
                }
              >
                <Icon size={22} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
