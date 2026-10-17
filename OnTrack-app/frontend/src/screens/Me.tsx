import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { useToast } from "../components/Toast";
import { Button, Card, Screen } from "../components/ui";
import { getMe } from "../lib/api";
import { clearToken } from "../lib/auth";
import { levelFor } from "../lib/types";

export function Me() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data } = useQuery({ queryKey: ["me"], queryFn: getMe });

  if (!data) return null;
  const { user, house } = data;
  const level = levelFor(user.xp);
  const progress = user.xp % 100;

  const share = async () => {
    if (!house) return;
    const text = `Join ${house.name} on Common with code ${house.join_code}`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    }
  };

  const logOut = () => {
    clearToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Screen title="Me">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={user.name} id={user.id} />
          <div>
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-sm text-slate-500">{user.xp} XP total</p>
          </div>
        </div>
        <div className="mb-1 flex justify-between text-sm font-medium">
          <span>Level {level}</span>
          <span className="text-slate-500">{100 - progress} XP to level {level + 1}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      {house && (
        <Card title={house.name}>
          <p className="mb-1 text-sm text-slate-500">Join code</p>
          <p className="mb-4 font-mono text-3xl font-bold tracking-[0.3em]">{house.join_code}</p>
          <Button onClick={share} className="flex items-center justify-center gap-2">
            <Share2 size={18} /> Share code
          </Button>
        </Card>
      )}

      <Button variant="secondary" onClick={logOut}>
        Log out
      </Button>
    </Screen>
  );
}
