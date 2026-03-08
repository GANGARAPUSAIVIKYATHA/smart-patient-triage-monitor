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
  registerUser: (payload: RegisterPayload) => ActionResult;
  login: (role: UserRole, email: string, password: string) => ActionResult;
  logout: () => void;
  bookAppointment: (payload: { department: string; doctorId: string; timeSlot: string }) => ActionResult;
  submitAnalysis: (payload: AnalysisPayload) => { ok: boolean; message: string; record?: AnalysisRecord };
  updatePatientStatus: (recordId: string, status: PatientFlowStatus) => void;
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

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStateStore>(() => loadStore());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const currentUser = useMemo(() => store.users.find((user) => user.id === store.currentUserId) ?? null, [store.users, store.currentUserId]);
  const doctors = useMemo(() => store.users.filter((user): user is DoctorUser => user.role === "doctor"), [store.users]);
  const patients = useMemo(() => store.users.filter((user): user is PatientUser => user.role === "patient"), [store.users]);

  const registerUser = (payload: RegisterPayload): ActionResult => {
    if (store.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, message: "Email already registered." };
    }

    if (payload.role === "doctor" && currentUser?.role !== "admin") {
      return { ok: false, message: "Only admins can register doctor accounts." };
    }

    const createdAt = new Date().toISOString();
    const baseUser = {
      id: createId(),
      role: payload.role,
      email: payload.email,
      password: payload.password,
      displayName: payload.displayName,
      createdAt,
    };

    let user: AppUser;

    switch (payload.role) {
      case "patient":
        user = {
          ...baseUser,
          role: "patient",
          age: payload.age ?? 0,
          gender: payload.gender ?? "Not specified",
          phone: payload.phone ?? "",
        };
        break;
      case "doctor":
        user = {
          ...baseUser,
          role: "doctor",
          department: payload.department ?? "General Medicine",
          experience: payload.experience ?? "0 years",
          hospitalId: payload.hospitalId ?? "",
          availableTime: payload.availableTime ?? "09:00 - 11:00",
          availabilityStatus: "Available",
        };
        break;
      case "staff":
        user = {
          ...baseUser,
          role: "staff",
          staffRole: payload.staffRole ?? "Front Desk",
        };
        break;
      case "admin":
      default:
        user = {
          ...baseUser,
          role: "admin",
        };
        break;
    }

    const shouldAutoLogin = payload.role !== "doctor";

    setStore({
      ...store,
      users: [...store.users, user],
      currentUserId: shouldAutoLogin ? user.id : store.currentUserId,
    });

    return {
      ok: true,
      message: payload.role === "doctor" ? "Doctor registered successfully." : "Account created successfully.",
    };
  };

  const login = (role: UserRole, email: string, password: string): ActionResult => {
    const user = store.users.find(
      (candidate) =>
        candidate.role === role &&
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!user) {
      return { ok: false, message: "Invalid credentials for selected role." };
    }

    setStore({
      ...store,
      currentUserId: user.id,
    });

    return { ok: true, message: "Login successful." };
  };

  const logout = () => {
    setStore({
      ...store,
      currentUserId: null,
    });
  };

  const bookAppointment = (payload: { department: string; doctorId: string; timeSlot: string }): ActionResult => {
    if (!currentUser || currentUser.role !== "patient") {
      return { ok: false, message: "Only logged-in patients can book appointments." };
    }

    const doctor = doctors.find((candidate) => candidate.id === payload.doctorId);

    if (!doctor) {
      return { ok: false, message: "Selected doctor was not found." };
    }

    const appointment: Appointment = {
      id: createId(),
      patientId: currentUser.id,
      patientName: currentUser.displayName,
      doctorId: doctor.id,
      doctorName: doctor.displayName,
      department: payload.department,
      timeSlot: payload.timeSlot,
      status: "Waiting",
      createdAt: new Date().toISOString(),
    };

    setStore({
      ...store,
      appointments: [appointment, ...store.appointments],
    });

    return { ok: true, message: "Appointment booked successfully." };
  };

  const submitAnalysis = (payload: AnalysisPayload) => {
    if (!currentUser || currentUser.role !== "patient") {
      return { ok: false, message: "Only logged-in patients can submit analysis." };
    }

    const triage = analyzeTriage({
      symptoms: payload.symptoms,
      bloodPressure: payload.bloodPressure,
      heartRate: payload.heartRate,
      temperature: payload.temperature,
      conditions: payload.conditions,
    });

    const linkedDoctor = payload.doctorId ? doctors.find((doctor) => doctor.id === payload.doctorId) : undefined;

    const appointment = [...store.appointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((candidate) => candidate.patientId === currentUser.id && (!linkedDoctor || candidate.doctorId === linkedDoctor.id));

    const record: AnalysisRecord = {
      id: createId(),
      patientId: currentUser.id,
      patientName: payload.fullName,
      age: payload.age,
      gender: payload.gender,
      symptoms: payload.symptoms,
      bloodPressure: payload.bloodPressure,
      heartRate: payload.heartRate,
      temperature: payload.temperature,
      conditions: payload.conditions,
      riskLevel: triage.riskLevel,
      recommendedDepartment: triage.recommendedDepartment,
      confidence: triage.confidence,
      explanations: triage.explanations,
      doctorId: linkedDoctor?.id ?? appointment?.doctorId,
      doctorName: linkedDoctor?.displayName ?? appointment?.doctorName,
      department: linkedDoctor?.department ?? appointment?.department ?? triage.recommendedDepartment,
      status: "Waiting",
      appointmentId: appointment?.id,
      createdAt: new Date().toISOString(),
    };

    setStore({
      ...store,
      analyses: [record, ...store.analyses],
    });

    return {
      ok: true,
      message: "Health analysis completed.",
      record,
    };
  };

  const updatePatientStatus = (recordId: string, status: PatientFlowStatus) => {
    const updatedAnalyses = store.analyses.map((entry) => (entry.id === recordId ? { ...entry, status } : entry));

    const selectedRecord = updatedAnalyses.find((entry) => entry.id === recordId);

    const updatedAppointments = selectedRecord?.appointmentId
      ? store.appointments.map((appointment) =>
          appointment.id === selectedRecord.appointmentId ? { ...appointment, status } : appointment,
        )
      : store.appointments;

    setStore({
      ...store,
      analyses: updatedAnalyses,
      appointments: updatedAppointments,
    });
  };

  const refreshFromStorage = () => {
    setStore(loadStore());
  };

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        users: store.users,
        doctors,
        patients,
        appointments: store.appointments,
        analyses: store.analyses,
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
