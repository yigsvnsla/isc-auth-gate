"use client";

import { FC } from "react";
import { UsersDataTableSkeleton } from "./data-table-skeleton";
import { UsersDataTable } from "./data-table";
import { columns } from "./columns";
import { authClient } from "@workspace/auth-config/lib/client";
import useSWR from "swr";

export const UsersDataTableContainer: FC = () => {
  return <UsersDataTable />;

  // return isLoading ? (
  //   <UsersDataTableSkeleton />
  // ) : (
  // );
};
