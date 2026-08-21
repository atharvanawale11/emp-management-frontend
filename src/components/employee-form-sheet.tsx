import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-store";
import type { Employee } from "@/lib/types";

const empty = { name: "", email: "", designation: "", departmentId: "", salary: "", dateOfJoining: "" };

export function EmployeeFormSheet({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: Employee | null;
}) {
  const { departments, addEmployee, updateEmployee } = useApp();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      employee
        ? {
            name: employee.name,
            email: employee.email,
            designation: employee.designation,
            departmentId: employee.departmentId,
            salary: String(employee.salary),
            dateOfJoining: employee.dateOfJoining,
          }
        : empty,
    );
  }, [open, employee]);

  const set = (key: keyof typeof empty, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim() || "Team member",
      departmentId: form.departmentId,
      salary: Number(form.salary) || 0,
      dateOfJoining: form.dateOfJoining || new Date().toISOString().slice(0, 10),
    };
    if (employee) {
      updateEmployee({ ...employee, ...payload });
      toast.success("Employee updated successfully");
    } else {
      addEmployee(payload);
      toast.success("Employee added successfully");
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="px-6">
          <SheetTitle className="font-display">{employee ? "Edit employee" : "Add employee"}</SheetTitle>
          <SheetDescription>
            {employee ? "Update this teammate's details." : "Add a new teammate to the directory."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 px-6 pb-8">
          <div className="space-y-2">
            <Label htmlFor="e-name">Full name</Label>
            <Input id="e-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10 rounded-xl" placeholder="Jordan Reeves" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-email">Email</Label>
            <Input id="e-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-10 rounded-xl" placeholder="jordan@atlas.co" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-desig">Designation</Label>
            <Input id="e-desig" value={form.designation} onChange={(e) => set("designation", e.target.value)} className="h-10 rounded-xl" placeholder="Product Designer" />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={form.departmentId} onValueChange={(v) => set("departmentId", v)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-salary">Salary</Label>
              <Input id="e-salary" inputMode="numeric" value={form.salary} onChange={(e) => set("salary", e.target.value)} className="h-10 rounded-xl" placeholder="1200000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-doj">Date of joining</Label>
              <Input id="e-doj" type="date" value={form.dateOfJoining} onChange={(e) => set("dateOfJoining", e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl accent-gradient text-primary-foreground">
              {employee ? "Save changes" : "Add employee"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
