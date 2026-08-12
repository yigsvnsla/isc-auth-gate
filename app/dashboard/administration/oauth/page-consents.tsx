import { GlobalAuthConsentsTable } from "./page-consents-global-table";
import { AuthConsentsPageHeader } from "./page-consents-header";

// Variant A (default): vista global de consents de todos los usuarios vía
// endpoint propio /api/admin/consents. Variant B (nativa de Better Auth,
// consents del usuario logueado) vive en page-consents-table.tsx.
export const AuthConsentsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AuthConsentsPageHeader />

      <GlobalAuthConsentsTable />
    </div>
  );
};
