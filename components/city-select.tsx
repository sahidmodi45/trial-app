import { ChevronDown } from "lucide-react"

import { CITIES } from "@/lib/cities"

// A native <select> so it works without JavaScript and submits with any form.
export function CitySelect({
  name,
  defaultValue,
  required,
  includeAll,
}: {
  name: string
  defaultValue?: string
  required?: boolean
  includeAll?: boolean
}) {
  const value = defaultValue ?? ""

  return (
    <div className="relative w-full">
      <select
        id={name}
        name={name}
        defaultValue={value}
        required={required}
        className="h-11 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 pr-9 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
      >
        {includeAll ? (
          <option value="">All cities</option>
        ) : (
          !value && (
            <option value="" disabled>
              Select your city
            </option>
          )
        )}
        {CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
