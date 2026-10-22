"use client";

import { useActionState, useState } from "react";
import { completeOnboarding } from "./actions";
import { CitySelect } from "@/components/city-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "client", label: "I want to hire a creative" },
  { value: "creative", label: "I'm a creative" },
] as const;

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboarding, undefined);
  const [role, setRole] = useState<string>("");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Welcome! Tell us about you</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <RadioGroup
          name="role"
          required
          value={role}
          onValueChange={(value) => setRole(String(value))}
          className="gap-3"
        >
          {ROLES.map((option) => (
            // A real <label> so tapping anywhere on the card picks the role.
            <label
              key={option.value}
              className={cn(
                "flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 text-base font-medium transition-colors",
                role === option.value ? "border-primary bg-primary/5" : "border-input",
              )}
            >
              <RadioGroupItem value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <CitySelect name="city" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="flex gap-2">
            <span className="flex h-11 items-center rounded-lg border bg-muted px-3 text-muted-foreground">
              +91
            </span>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile number"
              required
              className="h-11"
            />
          </div>
        </div>
        {state?.error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="h-11 w-full">
          {pending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
