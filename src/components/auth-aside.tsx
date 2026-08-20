import { Building2, FolderKanban, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Users, label: "People directory", copy: "Search, filter and manage every teammate." },
  { icon: Building2, label: "Departments", copy: "Structure your org with clarity." },
  { icon: FolderKanban, label: "Projects", copy: "See who is working on what, instantly." },
];

export function AuthAside() {
  return (
    <div className="relative hidden overflow-hidden hero-gradient p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl accent-gradient font-display text-base font-bold text-primary-foreground">
          A
        </span>
        <span className="font-display text-lg font-semibold text-primary-foreground">Atlas People</span>
      </div>

      <div className="relative max-w-md">
        <h2 className="font-display text-4xl font-semibold leading-tight text-primary-foreground">
          The calm way to run your people operations.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
          Employees, departments and projects — one refined workspace with role-based access for admins and teammates.
        </p>

        <div className="mt-10 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, label, copy }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 backdrop-blur-sm transition-colors hover:bg-primary-foreground/10"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary-foreground">{label}</p>
                <p className="text-xs text-primary-foreground/60">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-primary-foreground/50">© 2026 Atlas People. All rights reserved.</p>
    </div>
  );
}
