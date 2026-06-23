"use client";

import { useUserSession } from "@/hooks/use-user-session";
import { NavMain } from "./nav-main";

import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  ShieldIcon,
  SquareTerminal,
  GlobeIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

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
    title: "roles",
    url: "/dashboard/administration/roles",
    icon: ShieldIcon,
  },
  {
    title: "OAuth Apps",
    url: "/dashboard/administration/oauth",
    icon: GlobeIcon,
  },
  {
    title: "Settings",
    url: "#",
  },
];

const placeholderSections = [
  {
    title: "Models",
    url: "#",
    icon: Bot,
    items: [
      { title: "Genesis", url: "#" },
      { title: "Explorer", url: "#" },
      { title: "Quantum", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
];

export function NavMainContainer() {
  const { data } = useUserSession();
  const role = data?.user?.role;

  const navMain = [
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
    ...placeholderSections,
  ];

  return <NavMain items={navMain} />;
}
