import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { isAxiosError } from "axios";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar3, ConfirmDialog, DeptBadge, EmptyState, ListSkeleton, Pager } from "@/components/ui-bits";
import { EmployeeFormSheet } from "@/components/employee-form-sheet";
import { formatCurrency, formatDate, useApp } from "@/lib/app-store";
import type { Employee } from "@/lib/types";

export const Route = createFileRoute("/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — Atlas People" },
      { name: "description", content: "Search, filter and manage every teammate in your organisation." },
      { property: "og:title", content: "Employees — Atlas People" },
      { property: "og:description", content: "Search, filter and manage every teammate in your organisation." },
    ],
  }),
  component: EmployeesPage,
});

const PAGE_SIZE = 8;

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

function EmployeesPage() {
  const { employees, departments, loading, isAdmin, deleteEmployee } = useApp();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesQuery =
        !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q);
      const matchesDept = dept === "all" || e.departmentId === dept;
      return matchesQuery && matchesDept;
    });
  }, [employees, query, dept]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      toast.success("Employee deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell
      title="Employees"
      description={isAdmin ? "Manage your people directory." : "Browse your company directory."}
      actions={
        isAdmin ? (
          <Button
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            className="rounded-xl accent-gradient text-primary-foreground hover:opacity-95"
          >
            <Plus className="mr-2 size-4" /> Add employee
          </Button>
        ) : null
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or designation…"
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <Select
          value={dept}
          onValueChange={(v) => {
            setDept(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 rounded-xl sm:w-56">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="surface overflow-hidden">
        {loading ? (
          <ListSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users className="size-7" />}
            title={employees.length === 0 ? "No employees yet" : "No matches found"}
            description={
              employees.length === 0
                ? "Add your first teammate and their profile will appear right here."
                : "Try a different search term or clear the department filter."
            }
            action={
              employees.length === 0 && isAdmin ? (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setSheetOpen(true);
                  }}
                  className="rounded-xl accent-gradient text-primary-foreground"
                >
                  <Plus className="mr-2 size-4" /> Add your first employee
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-border/70 md:hidden">
              {rows.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/employees/$employeeId"
                    params={{ employeeId: e.id }}
                    className="flex items-center gap-3 px-4 py-4 transition-colors active:bg-muted/60"
                  >
                    <Avatar3 name={e.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.designation}</p>
                      <div className="mt-1.5">
                        <DeptBadge name={deptName(e.departmentId)} />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      {formatCurrency(e.salary)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((e) => (
                    <TableRow key={e.id} className="group transition-colors hover:bg-muted/50">
                      <TableCell>
                        <Link
                          to="/employees/$employeeId"
                          params={{ employeeId: e.id }}
                          className="flex min-w-0 items-center gap-3"
                        >
                          <Avatar3 name={e.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{e.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{e.email}</span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.designation}</TableCell>
                      <TableCell>
                        <DeptBadge name={deptName(e.departmentId)} />
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{formatCurrency(e.salary)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(e.dateOfJoining)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem asChild>
                              <Link to="/employees/$employeeId" params={{ employeeId: e.id }}>
                                <Eye className="mr-2 size-4" /> View details
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditing(e);
                                    setSheetOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setToDelete(e)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pager page={current} pageCount={pageCount} onPage={setPage} total={filtered.length} />
          </>
        )}
      </div>

      <EmployeeFormSheet open={sheetOpen} onOpenChange={setSheetOpen} employee={editing} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Remove ${toDelete?.name ?? ""}?`}
        description="This employee and any projects assigned to them will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}