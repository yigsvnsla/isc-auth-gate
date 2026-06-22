"use client";

import { useState, useMemo, useCallback } from "react";
import { accessControl } from "@/lib/permissions";
import {
  useOrganizations,
  useListRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type OrganizationRole,
} from "@/hooks/use-admin-roles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import {
  ShieldIcon,
  PlusIcon,
  RefreshCwIcon,
  PencilIcon,
  Trash2Icon,
  Building2Icon,
} from "lucide-react";

// ponytail: statements del accessControl, tipado como Record para iteración simple
const statements = accessControl.statements as unknown as Record<
  string,
  readonly string[]
>;

const SYSTEM_ROLES = [
  {
    id: "owner",
    role: "owner",
    permission: {
      organization: ["update", "delete"],
      member: ["create", "update", "delete"],
      invitation: ["create", "cancel"],
      team: ["create", "update", "delete"],
      ac: ["create", "read", "update", "delete"],
    },
  },
  {
    id: "admin",
    role: "admin",
    permission: {
      organization: ["update"],
      member: ["create", "update", "delete"],
      invitation: ["create", "cancel"],
      team: ["create", "update", "delete"],
      ac: ["create", "read", "update", "delete"],
    },
  },
  {
    id: "member",
    role: "member",
    permission: { ac: ["read"] },
  },
] as const;

type PermissionMap = Record<string, string[]>;

interface RoleFormData {
  role: string;
  permission: PermissionMap;
}

function permissionCount(perm: PermissionMap): number {
  return Object.values(perm).reduce((sum, actions) => sum + actions.length, 0);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function OrgSelector({
  orgId,
  onOrgChange,
}: {
  orgId: string | undefined;
  onOrgChange: (id: string) => void;
}) {
  const { data, isLoading } = useOrganizations();
  const orgs = data ?? [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        Active Organization
      </label>
      <Select value={orgId ?? null} onValueChange={(v) => onOrgChange(v as string)}>
        <SelectTrigger className="w-full" aria-label="Select organization">
          <SelectValue placeholder="Select an organization" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : orgs.length === 0 ? (
            <SelectItem value="empty" disabled>
              No organizations found
            </SelectItem>
          ) : (
            orgs.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

function PermissionEditor({
  permissions,
  onChange,
}: {
  permissions: PermissionMap;
  onChange: (perm: PermissionMap) => void;
}) {
  const toggle = (stmt: string, action: string) => {
    const current = permissions[stmt] ?? [];
    const has = current.includes(action);
    const next = {
      ...permissions,
      [stmt]: has
        ? current.filter((a) => a !== action)
        : [...current, action],
    };
    if (next[stmt].length === 0) delete next[stmt];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(statements).map(([stmt, actions]) => (
        <Card key={stmt}>
          <CardContent className="p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{stmt}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {permissions[stmt]?.length ?? 0}/{actions.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {actions.map((action) => {
                  const checked = permissions[stmt]?.includes(action) ?? false;
                  return (
                    <label
                      key={action}
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Switch
                        size="sm"
                        checked={checked}
                        onCheckedChange={() => toggle(stmt, action)}
                      />
                      {action}
                    </label>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RoleDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: RoleFormData;
  organizationId: string;
}) {
  const [roleName, setRoleName] = useState(initialData?.role ?? "");
  const [permissions, setPermissions] = useState<PermissionMap>(
    initialData?.permission ?? {},
  );
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    const slug = roleName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    try {
      if (mode === "create") {
        await createRole.trigger({
          organizationId,
          role: slug,
          permission: permissions,
        });
        toast.success(`Role "${slug}" created`);
      } else {
        await updateRole.trigger({
          organizationId,
          roleName: slug,
          data: { permission: permissions },
        });
        toast.success(`Role "${slug}" updated`);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save role",
      );
    }
  };

  const isPending = createRole.isMutating || updateRole.isMutating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a custom role with specific permissions for this organization."
              : "Modify the permissions of this custom role."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. editor, viewer, manager"
              disabled={mode === "edit"}
            />
            <FieldDescription>
              URL-friendly identifier. Use lowercase letters, numbers, and hyphens.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Permissions</span>
          <span className="text-xs text-muted-foreground">
            Toggle actions for each statement. The role will only have access to
            the enabled actions.
          </span>
        </div>

        <PermissionEditor permissions={permissions} onChange={setPermissions} />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Role" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteRoleDialog({
  role,
  organizationId,
  open,
  onOpenChange,
}: {
  role: OrganizationRole | null;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteRole = useDeleteRole();

  const handleConfirm = async () => {
    if (!role) return;
    try {
      await deleteRole.trigger({
        organizationId,
        roleId: role.id,
      });
      toast.success(`Role "${role.role}" deleted`);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete role",
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete role &ldquo;{role?.role}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Members assigned to this role will
            lose their permissions. Predefined roles (owner, admin, member)
            cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {deleteRole.isMutating ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RolesTable({
  roles,
  isLoading,
  onEdit,
  onDelete,
}: {
  roles: OrganizationRole[];
  isLoading: boolean;
  onEdit: (role: OrganizationRole) => void;
  onDelete: (role: OrganizationRole) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SYSTEM_ROLES.map((sys) => (
                <TableRow key={sys.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sys.role}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        system
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(sys.permission).map(([stmt, actions]) => (
                        <Badge
                          key={stmt}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {stmt}:{actions.length}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    Protected
                  </TableCell>
                </TableRow>
              ))}
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <span className="font-medium">{role.role}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permission).map(([stmt, actions]) => (
                        <Badge
                          key={stmt}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {stmt}:{actions.length}
                        </Badge>
                      ))}
                      {permissionCount(role.permission) === 0 && (
                        <span className="text-xs text-muted-foreground">
                          No permissions
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDate(role.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(role)}
                        aria-label={`Edit ${role.role}`}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(role)}
                        aria-label={`Delete ${role.role}`}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No custom roles yet. Click &ldquo;New Role&rdquo; to create
                    one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionsMatrixTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldIcon className="size-4 text-muted-foreground" />
          <div>
            <CardTitle>Available Permissions</CardTitle>
            <CardDescription>
              All statements and actions that can be assigned to custom roles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(statements).map(([stmt, actions]) => (
            <Card key={stmt} className="ring-1 ring-border">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stmt}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {actions.length} actions
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map((action) => (
                      <Badge
                        key={action}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RolesPermissionsPage() {
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationRole | null>(
    null,
  );

  const { data: roles, isLoading, mutate } = useListRoles(orgId);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleNewRole = () => {
    setDialogMode("create");
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEditRole = (role: OrganizationRole) => {
    setDialogMode("edit");
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDeleteRole = (role: OrganizationRole) => {
    setDeleteTarget(role);
  };

  const dialogInitialData = useMemo<RoleFormData | undefined>(() => {
    if (!editingRole) return undefined;
    return {
      role: editingRole.role,
      permission: editingRole.permission,
    };
  }, [editingRole]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage custom roles and access control for organizations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!orgId}
            >
              <RefreshCwIcon data-icon="inline-start" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleNewRole}
              disabled={!orgId}
            >
              <PlusIcon data-icon="inline-start" />
              New Role
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <OrgSelector orgId={orgId} onOrgChange={setOrgId} />

      {orgId ? (
        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">
              <ShieldIcon data-icon="inline-start" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="matrix">
              <Building2Icon data-icon="inline-start" />
              Permissions Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolesTable
              roles={roles ?? []}
              isLoading={isLoading}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
            />
          </TabsContent>

          <TabsContent value="matrix">
            <PermissionsMatrixTab />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Building2Icon className="size-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Select an organization to manage its roles
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Roles are scoped to each organization. Choose one above to get
                  started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={dialogInitialData}
        organizationId={orgId ?? ""}
      />

      <DeleteRoleDialog
        role={deleteTarget}
        organizationId={orgId ?? ""}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
