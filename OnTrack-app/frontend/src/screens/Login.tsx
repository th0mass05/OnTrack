import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Segmented } from "../components/ui";
import { login, register } from "../lib/api";
import { setToken } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = useMutation({
    mutationFn: () => (mode === "login" ? login({ email, password }) : register({ name, email, password })),
    onSuccess: ({ token }) => {
      setToken(token);
      navigate("/", { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    auth.mutate();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-safe pb-safe">
      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white">
          C
        </div>
        <h1 className="text-3xl font-bold">Common</h1>
        <p className="text-slate-500">Run your house together.</p>
      </div>

      {/* Form sits in the bottom half so it's reachable with a thumb */}
      <form onSubmit={submit} className="pb-6">
        <div className="mb-4">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "login", label: "Log in" },
              { value: "register", label: "Sign up" },
            ]}
          />
        </div>
        {mode === "register" && (
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required />
        )}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
        {auth.error && <p className="mb-3 text-sm text-rose-600">{auth.error.message}</p>}
        <Button type="submit" disabled={auth.isPending}>
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
