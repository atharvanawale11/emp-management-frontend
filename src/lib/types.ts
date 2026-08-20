export type Role = "ADMIN" | "EMPLOYEE";

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  departmentId: string;
  salary: number;
  dateOfJoining: string; // ISO date
}

export interface Project {
  id: string;
  name: string;
  location: string;
  startDate: string; // ISO date
  employeeId: string | null;
}
