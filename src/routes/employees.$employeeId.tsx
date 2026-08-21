import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, FolderKanban, Mail, MapPin, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { isAxiosError } from "axios";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Avatar3, ConfirmDialog, DeptBadge, EmptyState, ListSkeleton } from "@/components/ui-bits";
import { EmployeeFormSheet } from "@/components/employee-form-sheet";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { formatCurrency, formatDate, useApp } from "@/lib/app-store";
import type { Project } from "@/lib/types";

export const Route = createFileRoute("/employees/$employeeId")({
  head: () => ({
    meta: [
      { title: "Employee profile — Atlas People" },
      { name: "description", content: "Profile details, department and assigned projects for this teammate." },
      { property: "og:title", content: "Employee profile — Atlas People" },
      { property: "og:description", content: "Profile details, department and assigned projects for this teammate." },
    ],
  }),
  component: EmployeeDetailPage,
});

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.message) return data.message as string;
    if (typeof data === "object" && data) {
      const firstFieldError = Object.values(data)[0];
      if (typeof firstFieldError === "string") return firstFieldError;
    }
  }
  return "Something went wrong. Please try again.";
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/60 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function EmployeeDetailPage() {
  const { employeeId } = Route.useParams();
  const navigate = useNavigate();
  const { employees, departments, projects, loading, isAdmin, deleteProject } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const employee = employees.find((e) => e.id === employeeId);
  const assigned = projects.filter((p) => p.employeeId === employeeId);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProject(toDelete.id);
      toast.success("Project deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Employee">
        <div className="surface">
          <ListSkeleton rows={5} />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell title="Employee">
        <div className="surface">
          <EmptyState
            icon={<FolderKanban className="size-7" />}
            title="Employee not found"
            description="This profile may have been removed from the directory."
            action={
              <Button onClick={() => navigate({ to: "/employees" })} className="rounded-xl accent-gradient text-primary-foreground">
                Back to employees
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const department = departments.find((d) => d.id === employee.departmentId);

  return (
    <AppShell title={employee.name} description={employee.designation}>
      <Link
        to="/employees"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All employees
      </Link>

      <section className="surface relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <Avatar3 name={employee.name} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold">{employee.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{employee.designation}</p>
            <div className="mt-3">
              <DeptBadge name={department?.name} />
            </div>
          </div>
          {isAdmin && (
            <Button variant="outline" className="rounded-xl" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 size-4" /> Edit profile
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile icon={Mail} label="Email" value={employee.email} />
          <InfoTile icon={Wallet} label="Salary" value={formatCurrency(employee.salary)} />
          <InfoTile icon={CalendarDays} label="Joined" value={formatDate(employee.dateOfJoining)} />
          <InfoTile icon={FolderKanban} label="Projects" value={`${assigned.length} assigned`} />
        </div>
      </section>

      <section className="surface mt-6 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">Projects</h2>
            <p className="text-xs text-muted-foreground">Engagements this teammate is on</p>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="shrink-0 rounded-xl accent-gradient text-primary-foreground"
              onClick={() => {
                setEditingProject(null);
                setProjectOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" /> Add project
            </Button>
          )}
        </div>

        {assigned.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-7" />}
            title="No projects assigned"
            description="Assign this teammate to a project and it will show up here."
          />
        ) : (
          <ul className="divide-y divide-border/70 border-t border-border/70">
            {assigned.map((p) => (
              <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {p.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {formatDate(p.startDate)}
                    </span>
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg"
                      aria-label="Edit project"
                      onClick={() => {
                        setEditingProject(p);
                        setProjectOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete project"
                      onClick={() => setToDelete(p)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <EmployeeFormSheet open={editOpen} onOpenChange={setEditOpen} employee={employee} />
      <ProjectFormDialog
        open={projectOpen}
        onOpenChange={setProjectOpen}
        project={editingProject}
        defaultEmployeeId={employee.id}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete ${toDelete?.name ?? ""}?`}
        description="This project will be permanently removed. This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}