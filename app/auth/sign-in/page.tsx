import { GridPattern } from "@/components/ui/grid-pattern";
import { LoginForm } from "@/components/login-form";
import { cn } from "@/lib/utils";
import { CommandIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <GridPattern
        className={cn(
          "mask-[radial-gradient(300px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-70%] h-[200%] skew-y-12 scale-150 opacity-40 dark:opacity-80",
        )}
      />
      <div className="grid min-h-svh w-full grid-cols-1 absolute">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex w-full justify-between">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <CommandIcon className="size-4" />
              </div>
              ISC Gate
            </a>
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
