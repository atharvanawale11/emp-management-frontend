import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedDepartments, seedEmployees, seedProjects } from "./mock-data";
import type { Department, Employee, Project, Role, User } from "./types";

/**
 * Client-side mock store. Mirrors the shape of the future Spring Boot REST API
 * (JWT in localStorage, resources fetched per entity) so wiring real calls later
 * only means swapping the bodies of these functions for fetch() requests.
 */

const STORAGE_KEY = "atlas.state.v1";
const AUTH_KEY = "atlas.auth.v1";

interface AppState {
  departments: Department[];
  employees: Employee[];
  projects: Project[];
}

interface AppContextValue extends AppState {
  loading: boolean;
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  addDepartment: (d: Omit<Department, "id">) => void;
  updateDepartment: (d: Department) => void;
  deleteDepartment: (id: string) => void;
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (e: Employee) => void;
  deleteEmployee: (id: string) => void;
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
  departments: seedDepartments,
  employees: seedEmployees,
  projects: seedProjects,
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      /* ignore corrupted storage */
    }
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, loading]);

  const persistAuth = useCallback((next: { user: User; token: string } | null) => {
    if (next) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      setUser(next.user);
      setToken(next.token);
    } else {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = useCallback<AppContextValue["login"]>(
    async (username, password) => {
      await new Promise((r) => setTimeout(r, 700));
      if (!username.trim() || password.length < 4) {
        throw new Error("Invalid username or password");
      }
      const role: Role = username.trim().toLowerCase().startsWith("admin") ? "ADMIN" : "EMPLOYEE";
      const next = { user: { id: uid(), username: username.trim(), role }, token: `mock.jwt.${uid()}` };
      persistAuth(next);
      return next.user;
    },
    [persistAuth],
  );

  const register = useCallback<AppContextValue["register"]>(
    async (username, password, role) => {
      await new Promise((r) => setTimeout(r, 800));
      if (username.trim().length < 3) throw new Error("Username must be at least 3 characters");
      if (password.length < 4) throw new Error("Password must be at least 4 characters");
      const next = { user: { id: uid(), username: username.trim(), role }, token: `mock.jwt.${uid()}` };
      persistAuth(next);
      return next.user;
    },
    [persistAuth],
  );

  const logout = useCallback(() => persistAuth(null), [persistAuth]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      loading,
      user,
      token,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      addDepartment: (d) => setState((s) => ({ ...s, departments: [{ ...d, id: uid() }, ...s.departments] })),
      updateDepartment: (d) =>
        setState((s) => ({ ...s, departments: s.departments.map((x) => (x.id === d.id ? d : x)) })),
      deleteDepartment: (id) =>
        setState((s) => ({
          ...s,
          departments: s.departments.filter((x) => x.id !== id),
          employees: s.employees.map((e) => (e.departmentId === id ? { ...e, departmentId: "" } : e)),
        })),
      addEmployee: (e) => setState((s) => ({ ...s, employees: [{ ...e, id: uid() }, ...s.employees] })),
      updateEmployee: (e) => setState((s) => ({ ...s, employees: s.employees.map((x) => (x.id === e.id ? e : x)) })),
      deleteEmployee: (id) =>
        setState((s) => ({
          ...s,
          employees: s.employees.filter((x) => x.id !== id),
          projects: s.projects.map((p) => (p.employeeId === id ? { ...p, employeeId: null } : p)),
        })),
      addProject: (p) => setState((s) => ({ ...s, projects: [{ ...p, id: uid() }, ...s.projects] })),
      updateProject: (p) => setState((s) => ({ ...s, projects: s.projects.map((x) => (x.id === p.id ? p : x)) })),
      deleteProject: (id) => setState((s) => ({ ...s, projects: s.projects.filter((x) => x.id !== id) })),
    }),
    [state, loading, user, token, login, register, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
