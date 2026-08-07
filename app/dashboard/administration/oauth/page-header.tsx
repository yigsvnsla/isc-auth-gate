export const PageHeader = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">OAuth Apps</h1>
      <p className="text-sm text-muted-foreground">
        Manage third-party OAuth 2.1 clients and user consents
      </p>
    </div>
  );
};
