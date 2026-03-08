import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

const variantStyles = {
  default: "border-border",
  danger: "stat-card-danger",
  warning: "stat-card-warning",
  success: "stat-card-success",
};

const iconVariantStyles = {
  default: "icon-soft-primary",
  danger: "icon-soft-danger",
  warning: "icon-soft-warning",
  success: "icon-soft-success",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className={`stat-card ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-primary mt-1">{trend}</p>}
        </div>
        <div className={`p-2 rounded-lg ${iconVariantStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
