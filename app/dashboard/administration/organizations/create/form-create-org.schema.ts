import z from "zod";

export const formCreateOrganizationBasicSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(128, "Organization name must be less than 128 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters"),
  logo: z.url("Logo must be a valid URL").optional(),
});

export const formCreateOrganizationDetailsSchema = z.object({
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  website: z.url("Website must be a valid URL").optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  industry: z
    .enum([
      "technology",
      "finance",
      "healthcare",
      "education",
      "manufacturing",
      "retail",
      "other",
    ])
    .optional(),
  orgSize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
  country: z
    .enum(["us", "ec", "mx", "co", "es", "ar", "cl", "pe", "br", "other"])
    .optional(),
});

export const formCreateOrganizationSettingsSchema = z.object({
  defaultRole: z.enum(["member", "admin"]).optional(),
  allowInvitations: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});
