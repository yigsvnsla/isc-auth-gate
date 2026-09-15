"use client";

import { useUserSession } from "@/hooks/use-user-session";
import { NavMain } from "./nav-main";

import {
  SquareTerminal,
  GlobeIcon,
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  KeyRound,
  PhoneIcon,
  MonitorIcon,
  Building2Icon,
} from "lucide-react";

const securityItem = {
  title: "security",
  url: "/dashboard/settings/security",
  icon: ShieldCheckIcon,
};

const apiKeysItem = {
  title: "api keys",
  url: "/dashboard/settings/api-keys",
  icon: KeyRound,
};

const phoneItem = {
  title: "phone",
  url: "/dashboard/settings/phone",
  icon: PhoneIcon,
};

const sessionsItem = {
  title: "sessions",
  url: "/dashboard/settings/sessions",
  icon: MonitorIcon,
};

const orgApiKeysItem = {
  title: "org api keys",
  url: "/dashboard/settings/org-api-keys",
  icon: Building2Icon,
};

const adminItems = [
  {
    title: "users",
    url: "/dashboard/administration/users",
    icon: UserIcon,
  },
  {
    title: "organizations",
    url: "/dashboard/administration/organizations",
    icon: UsersIcon,
  },
  {
    title: "OAuth Apps",
    url: "/dashboard/administration/oauth",
    icon: GlobeIcon,
  },
];

export function NavMainContainer() {
  const { data } = useUserSession();
  const role = data?.user?.role;

  const navMain = [
    securityItem,
    apiKeysItem,
    phoneItem,
    sessionsItem,
    orgApiKeysItem,
    ...(role === "admin"
      ? [
          {
            title: "administration",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: adminItems,
          },
        ]
      : []),
  ];

  return <NavMain items={navMain} />;
}
