import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-store";
import type { Project } from "@/lib/types";
import { isAxiosError } from "axios";

const UNASSIGNED = "unassigned";

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

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  defaultEmployeeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project | null;
  defaultEmployeeId?: string;
}) {
  const { employees, addProject, updateProject } = useApp();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [employeeId, setEmployeeId] = useState<string>(UNASSIGNED);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setLocation(project?.location ?? "");
    setStartDate(project?.startDate ?? "");
    setEmployeeId(project?.employeeId ?? defaultEmployeeId ?? UNASSIGNED);
  }, [open, project, defaultEmployeeId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (employeeId === UNASSIGNED) {
      toast.error("Please assign an employee — projects must have an owner");
      return;
    }
    const payload = {
      name: name.trim(),
      location: location.trim() || "Remote",
      startDate: startDate || new Date().toISOString().slice(0, 10),
      employeeId,
    };

    setSubmitting(true);
    try {
      if (project) {
        await updateProject({ ...project, ...payload });
        toast.success("Project updated successfully");
      } else {
        await addProject(payload);
        toast.success("Project added successfully");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{project ? "Edit project" : "Add project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update this project's details." : "Create a project and assign an owner."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Project name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" placeholder="Atlas Core Migration" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-loc">Location</Label>
              <Input id="p-loc" value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 rounded-xl" placeholder="Bengaluru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-start">Start date</Label>
              <Input id="p-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={UNASSIGNED} disabled>
                  Select an employee
                </SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl accent-gradient text-primary-foreground" disabled={submitting}>
              {submitting ? "Saving..." : project ? "Save changes" : "Add project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}