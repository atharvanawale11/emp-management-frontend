import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Building2, FolderKanban, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar3, DeptBadge, ListSkeleton, StatSkeleton } from "@/components/ui-bits";
import { formatDate, useApp } from "@/lib/app-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas People" },
      { name: "description", content: "Headcount, department and project overview at a glance." },
      { property: "og:title", content: "Dashboard — Atlas People" },
      { property: "og:description", content: "Headcount, department and project overview at a glance." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Users;
  accent?: boolean;
}) {
  return (
    <div className="surface lift relative overflow-hidden p-5">
      {accent && (
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/15 blur-2xl" />
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="size-3.5 text-success" /> {hint}
      </p>
    </div>
  );
}

function DashboardPage() {
  const { employees, departments, projects, loading } = useApp();

  const chartData = departments.map((d) => ({
    name: d.name,
    employees: employees.filter((e) => e.departmentId === d.id).length,
  }));

  const recent = [...employees]
    .sort((a, b) => new Date(b.dateOfJoining).getTime() - new Date(a.dateOfJoining).getTime())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard" description="A quiet overview of your organisation today.">
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Employees" value={employees.length} hint="Across all departments" icon={Users} accent />
          <StatCard label="Total Departments" value={departments.length} hint="Org structure" icon={Building2} />
          <StatCard label="Total Projects" value={projects.length} hint="Active engagements" icon={FolderKanban} />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface min-w-0 p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">Employees per department</h2>
              <p className="text-xs text-muted-foreground">Distribution of headcount</p>
            </div>
            <Link
              to="/departments"
              className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 h-[260px] w-full">
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-muted" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                    interval={0}
                    tickFormatter={(v: string) => (v.length > 8 ? `${v.slice(0, 7)}…` : v)}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="employees" fill="var(--chart-1)" radius={[8, 8, 4, 4]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="surface min-w-0 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 pb-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">Recently added</h2>
              <p className="text-xs text-muted-foreground">Latest joiners</p>
            </div>
            <Link to="/employees" className="shrink-0 text-xs font-medium text-primary hover:underline">
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : (
            <ul className="divide-y divide-border/70">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/employees/$employeeId"
                    params={{ employeeId: e.id }}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60"
                  >
                    <Avatar3 name={e.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.designation}</p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <DeptBadge name={departments.find((d) => d.id === e.departmentId)?.name} />
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(e.dateOfJoining)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
