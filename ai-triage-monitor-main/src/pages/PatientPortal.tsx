import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAppState, type AnalysisRecord } from "@/context/AppStateContext";
import { Brain, CheckCircle, Mic, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type LanguageCode = "en" | "ta" | "hi";

const labels = {
  en: {
    pageTitle: "Patient Portal",
    pageSubtitle: "Book appointments and analyze your health risk",
    doctorAvailability: "Doctor Availability",
    patientHealthForm: "Patient Health Form",
    aiResult: "AI Analysis Result",
    language: "Language",
    department: "Select Department",
    doctor: "Select Doctor",
    slot: "Select Time Slot",
    book: "Book Appointment",
    analyze: "Analyze Health Risk",
    voice: "Voice Assistant",
  },
  ta: {
    pageTitle: "நோயாளர் தளம்",
    pageSubtitle: "நியமனம் பதிவு செய்து ஆரோக்கிய அபாயத்தை பகுப்பாய்வு செய்யுங்கள்",
    doctorAvailability: "மருத்துவர் கிடைக்கும் நேரம்",
    patientHealthForm: "நோயாளர் சுகாதார படிவம்",
    aiResult: "AI பகுப்பாய்வு முடிவு",
    language: "மொழி",
    department: "துறை தேர்வு",
    doctor: "மருத்துவர் தேர்வு",
    slot: "நேரத்தை தேர்வு",
    book: "நியமனம் பதிவு செய்",
    analyze: "ஆரோக்கிய அபாயம் பகுப்பாய்வு",
    voice: "குரல் உதவி",
  },
  hi: {
    pageTitle: "मरीज़ पोर्टल",
    pageSubtitle: "अपॉइंटमेंट बुक करें और स्वास्थ्य जोखिम विश्लेषण देखें",
    doctorAvailability: "डॉक्टर उपलब्धता",
    patientHealthForm: "मरीज़ स्वास्थ्य फ़ॉर्म",
    aiResult: "AI विश्लेषण परिणाम",
    language: "भाषा",
    department: "विभाग चुनें",
    doctor: "डॉक्टर चुनें",
    slot: "समय स्लॉट चुनें",
    book: "अपॉइंटमेंट बुक करें",
    analyze: "स्वास्थ्य जोखिम विश्लेषण",
    voice: "वॉइस असिस्टेंट",
  },
};

const speechLocale: Record<LanguageCode, string> = {
  en: "en-IN",
  ta: "ta-IN",
  hi: "hi-IN",
};

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
  },
};

const statusClassMap: Record<string, string> = {
  Available: "status-chip status-chip-success",
  Busy: "status-chip status-chip-danger",
  "On Break": "status-chip status-chip-warning",
};

const PatientPortal = () => {
  const { currentUser, doctors, analyses, bookAppointment, submitAnalysis } = useAppState();
  const { toast } = useToast();

  const patient = currentUser?.role === "patient" ? currentUser : null;
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [department, setDepartment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisRecord | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [form, setForm] = useState({
    fullName: patient?.displayName ?? "",
    age: patient?.age ? String(patient.age) : "",
    gender: patient?.gender ?? "",
    symptoms: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    conditions: "",
    documentName: "",
  });

  useEffect(() => {
    if (!patient) return;
    setForm((prev) => ({
      ...prev,
      fullName: patient.displayName,
      age: String(patient.age || ""),
      gender: patient.gender || "",
    }));
  }, [patient]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const t = labels[language];
  const departmentOptions = useMemo(() => Array.from(new Set(doctors.map((doctor) => doctor.department))), [doctors]);
  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => !department || doctor.department === department),
    [doctors, department],
  );
  const selectedDoctor = filteredDoctors.find((doctor) => doctor.id === doctorId);
  const timeSlots = selectedDoctor?.availableTime.split(",").map((slot) => slot.trim()).filter(Boolean) ?? [];

  const patientAnalyses = useMemo(() => analyses.filter((record) => record.patientId === patient?.id), [analyses, patient?.id]);

  const symptomDistribution = useMemo(() => {
    const buckets = {
      Cardiac: 0,
      Neuro: 0,
      Respiratory: 0,
      General: 0,
    };

    patientAnalyses.forEach((record) => {
      const text = record.symptoms.toLowerCase();
      if (text.includes("chest") || text.includes("heart")) buckets.Cardiac += 1;
      else if (text.includes("head") || text.includes("dizziness")) buckets.Neuro += 1;
      else if (text.includes("cough") || text.includes("breath")) buckets.Respiratory += 1;
      else buckets.General += 1;
    });

    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [patientAnalyses]);

  const riskDistribution = useMemo(() => {
    const counts = {
      "High Risk": patientAnalyses.filter((record) => record.riskLevel === "HIGH").length,
      "Medium Risk": patientAnalyses.filter((record) => record.riskLevel === "MEDIUM").length,
      "Low Risk": patientAnalyses.filter((record) => record.riskLevel === "LOW").length,
    };

    return [
      { name: "High Risk", value: counts["High Risk"], color: "hsl(var(--danger))" },
      { name: "Medium Risk", value: counts["Medium Risk"], color: "hsl(var(--warning))" },
      { name: "Low Risk", value: counts["Low Risk"], color: "hsl(var(--success))" },
    ];
  }, [patientAnalyses]);

  const vitalsTrend = useMemo(
    () =>
      [...patientAnalyses]
        .slice(0, 6)
        .reverse()
        .map((record, index) => ({
          index: `R${index + 1}`,
          heartRate: Number(record.heartRate.replace(/[^\d]/g, "")) || 0,
          temperature: Number(record.temperature.replace(/[^\d.]/g, "")) || 0,
        })),
    [patientAnalyses],
  );

  const handleVoiceInput = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({ title: "Voice input unavailable", description: "Your browser does not support speech recognition.", variant: "destructive" });
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = speechLocale[language];
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      setForm((prev) => ({ ...prev, symptoms: transcript }));
    };

    recognition.onerror = () => {
      toast({ title: "Voice input error", description: "Microphone permission denied or unavailable.", variant: "destructive" });
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleBookAppointment = () => {
    if (!department || !doctorId || !timeSlot) {
      toast({ title: "Missing details", description: "Select department, doctor, and time slot.", variant: "destructive" });
      return;
    }

    const result = bookAppointment({ department, doctorId, timeSlot });
    toast({ title: result.ok ? "Booked" : "Booking failed", description: result.message, variant: result.ok ? "default" : "destructive" });
  };

  const handleAnalyze = (event: React.FormEvent) => {
    event.preventDefault();

    const result = submitAnalysis({
      fullName: form.fullName,
      age: Number(form.age),
      gender: form.gender,
      symptoms: form.symptoms,
      bloodPressure: form.bloodPressure,
      heartRate: form.heartRate,
      temperature: form.temperature,
      conditions: form.conditions,
      doctorId: doctorId || undefined,
    });

    if (!result.ok) {
      toast({ title: "Analysis failed", description: result.message, variant: "destructive" });
      return;
    }

    setAnalysisResult(result.record ?? null);
    toast({ title: "Analysis ready", description: result.message });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.pageSubtitle}</p>
          </div>
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {([
              ["en", "English"],
              ["ta", "Tamil"],
              ["hi", "Hindi"],
            ] as const).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  language === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-medical space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t.doctorAvailability}
          </h2>

          <div className="grid md:grid-cols-4 gap-3">
            <Select value={department} onValueChange={(value) => { setDepartment(value); setDoctorId(""); setTimeSlot(""); }}>
              <SelectTrigger><SelectValue placeholder={t.department} /></SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={doctorId} onValueChange={(value) => { setDoctorId(value); setTimeSlot(""); }}>
              <SelectTrigger><SelectValue placeholder={t.doctor} /></SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger><SelectValue placeholder={t.slot} /></SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleBookAppointment}>{t.book}</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Doctor Name",
                    "Department",
                    "Available Time",
                    "Status",
                  ].map((header) => (
                    <th key={header} className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-3 text-foreground font-medium">{doctor.displayName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{doctor.department}</td>
                    <td className="py-3 px-3 text-muted-foreground">{doctor.availableTime}</td>
                    <td className="py-3 px-3">
                      <span className={statusClassMap[doctor.availabilityStatus] || "status-chip status-chip-info"}>{doctor.availabilityStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDoctors.length === 0 && <p className="text-sm text-muted-foreground py-4">No doctors available for selected department yet.</p>}
          </div>
        </div>

        <form className="card-medical space-y-4" onSubmit={handleAnalyze}>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t.patientHealthForm}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Input placeholder="Full Name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
            <Input placeholder="Age" type="number" min={1} value={form.age} onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))} required />
            <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Textarea
              placeholder="Symptoms"
              className="min-h-[100px]"
              value={form.symptoms}
              onChange={(event) => setForm((prev) => ({ ...prev, symptoms: event.target.value }))}
              required
            />
            <Button type="button" variant="outline" size="sm" className="absolute bottom-3 right-3" onClick={handleVoiceInput}>
              <Mic className="h-4 w-4 mr-1" />
              {isListening ? "Listening..." : t.voice}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input placeholder="Blood Pressure (e.g. 140/90)" value={form.bloodPressure} onChange={(event) => setForm((prev) => ({ ...prev, bloodPressure: event.target.value }))} required />
            <Input placeholder="Heart Rate" value={form.heartRate} onChange={(event) => setForm((prev) => ({ ...prev, heartRate: event.target.value }))} required />
            <Input placeholder="Temperature" value={form.temperature} onChange={(event) => setForm((prev) => ({ ...prev, temperature: event.target.value }))} required />
          </div>

          <Input placeholder="Pre-existing Conditions" value={form.conditions} onChange={(event) => setForm((prev) => ({ ...prev, conditions: event.target.value }))} />

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Medical Document
            </label>
            <Input
              type="file"
              onChange={(event) => setForm((prev) => ({ ...prev, documentName: event.target.files?.[0]?.name ?? "" }))}
            />
            {form.documentName && <p className="text-xs text-muted-foreground">Selected: {form.documentName}</p>}
          </div>

          <Button className="w-full" type="submit">{t.analyze}</Button>
        </form>

        {analysisResult && (
          <div className="space-y-4">
            <div className="card-medical space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t.aiResult}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 border border-border text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Level</p>
                  <RiskBadge level={analysisResult.riskLevel} />
                </div>
                <div className="rounded-lg p-4 border border-border text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommended Department</p>
                  <p className="text-lg font-bold text-primary">{analysisResult.recommendedDepartment}</p>
                </div>
                <div className="rounded-lg p-4 border border-border text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confidence Score</p>
                  <p className="text-lg font-bold text-primary">{analysisResult.confidence.toFixed(1)}%</p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Prediction Explanation</p>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  {analysisResult.explanations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {analysisResult.riskLevel === "HIGH" && (
              <div className="alert-urgent rounded-lg p-5">
                <p className="font-bold text-lg">URGENT MEDICAL ALERT</p>
                <p className="text-sm mt-1 text-foreground">Please visit the hospital immediately.</p>
              </div>
            )}
          </div>
        )}

        <div className="card-medical space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Patient Analytics Graph</h2>
          {patientAnalyses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No personal health data yet. Submit your health form to see charts.</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground mb-2">Patient Symptom Distribution</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={symptomDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground mb-2">Patient Risk Level Graph</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" innerRadius={45} outerRadius={80}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground mb-2">Vitals Trend Graph</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={vitalsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="index" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip {...chartTooltipStyle} />
                    <Line type="monotone" dataKey="heartRate" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="temperature" stroke="hsl(var(--warning))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPortal;
