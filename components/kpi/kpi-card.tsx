import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactElement } from "react";

type Variant = "default" | "success" | "warning" | "danger";

const variantStyles: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: ReactElement | React.ComponentType<{ className?: string }>;
  variant?: Variant;
}) {
  const IconComponent = Icon as React.ComponentType<{ className?: string }>;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-md p-2 ${variantStyles[variant]}`}>
          <IconComponent className="h-4 w-4" data-icon="inline-start" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
