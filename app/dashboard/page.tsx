"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  UsersIcon,
  ShieldCheckIcon,
  BanIcon,
  MailWarningIcon,
  KeyRoundIcon,
  ActivityIcon,
  AppWindowIcon,
  ClockIcon,
  MoreHorizontalIcon,
  KeySquareIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  CircleUserIcon,
} from "lucide-react";

// Coming Soon: Replace with real API data
const mockUsers = [
  {
    id: "usr_1",
    name: "John Administrator",
    email: "john@iscdomain.com",
    emailVerified: true,
    image: null,
    createdAt: "2025-01-15T10:30:00Z",
    role: "admin",
    banned: false,
  },
  {
    id: "usr_2",
    name: "Sarah Moderator",
    email: "sarah@iscdomain.com",
    emailVerified: true,
    image: null,
    createdAt: "2025-02-20T14:45:00Z",
    role: "moderator",
    banned: false,
  },
  {
    id: "usr_3",
    name: "Mike Developer",
    email: "mike.dev@iscdomain.com",
    emailVerified: true,
    image: null,
    createdAt: "2025-03-10T09:15:00Z",
    role: "user",
    banned: false,
  },
  {
    id: "usr_4",
    name: "Ana Tester",
    email: "ana.test@external.com",
    emailVerified: false,
    image: null,
    createdAt: "2025-04-01T16:20:00Z",
    role: "user",
    banned: false,
  },
  {
    id: "usr_5",
    name: "Blocked User",
    email: "blocked@ispam.com",
    emailVerified: true,
    image: null,
    createdAt: "2025-03-25T11:00:00Z",
    role: "user",
    banned: true,
  },
  {
    id: "usr_6",
    name: "Carlos Support",
    email: "carlos@iscdomain.com",
    emailVerified: true,
    image: null,
    createdAt: "2025-04-10T08:30:00Z",
    role: "user",
    banned: false,
  },
];

// Coming Soon: Replace with real API data
const mockSessions = [
  {
    id: "ses_1",
    userId: "usr_1",
    userName: "John Administrator",
    expiresAt: "2026-04-25T10:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    createdAt: "2025-04-23T10:00:00Z",
  },
  {
    id: "ses_2",
    userId: "usr_2",
    userName: "Sarah Moderator",
    expiresAt: "2026-04-24T14:30:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0",
    createdAt: "2025-04-23T14:30:00Z",
  },
  {
    id: "ses_3",
    userId: "usr_3",
    userName: "Mike Developer",
    expiresAt: "2026-04-25T09:00:00Z",
    ipAddress: "10.0.0.50",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/125.0",
    createdAt: "2025-04-23T09:00:00Z",
  },
  {
    id: "ses_4",
    userId: "usr_1",
    userName: "John Administrator",
    expiresAt: "2026-04-20T08:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Safari/604.1",
    createdAt: "2025-04-20T08:00:00Z",
  },
];

// Coming Soon: Replace with real API data
const mockAccounts = [
  { userId: "usr_1", providerId: "microsoft", providerType: "oauth" },
  { userId: "usr_2", providerId: "microsoft", providerType: "oauth" },
  { userId: "usr_3", providerId: "microsoft", providerType: "oauth" },
  { userId: "usr_3", providerId: "password", providerType: "email" },
  { userId: "usr_4", providerId: "password", providerType: "email" },
  { userId: "usr_5", providerId: "password", providerType: "email" },
  { userId: "usr_6", providerId: "microsoft", providerType: "oauth" },
];

const metrics = {
  totalUsers: mockUsers.length,
  activeSessions: mockSessions.length,
  verifiedEmails: mockUsers.filter((u) => u.emailVerified).length,
  pendingVerification: mockUsers.filter((u) => !u.emailVerified).length,
  bannedUsers: mockUsers.filter((u) => u.banned).length,
  oauthAccounts: mockAccounts.filter((a) => a.providerType === "oauth").length,
  passwordAccounts: mockAccounts.filter((a) => a.providerType === "email").length,
  adminUsers: mockUsers.filter((u) => u.role === "admin").length,
  moderatorUsers: mockUsers.filter((u) => u.role === "moderator").length,
  regularUsers: mockUsers.filter((u) => u.role === "user").length,
};

const roleChartData = [
  { name: "Admin", value: metrics.adminUsers },
  { name: "Moderator", value: metrics.moderatorUsers },
  { name: "User", value: metrics.regularUsers },
];

const verificationChartData = [
  { name: "Verified", value: metrics.verifiedEmails },
  { name: "Pending", value: metrics.pendingVerification },
];

const CHART_COLORS = ["hsl(210, 100%, 50%)", "hsl(160, 100%, 50%)", "hsl(280, 100%, 50%)"];

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-md p-2 ${variantStyles[variant]}`}>
          <Icon className="h-4 w-4" data-icon="inline-start" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeviceName(userAgent: string) {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("iPhone")) return "iPhone";
  if (userAgent.includes("Mac")) return "Mac";
  return "Unknown";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const verifiedPercentage = useMemo(() => {
    if (metrics.totalUsers === 0) return 0;
    return Math.round((metrics.verifiedEmails / metrics.totalUsers) * 100);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Auth BFF Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Enterprise authentication metrics and session management
          </p>
        </div>
        <Separator />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          description="All registered users"
          icon={UsersIcon}
        />
        <MetricCard
          title="Active Sessions"
          value={metrics.activeSessions}
          description="Currently authenticated"
          icon={CircleUserIcon}
          variant="success"
        />
        <MetricCard
          title="Verified Emails"
          value={`${metrics.verifiedEmails} (${verifiedPercentage}%)`}
          description="Email confirmed"
          icon={ShieldCheckIcon}
          variant="success"
        />
        <MetricCard
          title="Pending Verification"
          value={metrics.pendingVerification}
          description="Awaiting confirmation"
          icon={MailWarningIcon}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Banned Users"
          value={metrics.bannedUsers}
          description="Account suspended"
          icon={BanIcon}
          variant="danger"
        />
        <MetricCard
          title="OAuth Accounts"
          value={metrics.oauthAccounts}
          description="Microsoft SSO"
          icon={KeySquareIcon}
        />
        <MetricCard
          title="Password Auth"
          value={metrics.passwordAccounts}
          description="Email/Password"
          icon={AppWindowIcon}
        />
        <MetricCard
          title="Avg Sessions/User"
          value={(metrics.activeSessions / metrics.totalUsers).toFixed(1)}
          description="Sessions ratio"
          icon={ActivityIcon}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roleChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(210, 100%, 50%)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Verification Status</CardTitle>
            <CardDescription>Verified vs pending verification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={verificationChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {verificationChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Users</CardTitle>
              <CardDescription>
                Latest registered users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={user.image ?? undefined} />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : user.emailVerified ? (
                          <Badge variant="secondary">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Sessions</CardTitle>
              <CardDescription>
                Currently active user sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>
                              {getInitials(session.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{session.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDeviceName(session.userAgent)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {session.ipAddress}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ClockIcon className="h-3 w-3" data-icon="inline-start" />
                          {formatDateTime(session.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Security</CardTitle>
              <CardDescription>
                Authentication methods and security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAccounts.map((account, index) => {
                    const user = mockUsers.find((u) => u.id === account.userId);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback>
                                {user ? getInitials(user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              account.providerType === "oauth"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {account.providerType === "oauth" ? "OAuth" : "Password"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {account.providerId}
                        </TableCell>
                        <TableCell>
                          {user?.banned ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : user?.emailVerified ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}