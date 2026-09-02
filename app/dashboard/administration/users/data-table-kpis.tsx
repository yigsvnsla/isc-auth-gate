import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UsersIcon,
  CircleCheckIcon,
  MailWarningIcon,
  BanIcon,
} from "lucide-react";
import { useAdminListUser } from "@/hooks/use-admin-list-users";
import { FC } from "react";

export const UserListDataTableKpis: FC = () => {
  const { data, isLoading } = useAdminListUser({
    pageIndex: 0,
    pageSize: 1,
    searchField: "",
    searchValue: "",
  });

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <UsersIcon className="size-4.5 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Total Users
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold tabular-nums">{data.total}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CircleCheckIcon className="size-4.5 text-emerald-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">Active</p>
            <p className="text-xl font-bold tabular-nums">---</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <MailWarningIcon className="size-4.5 text-amber-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Pending Verification
            </p>
            <p className="text-xl font-bold tabular-nums">---</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
            <BanIcon className="size-4.5 text-rose-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">Banned</p>
            <p className="text-xl font-bold tabular-nums">---</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
