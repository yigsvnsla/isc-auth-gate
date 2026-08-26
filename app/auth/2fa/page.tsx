import { OAuthTwoFactorForm } from "@/components/oauth-two-factor-form";
import { Suspense } from "react";

export default function AuthTwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <OAuthTwoFactorForm />
    </Suspense>
  );
}
