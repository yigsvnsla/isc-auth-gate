import { Checkbox } from "@/components/ui/checkbox";
import { OAuthClient } from "@better-auth/oauth-provider";
import { ColumnDef } from "@tanstack/react-table";

export const AuthClientsTableColumns: ColumnDef<OAuthClient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={Boolean(
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        )}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "",
    
  },
];
