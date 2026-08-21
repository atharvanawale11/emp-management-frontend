import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, FolderKanban, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar3, ConfirmDialog, EmptyState, ListSkeleton, Pager } from "@/components/ui-bits";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { formatDate, useApp } from "@/lib/app-store";
import type { Project } from "@/lib/types";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Atlas People" },
      { name: "description", content: "Track every project, its location, start date and assigned owner." },
      { property: "og:title", content: "Projects — Atlas People" },
      { property: "og:description", content: "Track every project, its location, start date and assigned owner." },
    ],
  }),
  component: ProjectsPage,
});

const PAGE_SIZE = 9;

function ProjectsPage() {
  const { projects, employees, loading, isAdmin, deleteProject } = useApp();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
  }, [projects, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <AppShell
      title="Projects"
      description={isAdmin ? "Every engagement and who owns it." : "Browse ongoing engagements."}
      actions={
        isAdmin ? (
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-xl accent-gradient text-primary-foreground hover:opacity-95"
          >
            <Plus className="mr-2 size-4" /> Add project
          </Button>
        ) : null
      }
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search projects by name or location…"
          className="h-11 rounded-xl pl-9"
        />
      </div>

      {loading ? (
        <div className="surface">
          <ListSkeleton rows={5} />
        </div>
      ) : rows.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<FolderKanban className="size-7" />}
            title={projects.length === 0 ? "No projects yet" : "No matching projects"}
            description={
              projects.length === 0
                ? "Create your first project and assign it to a teammate."
                : "Try a different search term."
            }
            action={
              projects.length === 0 && isAdmin ? (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setOpen(true);
                  }}
                  className="rounded-xl accent-gradient text-primary-foreground"
                >
                  <Plus className="mr-2 size-4" /> Add your first project
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => {
              const owner = employees.find((e) => e.id === p.employeeId);
              return (
                <article key={p.id} className="surface lift min-w-0 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <FolderKanban className="size-[18px]" />
                      </span>
                      <h3 className="mt-4 truncate text-base font-semibold">{p.name}</h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {p.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" /> {formatDate(p.startDate)}
                        </span>
                      </p>
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(p);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setToDelete(p)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="mt-5 border-t border-border/70 pt-4">
                    {owner ? (
                      <Link
                        to="/employees/$employeeId"
                        params={{ employeeId: owner.id }}
                        className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
                      >
                        <Avatar3 name={owner.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{owner.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{owner.designation}</span>
                        </span>
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="surface mt-4">
            <Pager page={current} pageCount={pageCount} onPage={setPage} total={filtered.length} />
          </div>
        </>
      )}

      <ProjectFormDialog open={open} onOpenChange={setOpen} project={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete ${toDelete?.name ?? ""}?`}
        description="This project will be permanently removed. This action cannot be undone."
        onConfirm={() => {
          if (toDelete) {
            deleteProject(toDelete.id);
            toast.success("Project deleted");
            setToDelete(null);
          }
        }}
      />
    </AppShell>
  );
}
