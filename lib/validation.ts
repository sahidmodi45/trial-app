import { z } from "zod"
import { CITIES } from "@/lib/cities"

const email = z.email({ error: "Enter a valid email" })

export const signUpSchema = z
  .object({
    email,
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }),
})

// "+91 98765 43210", "098765 43210" and "9876543210" all become +919876543210,
// the one format the database allows.
const phone = z
  .string()
  .transform((s) => s.replace(/\s/g, "").replace(/^(\+91|0)/, ""))
  .pipe(z.string().regex(/^[6-9][0-9]{9}$/, { error: "Enter a valid 10-digit Indian mobile number" }))
  .transform((digits) => `+91${digits}`)

export const onboardingSchema = z.object({
  role: z.enum(["client", "creative"]),
  full_name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(60, { error: "Name must be 60 characters or fewer" }),
  city: z.enum(CITIES, { message: "Select a city" }),
  phone,
})
