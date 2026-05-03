import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UsersIcon,
  CircleCheckIcon,
  MailWarningIcon,
  BanIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import useSWR from "swr";

export const DataTableKpis = () => {
  const { data, isLoading } = useSWR(
    "/admin/users/kpis",
    async () => {
      const listUsers = await authClient.admin.listUsers({
        fetchOptions: { throw: true },
        query: { limit: 1, offset: 0 },
      });
      return { total: listUsers.total || 0 };
    },
    { fallbackData: { total: 0 } },
  );

  const totalUsers = data?.total ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UsersIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{totalUsers}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-emerald-500">---</span> this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CircleCheckIcon className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active
              </p>
              <p className="text-2xl font-bold">---</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">---% of total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <MailWarningIcon className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Verification
              </p>
              <p className="text-2xl font-bold">---</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Awaiting email confirmation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
              <BanIcon className="size-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Banned
              </p>
              <p className="text-2xl font-bold">---</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Account suspended
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
