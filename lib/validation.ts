import { z } from "zod"
import { CITIES } from "@/lib/cities"

// Rules mirror the CHECK constraints in the profiles migration, so a form
// error shows here instead of as a database error after submit.

export const profileSchema = z.object({
  role: z.enum(["client", "creative"], { error: "Choose client or creative" }),
  full_name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(60, { error: "Name must be at most 60 characters" }),
  city: z.enum(CITIES, { error: "Choose a city from the list" }),
})

// role is fixed after onboarding (the update grant leaves it out), so edits omit it.
export const profileUpdateSchema = profileSchema.omit({ role: true })

// People type numbers as "98765 43210", "+91 98765-43210" or "098765...".
// Accept those, then store the one format the database allows: +91XXXXXXXXXX.
export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, { error: "Enter a 10-digit Indian mobile number" }))
  .transform((digits) => `+91${digits}`)

export const contactSchema = z.object({
  phone: phoneSchema,
})

export type ProfileInput = z.infer<typeof profileSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ContactInput = z.infer<typeof contactSchema>
