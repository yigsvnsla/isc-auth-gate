import { AuthResourcesTable } from "./page-resources-table";
import { AuthResourcesPageHeader } from "./page-resources-header";

export const AuthResourcesPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AuthResourcesPageHeader />

      <AuthResourcesTable />
    </div>
  );
};