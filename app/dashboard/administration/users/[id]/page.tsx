"use client";

import { authClient } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { shortName } from "@/lib/utils";
import {
  ChevronLeftIcon,
  CopyIcon,
  MailIcon,
  CalendarIcon,
  ShieldHalfIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  KeyRoundIcon,
  MonitorIcon,
  SmartphoneIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  RefreshCcwIcon,
  UserIcon,
  ListIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  Trash2Icon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "@/components/ui/sonner";

import { format, formatDistanceToNowStrict } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Coming Soon: Replace with real API data
const mockActivityLog = [
  { action: "Logged in", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), ip: "192.168.1.100", device: "Chrome on Windows" },
  { action: "Updated profile", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), ip: "192.168.1.100", device: "Chrome on Windows" },
  { action: "Password changed", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), ip: "192.168.1.100", device: "Chrome on Windows" },
  { action: "Logged in", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), ip: "10.0.0.50", device: "Safari on MacOS" },
  { action: "Account created", timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), ip: "192.168.1.100", device: "Chrome on Windows" },
];

function getDeviceIcon(userAgent: string) {
  if (userAgent.includes("iPhone") || userAgent.includes("Android")) return SmartphoneIcon;
  if (userAgent.includes("Mac") || userAgent.includes("Windows") || userAgent.includes("Linux")) return MonitorIcon;
  return MonitorIcon;
}

export default function UserIdPage() {
  const [copy] = useCopyToClipboard();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: userInfo, isLoading: userLoading } = useSWR(
    ["/admin/get-user", id],
    async (args) => {
      const [, userId] = args;
      return authClient.admin.getUser({
        query: { id: userId },
        fetchOptions: { throw: true },
      });
    },
    { fallbackData: {} as ReturnType<typeof authClient.admin.getUser> }
  );

  const { data: sessionsInfo, isLoading: sessionsLoading } = useSWR(
    ["/admin/list-user-sessions", id],
    async (args) => {
      const [, userId] = args;
      return authClient.admin.listUserSessions(
        { userId },
        { throw: true }
      );
    },
    { fallbackData: { sessions: [] } as ReturnType<typeof authClient.admin.listUserSessions> }
  );

  function copyToClipboard(value: string) {
    return () => {
      copy(value);
      toast.success("Copied to clipboard");
    };
  }

  const activeSessionsCount = sessionsInfo?.sessions?.filter(
    (s: Awaited<ReturnType<typeof authClient.admin.listUserSessions>>["sessions"][number]) => new Date(s.expiresAt) > new Date()
  ).length || 0;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard/administration" />}>Administration</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard/administration/users" />}>Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{userInfo?.name || "Loading..."}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex gap-4 lg:flex-1">
          <Avatar className="size-16 lg:size-20">
            <AvatarImage src={userInfo?.image || undefined} alt={userInfo?.name} />
            <AvatarFallback className="text-xl lg:text-2xl">
              {shortName(String(userInfo?.name || ""))}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
              {userLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                userInfo?.name
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userLoading ? <Skeleton className="h-4 w-40" /> : userInfo?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {userLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <>
                  {userInfo?.banned ? (
                    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                      <CircleXIcon data-icon="inline-start" className="size-3" />
                      Blocked
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <CircleCheckIcon data-icon="inline-start" className="size-3" />
                      Active
                    </Badge>
                  )}
                  {userInfo?.emailVerified ? (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      <CircleCheckIcon data-icon="inline-start" className="size-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <CircleXIcon data-icon="inline-start" className="size-3" />
                      Unverified
                    </Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    <ShieldHalfIcon data-icon="inline-start" className="size-3" />
                    {userInfo?.role || "user"}
                  </Badge>
                </>
              )}
            </div>
            {!userLoading && userInfo?.createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Member since {format(userInfo.createdAt, "MMMM d, yyyy")}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 lg:shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                <MoreHorizontalIcon data-icon="inline-start" className="size-4" />
                Actions
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem>
                <RefreshCcwIcon data-icon="inline-start" className="size-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MailIcon data-icon="inline-start" className="size-4" />
                Send Verification
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger render={<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600 focus:text-rose-600" />}>
                    <Trash2Icon data-icon="inline-start" className="size-4" />
                    Delete User
                  </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All user data including sessions and accounts will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                      Delete User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSessionsCount}</div>
                <p className="text-xs text-muted-foreground">Currently authenticated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Linked Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">OAuth & password</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Login</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h ago</div>
                <p className="text-xs text-muted-foreground">Active session</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Summary</CardTitle>
              <CardDescription>Quick overview of user information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <UserIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="grid gap-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">User ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {userInfo?.id || "—"}
                    </p>
                    {userInfo?.id && (
                      <Button variant="ghost" size="icon" className="size-6" onClick={copyToClipboard(userInfo.id)}>
                        <CopyIcon className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <MailIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="grid gap-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground truncate">{userInfo?.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="grid gap-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {userInfo?.createdAt ? format(userInfo.createdAt, "MMM d, yyyy") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <ShieldHalfIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="grid gap-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-xs text-muted-foreground capitalize">{userInfo?.role || "user"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>User account details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <UserIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">User Identification</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {userInfo?.id || "—"}
                    </p>
                    <Button variant="ghost" size="icon" className="size-6" onClick={copyToClipboard(userInfo?.id || "")}>
                      <CopyIcon className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <MailIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {userInfo?.email || "—"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="size-6" onClick={copyToClipboard(userInfo?.email || "")}>
                  <CopyIcon className="size-3" />
                </Button>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <CalendarIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {userInfo?.createdAt ? format(userInfo.createdAt, "MMM d, yyyy HH:mm:ss") : "—"}
                  </p>
                  {userInfo?.createdAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNowStrict(userInfo.createdAt, { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <CalendarIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {userInfo?.updatedAt ? format(userInfo.updatedAt, "MMM d, yyyy HH:mm:ss") : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">User Sessions</CardTitle>
                  <CardDescription>Active authentication sessions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCcwIcon data-icon="inline-start" className="size-4" />
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsInfo?.sessions?.length > 0 ? (
                    sessionsInfo.sessions.map((session: Awaited<ReturnType<typeof authClient.admin.listUserSessions>>["sessions"][number]) => {
                      const DeviceIcon = getDeviceIcon(session.userAgent);
                      const isExpired = new Date(session.expiresAt) < new Date();
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DeviceIcon className="size-4 text-muted-foreground" />
                              <span className="text-sm">{session.userAgent.split(" ")[0]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{session.ipAddress || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {session.updatedAt ? formatDistanceToNowStrict(session.updatedAt, { addSuffix: true }) : "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? "destructive" : "secondary"}>
                              {format(session.expiresAt, "MMM d, HH:mm")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="size-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50" />}>
                                    <Trash2Icon className="size-3" />
                                  </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke session?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This user will be signed out from this device.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No active sessions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Password</CardTitle>
                <CardDescription>Authentication method status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <KeyRoundIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCcwIcon data-icon="inline-start" className="size-4" />
                  Reset Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription>Extra security layer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <ShieldCheckIcon className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">2FA Status</p>
                      <p className="text-xs text-muted-foreground">Not configured</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-600/20">Not Enabled</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Connected Accounts</CardTitle>
                <CardDescription>OAuth and linked authentication methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#0078d4]/10">
                        <GlobeIcon className="size-5 text-[#0078d4]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Microsoft SSO</p>
                        <p className="text-xs text-muted-foreground">Connected Jan 15, 2025</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-emerald-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <KeyRoundIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-xs text-muted-foreground">Primary authentication</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">API Keys</CardTitle>
                <CardDescription>Programmatic access credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <KeyRoundIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium font-mono">key_abc123...fgh456</p>
                        <p className="text-xs text-muted-foreground">Created Mar 10, 2025</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="size-7">
                        <CopyIcon className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-rose-600 hover:text-rose-700">
                        <Trash2Icon className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4">
                  <KeyRoundIcon data-icon="inline-start" className="size-4" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>Recent user actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityLog.map((log, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{log.device}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{log.ip}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClockIcon className="size-3" />
                          {formatDistanceToNowStrict(log.timestamp, { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangleIcon className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {userInfo?.banned ? (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10" />}>
                    <CircleCheckIcon data-icon="inline-start" className="size-4" />
                    Unban User
                  </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unban {userInfo?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This user will be able to sign in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Unban User</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" className="border-amber-500/20 text-amber-600 hover:bg-amber-500/10" />}>
                  <AlertTriangleIcon data-icon="inline-start" className="size-4" />
                  Ban User
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ban {userInfo?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This user will not be able to sign in until unbanned.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-amber-600 hover:bg-amber-700">Ban User</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
<AlertDialogTrigger render={<Button variant="outline" className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10" />}>
                    <Trash2Icon data-icon="inline-start" className="size-4" />
                    Delete User
                  </AlertDialogTrigger>
                  <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All user data including sessions and accounts will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}