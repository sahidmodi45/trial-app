"use client"

import { useActionState } from "react"
import { createProfile, type OnboardingState } from "@/app/onboarding/actions"
import { RolePicker } from "@/components/auth/role-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CITIES } from "@/lib/cities"
import type { Role } from "@/lib/validation"

type Props = { next: string; defaultName: string; defaultRole?: Role }

export function OnboardingForm({ next, defaultName, defaultRole }: Props) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createProfile, {})
  const errors = state.fieldErrors ?? {}

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <RolePicker defaultValue={defaultRole} />
        <FieldError messages={errors.role} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          className="h-11 text-base"
          aria-invalid={!!errors.name}
        />
        <FieldError messages={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <select
          id="city"
          name="city"
          required
          defaultValue=""
          aria-invalid={!!errors.city}
          className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        >
          <option value="" disabled>
            Choose your city
          </option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <FieldError messages={errors.city} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  )
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return <p className="mt-1 text-sm text-destructive">{messages[0]}</p>
}
