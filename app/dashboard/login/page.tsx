import { CommandIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DashboardLoginForm } from "@/app/dashboard/login/form-login";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { headers as NextHeaders } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLoginPage() {
  try {
    const headers = await NextHeaders();
    const session = await auth.api.getSession({ headers });
    if (session) redirect("/dashboard");
  } catch {
    // DB unreachable — show login page anyway
  }

  return (
    <main className="flex min-h-svh flex-col p-6 md:p-10">
      <header className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 font-semibold lg:hidden">
          <div className="bg-accent  flex aspect-square size-8 items-center justify-center rounded-lg">
            <CommandIcon className="size-4" />
          </div>
          ISC Gate — Panel
        </div>
        <ThemeToggle />
      </header>

      <div className="w-full max-w-sm mx-auto my-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500 motion-reduce:animate-none">
        <Card className="p-6 shadow-sm lg:ring-0! lg:border-0 lg:bg-transparent lg:shadow-none lg:p-0">
          <DashboardLoginForm />
        </Card>
      </div>
    </main>
  );
}
