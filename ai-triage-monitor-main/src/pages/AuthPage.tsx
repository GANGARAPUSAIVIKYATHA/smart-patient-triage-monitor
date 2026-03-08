import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAppState, type UserRole } from "@/context/AppStateContext";
import { DEPARTMENTS } from "@/lib/triage";

const roles: UserRole[] = ["patient", "doctor", "staff", "admin"];

const roleMeta: Record<UserRole, { label: string; signupTitle: string; loginTitle: string }> = {
  patient: {
    label: "Patient",
    signupTitle: "Patient Sign Up",
    loginTitle: "Patient Login",
  },
  doctor: {
    label: "Doctor",
    signupTitle: "Doctor Registration",
    loginTitle: "Doctor Login",
  },
  staff: {
    label: "Staff",
    signupTitle: "Staff Sign Up",
    loginTitle: "Staff Login",
  },
  admin: {
    label: "Admin",
    signupTitle: "Admin Sign Up",
    loginTitle: "Admin Login",
  },
};

const redirectByRole: Record<UserRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  staff: "/staff",
  admin: "/admin",
};

interface AuthPageProps {
  mode: "login" | "signup";
}

const emptyForm = {
  fullName: "",
  age: "",
  gender: "",
  phone: "",
  department: "",
  experience: "",
  hospitalId: "",
  availableTime: "",
  staffRole: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  const { role: roleParam } = useParams();
  const { toast } = useToast();
  const { currentUser, registerUser, login } = useAppState();
  const [form, setForm] = useState(emptyForm);

  const role = useMemo(() => {
    if (!roleParam || !roles.includes(roleParam as UserRole)) {
      return null;
    }

    return roleParam as UserRole;
  }, [roleParam]);

  if (!role) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader>
            <CardTitle>Invalid route</CardTitle>
            <CardDescription>Please use a valid login/signup route.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDoctorSignupBlocked = mode === "signup" && role === "doctor" && currentUser?.role !== "admin";

  const title = mode === "signup" ? roleMeta[role].signupTitle : roleMeta[role].loginTitle;

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      const result = login(role, form.email, form.password);

      toast({
        title: result.ok ? "Success" : "Login failed",
        description: result.message,
        variant: result.ok ? "default" : "destructive",
      });

      if (result.ok) {
        navigate(redirectByRole[role]);
      }

      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    const result = registerUser({
      role,
      email: form.email,
      password: form.password,
      displayName:
        role === "patient"
          ? form.fullName
          : role === "doctor"
            ? form.fullName
            : role === "staff"
              ? form.fullName
              : form.fullName,
      age: role === "patient" ? Number(form.age) : undefined,
      gender: role === "patient" ? form.gender : undefined,
      phone: role === "patient" ? form.phone : undefined,
      department: role === "doctor" ? form.department : undefined,
      experience: role === "doctor" ? form.experience : undefined,
      hospitalId: role === "doctor" ? form.hospitalId : undefined,
      availableTime: role === "doctor" ? form.availableTime : undefined,
      staffRole: role === "staff" ? form.staffRole : undefined,
    });

    toast({
      title: result.ok ? "Success" : "Signup failed",
      description: result.message,
      variant: result.ok ? "default" : "destructive",
    });

    if (!result.ok) {
      return;
    }

    if (role === "doctor") {
      navigate("/admin");
      return;
    }

    navigate(redirectByRole[role]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-xl border-border bg-card glow-green-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>
            {mode === "signup"
              ? `Create your ${roleMeta[role].label.toLowerCase()} account for AI-Powered Smart Patient Triage.`
              : `Login with your ${roleMeta[role].label.toLowerCase()} credentials.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDoctorSignupBlocked ? (
            <div className="space-y-4">
              <div className="surface-warning rounded-lg p-4 text-sm text-foreground">
                Doctor registration is admin-only. Please ask an admin to register your account.
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => navigate("/login/doctor")}>Doctor Login</Button>
                <Button className="flex-1" variant="outline" onClick={() => navigate("/")}>Back Home</Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <>
                  {(role === "patient" || role === "doctor" || role === "staff" || role === "admin") && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{role === "patient" ? "Full Name" : role === "doctor" ? "Doctor Name" : role === "staff" ? "Staff Name" : "Admin Name"}</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(event) => handleChange("fullName", event.target.value)}
                        required
                      />
                    </div>
                  )}

                  {role === "patient" && (
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min={1}
                          value={form.age}
                          onChange={(event) => handleChange("age", event.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={form.gender} onValueChange={(value) => handleChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(event) => handleChange("phone", event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {role === "doctor" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={form.department} onValueChange={(value) => handleChange("department", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((department) => (
                                <SelectItem key={department} value={department}>
                                  {department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience</Label>
                          <Input
                            id="experience"
                            placeholder="e.g. 8 years"
                            value={form.experience}
                            onChange={(event) => handleChange("experience", event.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="hospitalId">Hospital ID</Label>
                          <Input
                            id="hospitalId"
                            value={form.hospitalId}
                            onChange={(event) => handleChange("hospitalId", event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availableTime">Available Time</Label>
                          <Input
                            id="availableTime"
                            placeholder="e.g. 10:00 - 12:00"
                            value={form.availableTime}
                            onChange={(event) => handleChange("availableTime", event.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {role === "staff" && (
                    <div className="space-y-2">
                      <Label htmlFor="staffRole">Role</Label>
                      <Input
                        id="staffRole"
                        placeholder="e.g. Queue Coordinator"
                        value={form.staffRole}
                        onChange={(event) => handleChange("staffRole", event.target.value)}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  required
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => handleChange("confirmPassword", event.target.value)}
                    required
                  />
                </div>
              )}

              <Button className="w-full" type="submit">
                {mode === "signup" ? "Create Account" : "Login"}
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
                {role === "doctor" ? (
                  <span className="text-foreground">Doctor accounts are created by Admin.</span>
                ) : mode === "signup" ? (
                  <Link className="text-primary hover:underline" to={`/login/${role}`}>
                    Login here
                  </Link>
                ) : (
                  <Link className="text-primary hover:underline" to={`/signup/${role}`}>
                    Sign up here
                  </Link>
                )}
              </div>

              <div className="text-center text-sm">
                <Link className="text-muted-foreground hover:text-foreground" to="/">
                  Back to Home
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
