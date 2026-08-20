import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog, EmptyState, ListSkeleton } from "@/components/ui-bits";
import { useApp } from "@/lib/app-store";
import type { Department } from "@/lib/types";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Atlas People" },
      { name: "description", content: "Create, edit and organise the departments in your company." },
      { property: "og:title", content: "Departments — Atlas People" },
      { property: "og:description", content: "Create, edit and organise the departments in your company." },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { departments, employees, loading, isAdmin, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toDelete, setToDelete] = useState<Department | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setOpen(true);
  }

  function openEdit(d: Department) {
    setEditing(d);
    setName(d.name);
    setDescription(d.description);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Department name is required");
    if (editing) {
      updateDepartment({ ...editing, name: name.trim(), description: description.trim() });
      toast.success("Department updated successfully");
    } else {
      addDepartment({ name: name.trim(), description: description.trim() });
      toast.success("Department added successfully");
    }
    setOpen(false);
  }

  return (
    <AppShell
      title="Departments"
      description={isAdmin ? "Structure your organisation." : "Read-only view of your organisation structure."}
      actions={
        isAdmin ? (
          <Button onClick={openCreate} className="rounded-xl accent-gradient text-primary-foreground hover:opacity-95">
            <Plus className="mr-2 size-4" /> Add department
          </Button>
        ) : null
      }
    >
      {loading ? (
        <div className="surface">
          <ListSkeleton rows={4} />
        </div>
      ) : departments.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<Building2 className="size-7" />}
            title="No departments yet"
            description="Departments group your people and make reporting effortless."
            action={
              isAdmin ? (
                <Button onClick={openCreate} className="rounded-xl accent-gradient text-primary-foreground">
                  <Plus className="mr-2 size-4" /> Add your first department
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => {
            const count = employees.filter((e) => e.departmentId === d.id).length;
            return (
              <article key={d.id} className="surface lift group relative min-w-0 p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="size-[18px]" />
                    </span>
                    <h3 className="mt-4 truncate text-base font-semibold">{d.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description || "No description"}</p>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg" aria-label="Actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(d)}>
                          <Pencil className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setToDelete(d)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span className="font-medium text-foreground">{count}</span> employees
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit department" : "Add department"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the details of this department." : "Create a new department for your organisation."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="d-name">Name</Label>
              <Input
                id="d-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Engineering"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this team own?"
                className="min-h-24 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl accent-gradient text-primary-foreground">
                {editing ? "Save changes" : "Add department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete ${toDelete?.name ?? ""}?`}
        description="This department will be removed and its employees will become unassigned. This action cannot be undone."
        onConfirm={() => {
          if (toDelete) {
            deleteDepartment(toDelete.id);
            toast.success("Department deleted");
            setToDelete(null);
          }
        }}
      />
    </AppShell>
  );
}
