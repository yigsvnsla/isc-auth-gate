import { AuthConsentsTable } from "./page-consents-table";
import { AuthConsentsPageHeader } from "./page-consents-header";

// Tab de consents usando la API nativa de Better Auth (getConsents):
// muestra los consents del usuario logueado (el plugin filtra por sesión).
export const AuthConsentsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AuthConsentsPageHeader />

      <AuthConsentsTable />
    </div>
  );
};
