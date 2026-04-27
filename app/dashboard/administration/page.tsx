"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  UsersIcon,
  Building2Icon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";

const adminSections = [
  {
    title: "Users",
    description: "Manage user accounts, roles, and permissions",
    href: "/dashboard/administration/users",
    icon: UsersIcon,
    color: "bg-blue-500",
  },
  {
    title: "Organizations",
    description: "Manage organizations and team members",
    href: "/dashboard/administration/organizations",
    icon: Building2Icon,
    color: "bg-purple-500",
  },
  {
    title: "Roles & Permissions",
    description: "Configure roles and access control",
    href: "/dashboard/administration/roles",
    icon: ShieldIcon,
    color: "bg-emerald-500",
    disabled: true,
  },
  {
    title: "Settings",
    description: "System configuration and preferences",
    href: "/dashboard/administration/settings",
    icon: SettingsIcon,
    color: "bg-slate-500",
    disabled: true,
  },
];

export default function AdministrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
        <p className="text-muted-foreground">
          Manage your application settings and resources
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;

          const cardContent = (
            <>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.color} text-white`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
            </>
          );

          if (section.disabled) {
            return (
              <Card
                key={section.title}
                className="cursor-not-allowed opacity-60"
              >
                <CardContent className="pt-6">{cardContent}</CardContent>
              </Card>
            );
          }

          return (
            <Link key={section.title} href={section.href}>
              <Card className="transition-all hover:border-primary/50 hover:shadow-md cursor-pointer h-full">
                <CardContent className="pt-6">{cardContent}</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
