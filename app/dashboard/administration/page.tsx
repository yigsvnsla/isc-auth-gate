"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { UsersIcon, Building2Icon, GlobeIcon } from "lucide-react";

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
    description: "Manage organizations, members, and their roles",
    href: "/dashboard/administration/organizations",
    icon: Building2Icon,
    color: "bg-purple-500",
  },
  {
    title: "OAuth Apps",
    description: "Manage third-party OAuth clients and consents",
    href: "/dashboard/administration/oauth",
    icon: GlobeIcon,
    color: "bg-indigo-500",
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
