"use client";

import { Separator } from "@/components/ui/separator";
import { PageHeader } from "./page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthClientsPage } from "./page-clients";

// interface OAuthClient {
//   client_id: string;
//   client_secret?: string;
//   client_name?: string;
//   redirect_uris: string[];
//   disabled?: boolean;
//   skip_consent?: boolean;
//   client_id_issued_at?: number;
// }

// interface OAuthConsent {
//   id: string;
//   clientId: string;
//   scopes?: string[];
//   createdAt?: string;
// }

// function formatDate(dateStr: string | undefined): string {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// }

// function useOAuthClients() {
//   return useSWR("/oauth2/clients", async () => {
//     const { data, error } = await authClient.oauth2.getClients();
//     if (error) throw new Error(error.message ?? "Failed to fetch clients");
//     return data as unknown as OAuthClient[];
//   });
// }

// function useOAuthConsents() {
//   return useSWR("/oauth2/consents", async () => {
//     const { data, error } = await authClient.oauth2.getConsents();
//     if (error) throw new Error(error.message ?? "Failed to fetch consents");
//     return data as unknown as OAuthConsent[];
//   });
// }

// function useDeleteOAuthClient() {
//   return useSWRMutation(
//     "/oauth2/delete-client",
//     async (_key: string, { arg }: { arg: { client_id: string } }) => {
//       const { error } = await authClient.oauth2.deleteClient(arg);
//       if (error) throw new Error(error.message ?? "Failed to delete client");
//     },
//   );
// }

// function useRotateClientSecret() {
//   return useSWRMutation(
//     "/oauth2/rotate-secret",
//     async (
//       _key: string,
//       { arg }: { arg: { client_id: string } },
//     ): Promise<OAuthClient> => {
//       const { data, error } = await authClient.oauth2.client.rotateSecret(arg);
//       if (error) throw new Error(error.message ?? "Failed to rotate secret");
//       return data as unknown as OAuthClient;
//     },
//   );
// }

// // function CreateClientDialog({
// //   open,
// //   onOpenChange,
// //   onCreated,
// // }: {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// //   onCreated: () => void;
// // }) {
// //   const [name, setName] = useState("");
// //   const [redirectUris, setRedirectUris] = useState("");
// //   const [createdSecret, setCreatedSecret] = useState<string | null>(null);

// //   const createMutation = useSWRMutation(
// //     "/oauth2/create-client",
// //     async (
// //       _key: string,
// //       {
// //         arg,
// //       }: {
// //         arg: { client_name: string; redirect_uris: string[] };
// //       },
// //     ) => {
// //       const { data, error } = await authClient.oauth2.createClient(arg);
// //       if (error) throw new Error(error.message ?? "Failed to create client");
// //       return data as unknown as OAuthClient & { clientSecret: string };
// //     },
// //   );

// //   const handleSubmit = async () => {
// //     const uris = redirectUris
// //       .split("\n")
// //       .map((u) => u.trim())
// //       .filter(Boolean);
// //     if (uris.length === 0) {
// //       toast.error("At least one redirect URI is required");
// //       return;
// //     }
// //     try {
// //       const result = await createMutation.trigger({
// //         client_name: name || "Unnamed Client",
// //         redirect_uris: uris,
// //       });
// //       setCreatedSecret(result.clientSecret);
// //       toast.success(`Client "${name || result.clientId}" created`);
// //     } catch (err) {
// //       toast.error(err instanceof Error ? err.message : "Failed to create");
// //     }
// //   };

// //   const handleClose = () => {
// //     if (!createdSecret) {
// //       setCreatedSecret(null);
// //       setName("");
// //       setRedirectUris("");
// //       onOpenChange(false);
// //     }
// //   };

// //   if (createdSecret) {
// //     return (
// //       <Dialog open={open} onOpenChange={handleClose}>
// //         <DialogContent className="sm:max-w-lg">
// //           <DialogHeader>
// //             <DialogTitle>Client created</DialogTitle>
// //             <DialogDescription>
// //               Save the client secret now. It won&apos;t be shown again.
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="flex flex-col gap-3">
// //             <Field>
// //               <FieldLabel>Client ID</FieldLabel>
// //               <Input value={createdSecret ? name || "—" : ""} readOnly />
// //             </Field>
// //             <Field>
// //               <FieldLabel>Client Secret</FieldLabel>
// //               <div className="flex gap-2">
// //                 <Input
// //                   value={createdSecret}
// //                   readOnly
// //                   className="font-mono text-xs"
// //                 />
// //                 <CopyButton value={createdSecret} />
// //               </div>
// //             </Field>
// //           </div>
// //           <DialogFooter>
// //             <Button
// //               onClick={() => {
// //                 setCreatedSecret(null);
// //                 setName("");
// //                 setRedirectUris("");
// //                 onOpenChange(false);
// //                 onCreated();
// //               }}
// //             >
// //               Done
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     );
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={handleClose}>
// //       <DialogContent className="sm:max-w-lg">
// //         <DialogHeader>
// //           <DialogTitle>Create OAuth Client</DialogTitle>
// //           <DialogDescription>
// //             Register a new OAuth 2.1 client application.
// //           </DialogDescription>
// //         </DialogHeader>
// //         <FieldGroup>
// //           <Field>
// //             <FieldLabel htmlFor="client-name">Client Name</FieldLabel>
// //             <Input
// //               id="client-name"
// //               value={name}
// //               onChange={(e) => setName(e.target.value)}
// //               placeholder="My App"
// //             />
// //           </Field>
// //           <Field>
// //             <FieldLabel htmlFor="redirect-uris">
// //               Redirect URIs <span className="text-destructive">*</span>
// //             </FieldLabel>
// //             <textarea
// //               id="redirect-uris"
// //               className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
// //               value={redirectUris}
// //               onChange={(e) => setRedirectUris(e.target.value)}
// //               placeholder="https://app.example.com/callback"
// //               rows={3}
// //             />
// //             <p className="text-xs text-muted-foreground mt-1">
// //               One URI per line
// //             </p>
// //           </Field>
// //         </FieldGroup>
// //         <DialogFooter>
// //           <Button variant="outline" onClick={handleClose}>
// //             Cancel
// //           </Button>
// //           <Button onClick={handleSubmit} disabled={createMutation.isMutating}>
// //             {createMutation.isMutating ? "Creating..." : "Create Client"}
// //           </Button>
// //         </DialogFooter>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }

// function CopyButton({ value }: { value: string }) {
//   const [copy] = useCopyToClipboard();
//   return (
//     <Button
//       variant="outline"
//       size="icon"
//       onClick={() => {
//         copy(value);
//         toast.success("Copied");
//       }}
//       aria-label="Copy"
//     >
//       <CopyIcon />
//     </Button>
//   );
// }

// function ConsentRow({
//   consent,
//   onDelete,
// }: {
//   consent: OAuthConsent;
//   onDelete: (consent: OAuthConsent) => void;
// }) {
//   return (
//     <TableRow>
//       <TableCell className="font-mono text-xs">{consent.clientId}</TableCell>
//       <TableCell>
//         <div className="flex flex-wrap gap-1">
//           {consent.scopes?.map((s) => (
//             <Badge key={s} variant="secondary" className="text-[10px]">
//               {s}
//             </Badge>
//           ))}
//         </div>
//       </TableCell>
//       <TableCell className="text-sm text-muted-foreground">
//         {formatDate(consent.createdAt)}
//       </TableCell>
//       <TableCell>
//         <Button
//           variant="ghost"
//           size="icon-sm"
//           onClick={() => onDelete(consent)}
//           aria-label="Revoke consent"
//         >
//           <Trash2Icon />
//         </Button>
//       </TableCell>
//     </TableRow>
//   );
// }

// function ConsentsTab() {
//   const { data: consents, isLoading, mutate } = useOAuthConsents();
//   const [deleteTarget, setDeleteTarget] = useState<OAuthConsent | null>(null);

//   const deleteConsentMutation = useSWRMutation(
//     "/oauth2/delete-consent",
//     async (_key: string, { arg }: { arg: { id: string } }) => {
//       const { error } = await authClient.oauth2.deleteConsent({ id: arg.id });
//       if (error) throw new Error(error.message ?? "Failed to revoke consent");
//     },
//   );

//   const handleDeleteConsent = async () => {
//     if (!deleteTarget) return;
//     try {
//       await deleteConsentMutation.trigger({ id: deleteTarget.id });
//       toast.success("Consent revoked");
//       setDeleteTarget(null);
//       mutate();
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Failed to revoke");
//     }
//   };

//   return (
//     <Card>
//       <CardContent className="p-0">
//         {isLoading ? (
//           <div className="flex flex-col gap-2 p-4">
//             {Array.from({ length: 3 }).map((_, i) => (
//               <Skeleton key={i} className="h-10 w-full" />
//             ))}
//           </div>
//         ) : consents && consents.length > 0 ? (
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Client ID</TableHead>
//                   <TableHead>Scopes</TableHead>
//                   <TableHead>Granted</TableHead>
//                   <TableHead className="w-[80px]">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {consents.map((consent) => (
//                   <ConsentRow
//                     key={consent.id}
//                     consent={consent}
//                     onDelete={setDeleteTarget}
//                   />
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-2 py-12 text-center">
//             <KeyRoundIcon className="size-8 text-muted-foreground" />
//             <p className="text-sm text-muted-foreground">
//               No consents granted yet. Consents appear after a user authorizes a
//               third-party app.
//             </p>
//           </div>
//         )}
//       </CardContent>

//       <AlertDialog
//         open={deleteTarget !== null}
//         onOpenChange={(o) => !o && setDeleteTarget(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Revoke consent?</AlertDialogTitle>
//             <AlertDialogDescription>
//               The third-party app will lose access to the authorized scopes. The
//               user may need to re-authorize on next login.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDeleteConsent}>
//               {deleteConsentMutation.isMutating ? "Revoking..." : "Revoke"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </Card>
//   );
// }

const tabs = [
  {
    title: "clients",
    content: <AuthClientsPage />,
  },
];

export default function OAuthAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader />

      <Separator />

      <Tabs defaultValue="account">
        <TabsList>
          {tabs.map(({ title }, index) => {
            return (
              <TabsTrigger key={`${index}-${title}`} value={title}>
                {title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map(({ title, content }, index) => {
          return (
            <TabsContent key={`${index}-${title}`} value={title}>
              {content}
            </TabsContent>
          );
        })}
      </Tabs>

    </div>
  );
}
