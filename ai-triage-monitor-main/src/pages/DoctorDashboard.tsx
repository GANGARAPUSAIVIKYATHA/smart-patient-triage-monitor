import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppStateContext";
import { AlertTriangle, Check, CheckCircle, Clock, Eye, Users, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const statusClass: Record<string, string> = {
  Waiting: "status-chip status-chip-warning",
  "In Progress": "status-chip status-chip-info",
  Checked: "status-chip status-chip-success",
  Completed: "status-chip status-chip-success",
  "Not Available": "status-chip status-chip-danger",
};

const DoctorDashboard = () => {
  const { currentUser, analyses, updatePatientStatus } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const doctor = currentUser?.role === "doctor" ? currentUser : null;

  const patients = useMemo(() => {
    if (!doctor) return [];

    return analyses
      .filter((record) => record.doctorId === doctor.id && record.department === doctor.department)
      .sort((a, b) => {
        const byRisk = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        if (byRisk !== 0) return byRisk;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [analyses, doctor]);

  const selectedPatient = patients.find((record) => record.id === selectedId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {doctor ? `${doctor.displayName} · ${doctor.department}` : "Monitor and manage your assigned patients"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Assigned Patients" value={patients.length} icon={Users} />
          <StatCard title="High Risk Patients" value={patients.filter((patient) => patient.riskLevel === "HIGH").length} icon={AlertTriangle} variant="danger" />
          <StatCard title="Patients Waiting" value={patients.filter((patient) => patient.status === "Waiting").length} icon={Clock} variant="warning" />
          <StatCard title="Completed Consultations" value={patients.filter((patient) => patient.status === "Checked" || patient.status === "Completed").length} icon={CheckCircle} variant="success" />
        </div>

        <div className="card-medical">
          <h2 className="text-lg font-semibold text-foreground mb-4">Patient Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Patient Name", "Age", "Symptoms", "Blood Pressure", "Heart Rate", "Risk Level", "Department", "Status", "Actions"].map((header) => (
                    <th key={header} className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className={`border-b border-border/50 hover:bg-secondary/30 ${patient.riskLevel === "HIGH" ? "risk-row-high" : ""}`}>
                    <td className="py-3 px-3 font-medium text-foreground">{patient.patientName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{patient.age}</td>
                    <td className="py-3 px-3 text-muted-foreground max-w-[220px] truncate">{patient.symptoms}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{patient.bloodPressure}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{patient.heartRate}</td>
                    <td className="py-3 px-3"><RiskBadge level={patient.riskLevel} /></td>
                    <td className="py-3 px-3 text-muted-foreground">{patient.department}</td>
                    <td className="py-3 px-3"><span className={statusClass[patient.status] || "status-chip status-chip-info"}>{patient.status}</span></td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedId(patient.id)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updatePatientStatus(patient.id, "Checked")}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updatePatientStatus(patient.id, "Not Available")}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && <p className="text-sm text-muted-foreground py-4">No patients assigned to this doctor yet.</p>}
          </div>
        </div>

        {selectedPatient && (
          <div className="card-medical space-y-2">
            <h3 className="font-semibold text-foreground">Patient Details</h3>
            <p className="text-sm text-muted-foreground">{selectedPatient.patientName} · {selectedPatient.gender} · {selectedPatient.age} years</p>
            <p className="text-sm text-muted-foreground">Pre-existing Conditions: {selectedPatient.conditions || "None provided"}</p>
            <p className="text-sm text-muted-foreground">Recommended Department: {selectedPatient.recommendedDepartment}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
