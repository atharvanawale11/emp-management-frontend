import { apiClient } from "./api-client";
import type { Department, Employee, Project, Role, User } from "./types";

// ---------- Backend shapes (what Spring Boot actually sends/expects) ----------
interface BackendEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  designation: string;
  salary: number;
  dateOfJoining: string;
  departmentId: number;
  departmentName?: string;
}

interface BackendProject {
  id: number;
  name: string;
  location: string;
  startDate: string;
  employeeId: number;
  employeeName?: string;
}

interface BackendDepartment {
  id: number;
  name: string;
  description: string;
}

// ---------- Adapters: backend shape -> frontend shape ----------
const toDepartment = (d: BackendDepartment): Department => ({
  id: String(d.id),
  name: d.name,
  description: d.description,
});

const toEmployee = (e: BackendEmployee): Employee => ({
  id: String(e.id),
  name: `${e.firstName} ${e.lastName}`,
  email: e.email,
  designation: e.designation,
  departmentId: String(e.departmentId),
  salary: e.salary,
  dateOfJoining: e.dateOfJoining,
});

const toProject = (p: BackendProject): Project => ({
  id: String(p.id),
  name: p.name,
  location: p.location,
  startDate: p.startDate,
  employeeId: p.employeeId ? String(p.employeeId) : null,
});

// ---------- Auth ----------
export async function loginApi(username: string, password: string) {
  const res = await apiClient.post("/auth/login", { username, password });
  const { token, username: uname, role } = res.data;
  const user: User = { id: uname, username: uname, role: role as Role };
  return { user, token };
}

export async function registerApi(username: string, password: string, role: Role) {
  const res = await apiClient.post("/auth/register", { username, password, role });
  const { token, username: uname, role: r } = res.data;
  const user: User = { id: uname, username: uname, role: r as Role };
  return { user, token };
}

// ---------- Departments ----------
export async function fetchDepartments(): Promise<Department[]> {
  const res = await apiClient.get<BackendDepartment[]>("/departments");
  return res.data.map(toDepartment);
}

export async function createDepartmentApi(d: Omit<Department, "id">): Promise<Department> {
  const res = await apiClient.post<BackendDepartment>("/departments", d);
  return toDepartment(res.data);
}

export async function updateDepartmentApi(d: Department): Promise<Department> {
  const res = await apiClient.put<BackendDepartment>(`/departments/${d.id}`, {
    name: d.name,
    description: d.description,
  });
  return toDepartment(res.data);
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}

// ---------- Employees ----------
export async function fetchEmployees(): Promise<Employee[]> {
  const res = await apiClient.get<BackendEmployee[]>("/employees");
  return res.data.map(toEmployee);
}

export async function createEmployeeApi(e: Omit<Employee, "id">): Promise<Employee> {
  const [firstName, ...rest] = e.name.trim().split(" ");
  const lastName = rest.join(" ") || firstName;
  const res = await apiClient.post<BackendEmployee>("/employees", {
    firstName,
    lastName,
    email: e.email,
    designation: e.designation,
    salary: e.salary,
    dateOfJoining: e.dateOfJoining,
    departmentId: Number(e.departmentId),
  });
  return toEmployee(res.data);
}

export async function updateEmployeeApi(e: Employee): Promise<Employee> {
  const [firstName, ...rest] = e.name.trim().split(" ");
  const lastName = rest.join(" ") || firstName;
  const res = await apiClient.put<BackendEmployee>(`/employees/${e.id}`, {
    firstName,
    lastName,
    email: e.email,
    designation: e.designation,
    salary: e.salary,
    dateOfJoining: e.dateOfJoining,
    departmentId: Number(e.departmentId),
  });
  return toEmployee(res.data);
}

export async function deleteEmployeeApi(id: string): Promise<void> {
  await apiClient.delete(`/employees/${id}`);
}

// ---------- Projects ----------
export async function fetchProjects(): Promise<Project[]> {
  const res = await apiClient.get<BackendProject[]>("/projects");
  return res.data.map(toProject);
}

export async function createProjectApi(p: Omit<Project, "id">): Promise<Project> {
  const res = await apiClient.post<BackendProject>("/projects", {
    name: p.name,
    location: p.location,
    startDate: p.startDate,
    employeeId: Number(p.employeeId),
  });
  return toProject(res.data);
}

export async function updateProjectApi(p: Project): Promise<Project> {
  const res = await apiClient.put<BackendProject>(`/projects/${p.id}`, {
    name: p.name,
    location: p.location,
    startDate: p.startDate,
    employeeId: Number(p.employeeId),
  });
  return toProject(res.data);
}

export async function deleteProjectApi(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}