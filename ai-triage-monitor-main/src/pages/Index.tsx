import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Brain,
  Building2,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI Risk Prediction",
    desc: "Analyzes symptoms and vitals to predict risk levels instantly.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Availability Tracking",
    desc: "Patients can view active doctors by department and available slots.",
  },
  {
    icon: Building2,
    title: "Smart Department Recommendation",
    desc: "Guides patients to the right department based on risk signals.",
  },
  {
    icon: ClipboardList,
    title: "Hospital Workflow Monitoring",
    desc: "Staff and admin dashboards track queue, appointments, and load trends.",
  },
];

const actionButtons = [
  { label: "Patient Sign Up", path: "/signup/patient", icon: UserPlus },
  { label: "Patient Login", path: "/login/patient", icon: UserRound },
  { label: "Doctor Login", path: "/login/doctor", icon: Stethoscope },
  { label: "Staff Login", path: "/login/staff", icon: Users },
  { label: "Admin Login", path: "/login/admin", icon: ShieldCheck },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-primary font-medium">
            <Activity className="h-3 w-3" />
            Professional Hospital Monitoring UI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">AI-Powered Smart Patient Triage</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            An intelligent AI system that analyzes patient symptoms, predicts risk levels, and helps hospitals prioritize urgent cases.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actionButtons.map((button) => (
            <Button
              key={button.label}
              onClick={() => navigate(button.path)}
              className="h-auto py-4 flex flex-col items-center gap-2 font-semibold"
            >
              <button.icon className="h-5 w-5" />
              <span className="text-xs text-center leading-tight">{button.label}</span>
            </Button>
          ))}
        </div>

        <div className="card-medical">
          <h2 className="text-lg font-semibold text-foreground mb-2">How this platform helps hospitals</h2>
          <p className="text-muted-foreground leading-relaxed">
            The system helps hospitals analyze symptoms, detect high-risk patients, and recommend the correct department while giving role-specific access for patients, doctors, staff, and admins.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="card-medical group hover:border-primary/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
