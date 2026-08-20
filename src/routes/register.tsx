import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-store";
import { AuthAside } from "@/components/auth-aside";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Atlas People" },
      { name: "description", content: "Create an Atlas People account as an admin or employee." },
      { property: "og:title", content: "Create account — Atlas People" },
      { property: "og:description", content: "Register for the Atlas People employee management workspace." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await register(username, password, role);
      toast.success(`Account created — welcome, ${u.username}`);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <AuthAside />
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl accent-gradient font-display text-sm font-bold text-primary-foreground">
              A
            </span>
            <span className="font-display text-base font-semibold">Atlas People</span>
          </div>
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick a role to preview the matching experience.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="r-username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="r-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jordan.reeves"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="r-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
                {(["ADMIN", "EMPLOYEE"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      role === r
                        ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r === "ADMIN" ? "Admin" : "Employee"}
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl accent-gradient text-primary-foreground transition-all hover:opacity-95 hover:shadow-[var(--shadow-glow)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create account <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
