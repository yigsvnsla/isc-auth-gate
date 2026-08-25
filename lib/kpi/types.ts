export interface KpiSummary {
  clientId?: string;
  clientName?: string;
  users: {
    total: number;
    verified: number;
    twoFactorEnabled: number;
    banned: number;
    new7d: number;
    new30d: number;
  };
  loginMethods: Array<{
    providerId: string;
    label: string;
    count: number;
  }>;
  roleBreakdown: Array<{
    role: string;
    count: number;
  }>;
  verificationBreakdown: Array<{
    name: string;
    value: number;
  }>;
  sessions: {
    active: number;
    devices: Array<{
      type: string;
      count: number;
    }>;
  };
  oauth: {
    totalClients: number;
    activeTokens: number;
    totalConsents: number;
    topClients: Array<{
      clientId: string;
      name: string;
      tokenCount: number;
    }>;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean | null;
    banned: boolean | null;
    role: string | null;
    createdAt: Date;
  }>;
  recentSessions: Array<{
    id: string;
    userName: string | null;
    userEmail: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
    createdAt: Date;
    impersonatedBy: string | null;
  }>;
  securityAccounts: Array<{
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    providerId: string;
    category: "oauth" | "password" | "passkey" | "other";
    banned: boolean;
    emailVerified: boolean;
  }>;
}

export type SerializedKpiSummary = Omit<KpiSummary, "recentUsers" | "recentSessions"> & {
  recentUsers: Array<
    Omit<KpiSummary["recentUsers"][number], "createdAt"> & { createdAt: string }
  >;
  recentSessions: Array<
    Omit<KpiSummary["recentSessions"][number], "expiresAt" | "createdAt"> & {
      expiresAt: string;
      createdAt: string;
    }
  >;
};

export interface OAuthClientRef {
  clientId: string;
  name: string;
}
