"use client";

import { ColumnDef } from "@tanstack/react-table";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MonitorIcon, SmartphoneIcon, GlobeIcon, ClockIcon } from "lucide-react";

function getDeviceIcon(userAgent: string) {
  if (userAgent?.includes("iPhone") || userAgent?.includes("Android")) return SmartphoneIcon;
  if (userAgent?.includes("Mac") || userAgent?.includes("Windows") || userAgent?.includes("Linux")) return MonitorIcon;
  return MonitorIcon;
}

function getDeviceName(userAgent: string) {
  if (userAgent?.includes("Chrome")) return "Chrome";
  if (userAgent?.includes("Firefox")) return "Firefox";
  if (userAgent?.includes("Safari")) return "Safari";
  if (userAgent?.includes("iPhone")) return "iPhone";
  if (userAgent?.includes("Android")) return "Android";
  if (userAgent?.includes("Mac")) return "MacOS";
  if (userAgent?.includes("Windows")) return "Windows";
  if (userAgent?.includes("Linux")) return "Linux";
  return "Unknown";
}

export const columns: ColumnDef<typeof authClient.$Infer.Session.session>[] = [
  {
    accessorKey: "id",
    header: "Session ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "userAgent",
    header: "Device",
    cell: ({ row }) => {
      const userAgent = row.original.userAgent || "";
      const DeviceIcon = getDeviceIcon(userAgent);
      const deviceName = getDeviceName(userAgent);
      return (
        <div className="flex items-center gap-2">
          <DeviceIcon className="size-4 text-muted-foreground" />
          <span className="text-sm">{deviceName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ipAddress || "—"}</span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const expiresAt = row.original.expiresAt;
      const isExpired = new Date(expiresAt) < new Date();
      return (
        <Badge variant={isExpired ? "destructive" : "secondary"}>
          <ClockIcon data-icon="inline-start" className="size-3" />
          {format(expiresAt, "MMM d, HH:mm")}
        </Badge>
      );
    },
  },
];