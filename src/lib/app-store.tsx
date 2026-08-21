import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Department, Employee, Project, Role, User } from "./types";
import {
  loginApi,
  registerApi,
  fetchDepartments,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  fetchEmployees,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  fetchProjects,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from "./api";

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
  addDepartment: (d: Omit<Department, "id">) => Promise<void>;
  updateDepartment: (d: Department) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addEmployee: (e: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (e: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addProject: (p: Omit<Project, "id">) => Promise<void>;
  updateProject: (p: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ departments: [], employees: [], projects: [] });
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore auth from localStorage, then load real data if logged in
  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Whenever we have a token (fresh login or restored session), fetch real data
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const [departments, employees, projects] = await Promise.all([
          fetchDepartments(),
          fetchEmployees(),
          fetchProjects(),
        ]);
        setState({ departments, employees, projects });
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const persistAuth = useCallback((next: { user: User; token: string } | null) => {
    if (next) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      setUser(next.user);
      setToken(next.token);
    } else {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
      setToken(null);
      setState({ departments: [], employees: [], projects: [] });
    }
  }, []);

  const login = useCallback<AppContextValue["login"]>(
    async (username, password) => {
      const { user, token } = await loginApi(username, password);
      persistAuth({ user, token });
      return user;
    },
    [persistAuth],
  );

  const register = useCallback<AppContextValue["register"]>(
    async (username, password, role) => {
      const { user, token } = await registerApi(username, password, role);
      persistAuth({ user, token });
      return user;
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

      addDepartment: async (d) => {
        const created = await createDepartmentApi(d);
        setState((s) => ({ ...s, departments: [created, ...s.departments] }));
      },
      updateDepartment: async (d) => {
        const updated = await updateDepartmentApi(d);
        setState((s) => ({ ...s, departments: s.departments.map((x) => (x.id === updated.id ? updated : x)) }));
      },
      deleteDepartment: async (id) => {
        await deleteDepartmentApi(id);
        setState((s) => ({ ...s, departments: s.departments.filter((x) => x.id !== id) }));
      },

      addEmployee: async (e) => {
        const created = await createEmployeeApi(e);
        setState((s) => ({ ...s, employees: [created, ...s.employees] }));
      },
      updateEmployee: async (e) => {
        const updated = await updateEmployeeApi(e);
        setState((s) => ({ ...s, employees: s.employees.map((x) => (x.id === updated.id ? updated : x)) }));
      },
      deleteEmployee: async (id) => {
        await deleteEmployeeApi(id);
        setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) }));
      },

      addProject: async (p) => {
        const created = await createProjectApi(p);
        setState((s) => ({ ...s, projects: [created, ...s.projects] }));
      },
      updateProject: async (p) => {
        const updated = await updateProjectApi(p);
        setState((s) => ({ ...s, projects: s.projects.map((x) => (x.id === updated.id ? updated : x)) }));
      },
      deleteProject: async (id) => {
        await deleteProjectApi(id);
        setState((s) => ({ ...s, projects: s.projects.filter((x) => x.id !== id) }));
      },
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