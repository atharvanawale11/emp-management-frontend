import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-store";
import { AuthAside } from "@/components/auth-aside";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Atlas People" },
      { name: "description", content: "Sign in to Atlas People to manage employees, departments and projects." },
      { property: "og:title", content: "Sign in — Atlas People" },
      { property: "og:description", content: "Sign in to the Atlas People employee management workspace." },
    ],
  }),
  component: LoginPage,
});

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response?.status === 401) return "Invalid username or password";
    const data = err.response?.data;
    if (data?.message) return data.message as string;
  }
  return "Login failed. Please try again.";
}

function LoginPage() {
  const { login, user, loading } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Username and password are required");
      return;
    }
    setSubmitting(true);
    try {
      const u = await login(username.trim(), password);
      toast.success(`Welcome back, ${u.username}`);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
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
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> Welcome back
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Sign in to Atlas</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your account to continue.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.username"
                  className="h-11 rounded-xl pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl accent-gradient text-primary-foreground transition-all hover:opacity-95 hover:shadow-[var(--shadow-glow)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Secured with JWT authentication
          </p>
        </div>
      </div>
    </div>
  );
}