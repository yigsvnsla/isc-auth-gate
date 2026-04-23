import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function Page() {
  
  redirect("/dashboard", "replace");

  
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  );
}
