import { Suspense } from "react";
import { UsersDataTableContainer } from "./data-table-container";
import { UsersDataTableSkeleton } from "./data-table-skeleton";

export default function Page() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <h2 className="text-sm text-accent-foreground">Manage your users</h2>
      </div>

      <Suspense fallback={<UsersDataTableSkeleton />}>
        <UsersDataTableContainer />
      </Suspense>
    </>
  );
}
