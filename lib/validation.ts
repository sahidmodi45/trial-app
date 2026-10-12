import { z } from "zod"
import { CITIES } from "@/lib/cities"

export const ROLES = ["client", "creative"] as const
export type Role = (typeof ROLES)[number]

export const PROVIDERS = ["google", "facebook"] as const
export type Provider = (typeof PROVIDERS)[number]

export const socialLoginSchema = z.object({
  provider: z.enum(PROVIDERS),
  role: z.enum(ROLES).optional(),
  next: z.string().optional(),
})

export const onboardingSchema = z.object({
  role: z.enum(ROLES, { error: "Choose how you'll use Trial App" }),
  name: z.string().trim().min(2, "Enter your name").max(60, "Keep it under 60 characters"),
  city: z.enum(CITIES, { error: "Choose your city" }),
  next: z.string().optional(),
})
