interface RiskBadgeProps {
  level: "HIGH" | "MEDIUM" | "LOW";
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const styles = {
    HIGH: "risk-high",
    MEDIUM: "risk-medium",
    LOW: "risk-low",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {level}
    </span>
  );
}
