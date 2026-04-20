import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { useId } from "react";

export const UsersDataTableSkeleton = () => {
  const elementId: string = useId();
  const height: number = 10;
  const width: number = 3;
  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: width }).map((_, i) => (
                <TableHead key={`${elementId}-${i}`}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              <TableHead>
                <Skeleton className="mx-auto h-4 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: height }).map((_, i) => (
              <TableRow key={`${elementId}-${i}`}>
                {Array.from({ length: width }).map((_, i) => (
                  <TableCell key={`${elementId}-${i}`}>
                    <Skeleton className="h-4 my-2 w-full" />
                  </TableCell>
                ))}

                <TableCell>
                  <div className="flex gap-2 mx-auto w-fit">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-17.5 rounded-md" />
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
};
