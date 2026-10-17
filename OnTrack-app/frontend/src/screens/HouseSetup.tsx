import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Segmented } from "../components/ui";
import { createHouse, joinHouse } from "../lib/api";

export function HouseSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const setup = useMutation({
    mutationFn: () => (mode === "create" ? createHouse({ name }) : joinHouse({ code })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/", { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setup.mutate();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-safe pb-safe">
      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-3xl font-bold">Find your house</h1>
        <p className="text-slate-500">Join with the code a housemate shared, or start a new house.</p>
      </div>

      <form onSubmit={submit} className="pb-6">
        <div className="mb-4">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "join", label: "Join with code" },
              { value: "create", label: "Create a house" },
            ]}
          />
        </div>
        {mode === "join" ? (
          <Input
            label="6-character code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            autoCapitalize="characters"
            autoComplete="off"
            className="min-h-12 w-full rounded-2xl bg-white px-4 text-center font-mono text-2xl tracking-[0.4em] ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-accent"
            required
            minLength={6}
          />
        ) : (
          <Input label="House name" placeholder="22 Chamberlain Rd" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        {setup.error && <p className="mb-3 text-sm text-rose-600">{setup.error.message}</p>}
        <Button type="submit" disabled={setup.isPending}>
          {mode === "join" ? "Join house" : "Create house"}
        </Button>
      </form>
    </div>
  );
}
