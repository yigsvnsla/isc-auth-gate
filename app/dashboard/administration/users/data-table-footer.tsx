import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminListUser } from "@/hooks/adminListUsers";
import { useAtom } from "jotai";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRightIcon,
} from "lucide-react";
import { FC } from "react";

export const UserListDataTableFooter: FC = () => {
  const [params, setParams] = useAtom(paramListUsersAtom);
  const { data } = useAdminListUser(params);
  const totalPages = Math.ceil((data.total || 0) / params.pageSize);
  const canPreviousPage = params.pageIndex > 0;
  const canNextPage = params.pageIndex < totalPages - 1 && data.users.length === params.pageSize;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 ">
      <div className="text-muted-foreground flex-1 text-sm">
        {data.total} total usuario(s)
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${params.pageSize}`}
            onValueChange={(value) => {
              setParams((prev) => ({
                ...prev,
                pageSize: Number(value),
                pageIndex: 0,
              }));
            }}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={params.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Page {params.pageIndex + 1} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setParams((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              setParams((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              setParams((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() =>
              setParams((prev) => ({
                ...prev,
                pageIndex: totalPages - 1,
              }))
            }
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
