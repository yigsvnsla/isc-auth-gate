import { AuthClientsTable } from "./page-clients-table";
import { AuthClientsPageHeader } from "./page-clients-header";

export const AuthClientsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AuthClientsPageHeader />

      <AuthClientsTable />
    </div>
  );
};
