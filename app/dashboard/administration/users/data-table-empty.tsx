import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { UsersIcon, RefreshCcwIcon, UserPlus2Icon } from "lucide-react";
import { FC } from "react";

export const UserListDataTableEmpty: FC = () => {
  return (
    <Empty className="h-[calc(10*52px)]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle className="capitalize">list users is empty</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="grid sm:grid-cols-2 ">
        <Button variant="outline">
          <RefreshCcwIcon data-icon="inline-start" />
          Refresh
        </Button>
        <Button variant="secondary">
          <UserPlus2Icon data-icon="inline-start" />
          Create new User
        </Button>
      </EmptyContent>
    </Empty>
  );
};
