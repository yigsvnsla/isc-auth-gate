import { Card } from "@/components/ui/card";
import {
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { AuthClientsTableColumns } from "./page-clients-table-columns";
import { useState } from "react";
import { OAuthClient } from "@better-auth/oauth-provider";

export const AuthClientsTable = () => {
  const [rowSelection, setRowSelection] = useState<Required<OAuthClient>>({
    
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    columns: AuthClientsTableColumns,
    data: [],
    rowCount: 0,
    manualPagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      rowSelection,
    },
  });

  return <Card></Card>;
};
