"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { Building2Icon } from "lucide-react";
import { format } from "date-fns";
import { shortName } from "@/lib/utils";
import { useListAllOauthClientsQuery } from "./list-all-clients-query";

export const AuthAllClientsPage = () => {
  const { data, isLoading, error, mutate } = useListAllOauthClientsQuery();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="grid gap-1.5">
            <CardTitle>All Apps</CardTitle>
            <CardDescription>
              Vista de solo lectura: aplicaciones de plataforma y de
              organizaciones. Gestiona cada app desde su contexto.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "No se pudo cargar la lista"}
          </p>
        ) : !data?.length ? (
          <Empty>
            <EmptyContent>
              <p className="text-sm text-muted-foreground">
                No hay aplicaciones registradas todavía.
              </p>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Creada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.clientId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={row.icon ?? undefined}
                            alt={row.name ?? row.clientId}
                          />
                          <AvatarFallback>
                            {shortName(row.name ?? row.clientId)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid min-w-0">
                          <span className="truncate text-sm font-medium">
                            {row.name ?? "Sin nombre"}
                          </span>
                          <span className="truncate font-mono text-xs text-muted-foreground">
                            {row.clientId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.referenceId ? (
                        <Badge variant="secondary" className="gap-1">
                          <Building2Icon
                            data-icon="inline-start"
                            className="size-3"
                          />
                          {row.orgName ?? "Org"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Plataforma</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.referenceId ? "—" : (row.ownerEmail ?? "—")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={row.disabled ? "destructive" : "secondary"}
                      >
                        {row.disabled ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {row.createdAt
                        ? format(new Date(row.createdAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
