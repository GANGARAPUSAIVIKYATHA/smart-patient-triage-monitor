import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { analyzeTriage, type RiskLevel } from "@/lib/triage";

export type UserRole = "patient" | "doctor" | "staff" | "admin";
export type DoctorAvailabilityStatus = "Available" | "Busy" | "On Break";
export type PatientFlowStatus = "Waiting" | "In Progress" | "Checked" | "Not Available" | "Completed";

interface BaseUser {
  id: string;
  role: UserRole;
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

export interface PatientUser extends BaseUser {
  role: "patient";
  age: number;
  gender: string;
  phone: string;
}

export interface DoctorUser extends BaseUser {
  role: "doctor";
  department: string;
  experience: string;
  hospitalId: string;
  availableTime: string;
  availabilityStatus: DoctorAvailabilityStatus;
}

export interface StaffUser extends BaseUser {
  role: "staff";
  staffRole: string;
}

export interface AdminUser extends BaseUser {
  role: "admin";
}

export type AppUser = PatientUser | DoctorUser | StaffUser | AdminUser;

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  timeSlot: string;
  status: PatientFlowStatus;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  symptoms: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  conditions: string;
  riskLevel: RiskLevel;
  recommendedDepartment: string;
  confidence: number;
  explanations: string[];
  doctorId?: string;
  doctorName?: string;
  department: string;
  status: PatientFlowStatus;
  appointmentId?: string;
  createdAt: string;
}

interface AppStateStore {
  users: AppUser[];
  appointments: Appointment[];
  analyses: AnalysisRecord[];
  currentUserId: string | null;
}

interface RegisterPayload {
  role: UserRole;
  email: string;
  password: string;
  displayName: string;
  age?: number;
  gender?: string;
  phone?: string;
  department?: string;
  experience?: string;
  hospitalId?: string;
  availableTime?: string;
  staffRole?: string;
}

interface ActionResult {
  ok: boolean;
  message: string;
}

interface AnalysisPayload {
  fullName: string;
  age: number;
  gender: string;
  symptoms: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  conditions: string;
  doctorId?: string;
}

interface AppStateContextValue {
  currentUser: AppUser | null;
  users: AppUser[];
  doctors: DoctorUser[];
  patients: PatientUser[];
  appointments: Appointment[];
  analyses: AnalysisRecord[];
  registerUser: (payload: RegisterPayload) => Promise<ActionResult>;
  login: (role: UserRole, email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
  bookAppointment: (payload: { department: string; doctorId: string; timeSlot: string }) => Promise<ActionResult>;
  submitAnalysis: (payload: AnalysisPayload) => Promise<{ ok: boolean; message: string; record?: AnalysisRecord }>;
  updatePatientStatus: (recordId: string, status: PatientFlowStatus) => Promise<void>;
  refreshFromStorage: () => void;
}

const STORAGE_KEY = "smart-triage-ui-store-v2";

const initialStore: AppStateStore = {
  users: [],
  appointments: [],
  analyses: [],
  currentUserId: null,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const loadStore = (): AppStateStore => {
  if (typeof window === "undefined") {
    return initialStore;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return initialStore;
  }

  try {
    const parsed = JSON.parse(raw) as AppStateStore;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      analyses: Array.isArray(parsed.analyses) ? parsed.analyses : [],
      currentUserId: parsed.currentUserId ?? null,
    };
  } catch {
    return initialStore;
  }
};

const API_URL = "http://localhost:5000/api";

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const doctors = useMemo(() => users.filter((user): user is DoctorUser => user.role === "doctor"), [users]);
  const patients = useMemo(() => users.filter((user): user is PatientUser => user.role === "patient"), [users]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userJson = localStorage.getItem("user");
    if (token && role && userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const registerUser = async (payload: RegisterPayload): Promise<ActionResult> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || "Registration failed" };

      if (payload.role !== "doctor") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data));
        setCurrentUser(data);
      }
      return { ok: true, message: "Registration successful" };
    } catch (error) {
      return { ok: false, message: "Network error" };
    }
  };

  const login = async (role: UserRole, email: string, password: string): Promise<ActionResult> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || "Login failed" };

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      setCurrentUser(data);
      return { ok: true, message: "Login successful" };
    } catch (error) {
      return { ok: false, message: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const bookAppointment = async (payload: { department: string; doctorId: string; timeSlot: string }): Promise<ActionResult> => {
    try {
      const response = await fetch(`${API_URL}/patient/book-appointment`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || "Booking failed" };
      return { ok: true, message: "Appointment booked successfully" };
    } catch (error) {
      return { ok: false, message: "Network error" };
    }
  };

  const submitAnalysis = async (payload: AnalysisPayload) => {
    try {
      const response = await fetch(`${API_URL}/patient/submit-health-data`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.message || "Submission failed" };
      return { ok: true, message: "Analysis completed", record: data.analysis };
    } catch (error) {
      return { ok: false, message: "Network error" };
    }
  };

  const updatePatientStatus = async (recordId: string, status: PatientFlowStatus) => {
    try {
      await fetch(`${API_URL}/doctor/update-status`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ patientId: recordId, status }),
      });
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const refreshFromStorage = () => {
    // No-op or fetch from API
  };

  if (loading) return null;

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        users,
        doctors,
        patients,
        appointments,
        analyses,
        registerUser,
        login,
        logout,
        bookAppointment,
        submitAnalysis,
        updatePatientStatus,
        refreshFromStorage,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
