import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-store";
import { Avatar3, RoleBadge } from "@/components/ui-bits";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
] as const;

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl accent-gradient font-display text-sm font-bold text-primary-foreground">
        A
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-semibold">Atlas People</span>
          <span className="block truncate text-[11px] text-muted-foreground">Employee management</span>
        </span>
      )}
    </div>
  );
}

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={label}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              collapsed && "justify-center px-0",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0 transition-colors", active && "text-primary")} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed, onLogout }: { collapsed?: boolean; onLogout: () => void }) {
  const { user } = useApp();
  if (!user) return null;
  return (
    <div className="mt-auto space-y-3 pt-4">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-2.5",
          collapsed && "justify-center bg-transparent p-0",
        )}
      >
        <Avatar3 name={user.username} size="sm" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.username}</p>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={onLogout}
        className={cn(
          "w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          collapsed && "justify-center px-0",
        )}
      >
        <LogOut className="size-[18px] shrink-0" />
        {!collapsed && "Logout"}
      </Button>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, loading, logout } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar p-4 transition-[width] duration-300 lg:flex",
          collapsed ? "w-[84px]" : "w-[264px]",
        )}
      >
        <div className="flex items-center justify-between">
          <Brand collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            className={cn("size-8 shrink-0 rounded-lg text-muted-foreground", collapsed && "hidden")}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mt-3 self-center rounded-lg text-muted-foreground"
            aria-label="Expand sidebar"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <div className="mt-7 flex-1 overflow-y-auto">
          <NavLinks collapsed={collapsed} />
        </div>
        <SidebarFooter collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[84px]" : "lg:pl-[264px]")}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 rounded-xl lg:hidden" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-[280px] flex-col bg-sidebar p-4">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <Brand />
                  <div className="mt-7 flex-1">
                    <NavLinks onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <SidebarFooter onLogout={handleLogout} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-semibold sm:text-lg">{title}</h2>
                {description && <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search…" className="h-9 w-56 rounded-xl pl-9" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar3 name={user.username} size="sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="truncate">{user.username}</span>
                    <RoleBadge role={user.role} />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {(actions || description) && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: false }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
