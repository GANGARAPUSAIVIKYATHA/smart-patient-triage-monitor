import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { useAppState } from "@/context/AppStateContext";
import { Calendar, Stethoscope, Users } from "lucide-react";
import { useMemo } from "react";

const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };

const statusClass: Record<string, string> = {
  Waiting: "status-chip status-chip-warning",
  "In Progress": "status-chip status-chip-info",
  Checked: "status-chip status-chip-success",
  Completed: "status-chip status-chip-success",
  "Not Available": "status-chip status-chip-danger",
  Booked: "status-chip status-chip-info",
};

const doctorStatusClass: Record<string, string> = {
  Available: "status-chip status-chip-success",
  Busy: "status-chip status-chip-danger",
  "On Break": "status-chip status-chip-warning",
};

const StaffDashboard = () => {
  const { appointments, analyses, doctors } = useAppState();

  const queueRows = useMemo(() => {
    return appointments
      .map((appointment) => {
        const linkedRecord = analyses.find((record) => record.appointmentId === appointment.id);
        return {
          ...appointment,
          riskLevel: linkedRecord?.riskLevel,
        };
      })
      .sort((a, b) => {
        const aOrder = a.riskLevel ? riskOrder[a.riskLevel] : riskOrder.NONE;
        const bOrder = b.riskLevel ? riskOrder[b.riskLevel] : riskOrder.NONE;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [appointments, analyses]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage patient queue, appointments, and doctor availability</p>
        </div>

        <div className="card-medical space-y-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Patient Queue
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Patient Name", "Doctor", "Department", "Appointment Time", "Status", "Risk"].map((header) => (
                    <th key={header} className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queueRows.map((row) => (
                  <tr key={row.id} className={`border-b border-border/50 hover:bg-secondary/30 ${row.riskLevel === "HIGH" ? "risk-row-high" : ""}`}>
                    <td className="py-2.5 px-3 font-medium text-foreground">{row.patientName}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.doctorName}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.department}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.timeSlot}</td>
                    <td className="py-2.5 px-3"><span className={statusClass[row.status] || "status-chip status-chip-info"}>{row.status}</span></td>
                    <td className="py-2.5 px-3">{row.riskLevel ? <RiskBadge level={row.riskLevel} /> : <span className="text-xs text-muted-foreground">Pending</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queueRows.length === 0 && <p className="text-sm text-muted-foreground py-4">No appointments yet. Bookings will appear automatically.</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-medical space-y-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Appointments
            </h2>
            <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-lg border border-border p-3 bg-secondary/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{appointment.patientName}</p>
                    <span className={statusClass[appointment.status] || "status-chip status-chip-info"}>{appointment.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{appointment.doctorName} · {appointment.department}</p>
                  <p className="text-xs text-muted-foreground">{appointment.timeSlot}</p>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-sm text-muted-foreground">No appointment records yet.</p>}
            </div>
          </div>

          <div className="card-medical space-y-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" /> Doctor Availability
            </h2>
            <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-lg border border-border p-3 bg-secondary/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{doctor.displayName}</p>
                    <span className={doctorStatusClass[doctor.availabilityStatus] || "status-chip status-chip-info"}>{doctor.availabilityStatus}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{doctor.department}</p>
                  <p className="text-xs text-muted-foreground">{doctor.availableTime}</p>
                </div>
              ))}
              {doctors.length === 0 && <p className="text-sm text-muted-foreground">Doctor availability appears once admin registers doctors.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
