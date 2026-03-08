export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface TriageInput {
  symptoms: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  conditions: string;
}

export interface TriageResult {
  riskLevel: RiskLevel;
  recommendedDepartment: string;
  confidence: number;
  explanations: string[];
}

export const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Pulmonology",
  "General Medicine",
  "Orthopedics",
  "Gastroenterology",
] as const;

const keywordRules = [
  {
    keywords: ["chest pain", "chest tightness", "palpitation", "heart"],
    department: "Cardiology",
    score: 4,
    explanation: "Cardiac symptom pattern detected.",
  },
  {
    keywords: ["headache", "blurred vision", "dizziness", "faint"],
    department: "Neurology",
    score: 3,
    explanation: "Neurological warning symptom detected.",
  },
  {
    keywords: ["cough", "breathlessness", "wheezing", "shortness of breath"],
    department: "Pulmonology",
    score: 3,
    explanation: "Respiratory symptom pattern detected.",
  },
  {
    keywords: ["knee pain", "joint pain", "swelling", "fracture"],
    department: "Orthopedics",
    score: 2,
    explanation: "Musculoskeletal symptom pattern detected.",
  },
  {
    keywords: ["abdominal", "nausea", "vomit", "stomach"],
    department: "Gastroenterology",
    score: 2,
    explanation: "Gastrointestinal symptom pattern detected.",
  },
  {
    keywords: ["fever", "fatigue", "body ache", "weakness"],
    department: "General Medicine",
    score: 1,
    explanation: "General systemic symptom detected.",
  },
] as const;

const parseBloodPressure = (value: string) => {
  const match = value.match(/(\d{2,3})\s*\/?\s*(\d{2,3})?/);

  if (!match) {
    return { systolic: 0, diastolic: 0 };
  }

  return {
    systolic: Number(match[1] || 0),
    diastolic: Number(match[2] || 0),
  };
};

const parseNumber = (value: string) => {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function analyzeTriage(input: TriageInput): TriageResult {
  const normalizedSymptoms = input.symptoms.toLowerCase();
  const normalizedConditions = input.conditions.toLowerCase();

  const departmentScore: Record<string, number> = {
    Cardiology: 0,
    Neurology: 0,
    Pulmonology: 0,
    "General Medicine": 0,
    Orthopedics: 0,
    Gastroenterology: 0,
  };

  const explanations: string[] = [];
  let score = 0;

  keywordRules.forEach((rule) => {
    if (rule.keywords.some((keyword) => normalizedSymptoms.includes(keyword))) {
      departmentScore[rule.department] += rule.score;
      score += rule.score;
      explanations.push(rule.explanation);
    }
  });

  const { systolic, diastolic } = parseBloodPressure(input.bloodPressure);
  const heartRate = parseNumber(input.heartRate);
  const temperature = parseNumber(input.temperature);

  if (systolic >= 160 || diastolic >= 100) {
    score += 3;
    departmentScore.Cardiology += 3;
    explanations.push("Severely elevated blood pressure detected.");
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 2;
    departmentScore.Cardiology += 2;
    explanations.push("Elevated blood pressure detected.");
  }

  if (heartRate >= 120) {
    score += 2;
    explanations.push("High heart rate detected.");
  } else if (heartRate >= 100) {
    score += 1;
    explanations.push("Mild heart rate elevation detected.");
  }

  if (temperature >= 102) {
    score += 2;
    departmentScore["General Medicine"] += 2;
    explanations.push("High temperature detected.");
  } else if (temperature >= 100.4) {
    score += 1;
    departmentScore["General Medicine"] += 1;
    explanations.push("Mild fever detected.");
  }

  if (["diabetes", "hypertension", "heart disease", "stroke"].some((condition) => normalizedConditions.includes(condition))) {
    score += 1;
    explanations.push("Pre-existing risk condition detected.");
  }

  const recommendedDepartment =
    Object.entries(departmentScore).sort((a, b) => b[1] - a[1])[0]?.[1] > 0
      ? Object.entries(departmentScore).sort((a, b) => b[1] - a[1])[0][0]
      : "General Medicine";

  const riskLevel: RiskLevel = score >= 8 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW";
  const confidence = Math.min(98, Math.max(62, 64 + score * 4));

  return {
    riskLevel,
    recommendedDepartment,
    confidence,
    explanations: explanations.length > 0 ? Array.from(new Set(explanations)).slice(0, 4) : ["No critical risk markers detected."],
  };
}
