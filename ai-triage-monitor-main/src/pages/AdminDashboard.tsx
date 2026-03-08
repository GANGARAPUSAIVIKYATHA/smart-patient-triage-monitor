import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAppState } from "@/context/AppStateContext";
import { AlertCircle, AlertTriangle, CheckCircle, Stethoscope, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
  },
};

const AdminDashboard = () => {
  const { analyses, doctors, patients } = useAppState();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const highRisk = analyses.filter((record) => record.riskLevel === "HIGH").length;
  const mediumRisk = analyses.filter((record) => record.riskLevel === "MEDIUM").length;
  const lowRisk = analyses.filter((record) => record.riskLevel === "LOW").length;
  const doctorsAvailable = doctors.filter((doctor) => doctor.availabilityStatus === "Available").length;

  const symptomDistribution = useMemo(() => {
    const buckets = {
      Cardiac: 0,
      Neurology: 0,
      Respiratory: 0,
      General: 0,
    };

    analyses.forEach((record) => {
      const text = record.symptoms.toLowerCase();
      if (text.includes("chest") || text.includes("heart")) buckets.Cardiac += 1;
      else if (text.includes("head") || text.includes("dizziness")) buckets.Neurology += 1;
      else if (text.includes("cough") || text.includes("breath")) buckets.Respiratory += 1;
      else buckets.General += 1;
    });

    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [analyses]);

  const riskData = [
    { name: "High Risk", value: highRisk, color: "hsl(var(--danger))" },
    { name: "Medium Risk", value: mediumRisk, color: "hsl(var(--warning))" },
    { name: "Low Risk", value: lowRisk, color: "hsl(var(--success))" },
  ];

  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    analyses.forEach((record) => {
      deptCounts[record.recommendedDepartment] = (deptCounts[record.recommendedDepartment] ?? 0) + 1;
    });

    return Object.entries(deptCounts).map(([name, patientsCount]) => ({ name, patients: patientsCount }));
  }, [analyses]);

  const dailyLoad = useMemo(() => {
    const dateMap: Record<string, number> = {};

    analyses.forEach((record) => {
      const day = new Date(record.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      dateMap[day] = (dateMap[day] ?? 0) + 1;
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, patients: dateMap[day] ?? 0 }));
  }, [analyses]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Live hospital analytics with auto-refresh every second</p>
          </div>
          <p className="text-xs text-muted-foreground">Last refreshed: {clock.toLocaleTimeString()}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Patients" value={patients.length} icon={Users} />
          <StatCard title="High Risk Patients" value={highRisk} icon={AlertTriangle} variant="danger" />
          <StatCard title="Medium Risk Patients" value={mediumRisk} icon={AlertCircle} variant="warning" />
          <StatCard title="Low Risk Patients" value={lowRisk} icon={CheckCircle} variant="success" />
          <StatCard title="Doctors Available" value={doctorsAvailable} icon={Stethoscope} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-medical">
            <h2 className="text-base font-semibold text-foreground mb-4">Overall Symptoms Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={symptomDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-medical">
            <h2 className="text-base font-semibold text-foreground mb-4">Overall Risk Level Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskData} dataKey="value" innerRadius={55} outerRadius={95}>
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card-medical">
            <h2 className="text-base font-semibold text-foreground mb-4">Department Recommendation Chart</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-medical">
            <h2 className="text-base font-semibold text-foreground mb-4">Daily Patient Load</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyLoad}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
