import { ColumnDef } from "@tanstack/react-table";
import { authClient } from "@workspace/auth-config/lib/client";

export const columns: ColumnDef<typeof authClient.$Infer.Session.session>[] = [
  {
    header: "Session Identification",
    cell: ({
      row: {
        original: { id },
      },
    }) => id,
  },
  {
    header: "Impersonated By",
    cell: ({
      row: {
        original: { impersonatedBy },
      },
    }) => impersonatedBy ?? "not definied",
  },
  {
    header: "Internet Protocol Address",
    cell: ({
      row: {
        original: { ipAddress },
      },
    }) => ipAddress || "not definied",
  },
  {
    header: "User Agent",
    cell: ({
      row: {
        original: { userAgent },
      },
    }) => userAgent,
  },
];
