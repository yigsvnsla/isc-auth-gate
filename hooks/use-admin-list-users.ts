import { authClient } from "@/lib/auth-client";
import useSWR from "swr";

interface UseAdminListUsersArg {
  pageSize: number;
  pageIndex: number;
  searchValue?: string;
  searchField?: string;
  sortBy?: string;
  sortDirection?: string;
}

export const useAdminListUser = (args: UseAdminListUsersArg) => {
  return useSWR(
    [
      "/admin/list-users",
      args.pageSize,
      args.pageIndex,
      args.searchField,
      args.searchValue,
      args.sortBy,
      args.sortDirection,
    ],
    ([
      ,
      limit,
      offset,
      searchField,
      searchValue,
      sortBy = "createdAt",
      sortDirection = "desc",
    ]) => {
      const params = {
        sortBy,
        sortDirection,
        limit,
        offset: offset * limit,
      } as {
        limit: number;
        offset: number;
        searchValue: string | undefined;
        searchField: "email" | "name" | undefined;
        sortBy: string | undefined;
        sortDirection: "asc" | "desc" | undefined;
      };

      if (searchValue && searchValue.length >= 3) {
        params.searchValue = searchValue;
        params.searchField = searchField as (typeof params)["searchField"];
      }

      return authClient.admin.listUsers({
        fetchOptions: { throw: true },
        query: { ...params, searchOperator: "contains" },
      });
    },
    {
      fallbackData: {
        users: [],
        limit: 10,
        offset: 0,
        total: 0,
      },
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );
};
