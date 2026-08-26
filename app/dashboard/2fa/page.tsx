import { DashboardTwoFactorForm } from "@/components/dashboard-two-factor-form";
import { Suspense } from "react";

export default function DashboardTwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <DashboardTwoFactorForm />
    </Suspense>
  );
}
