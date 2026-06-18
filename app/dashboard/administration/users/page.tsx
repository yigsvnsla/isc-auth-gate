"use client";

import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";
import { RefreshCwIcon, PlusIcon } from "lucide-react";
import { UserListDataTableKpis } from "./data-table-kpis";
import { UserListDataTableHeader } from "./data-table-header";
import { UserListDataTableFooter } from "./data-table-footer";
import { UserListDataTable } from "./data-table";
import { UserListDataTableBatching } from "./data-table-batching";
import { useAtom } from "jotai";
import { useAdminListUser } from "@/hooks/use-admin-list-users";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathName = usePathname();
  const [params] = useAtom(paramListUsersAtom);

  const { mutate } = useAdminListUser(params);

  const refreshTable = () => {
    mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage authentication and access for all users
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshTable}>
              <RefreshCwIcon data-icon="inline-start" className="size-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href={`${pathName}/create`}>
                  <PlusIcon data-icon="inline-start" className="size-4" />
                  New User
                </Link>
              }
            />
          </div>
        </div>
      </div>
      <Separator />
      <UserListDataTableKpis />
      <UserListDataTableHeader />
      <UserListDataTableBatching />
      <UserListDataTable />
      <UserListDataTableFooter />
    </div>
  );
}
