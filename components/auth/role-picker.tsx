import { Camera, Search } from "lucide-react"
import type { Role } from "@/lib/validation"

const OPTIONS = [
  {
    value: "client",
    title: "I want to book creatives",
    text: "Find photographers, singers, editors and artists for your event or project.",
    icon: Search,
  },
  {
    value: "creative",
    title: "I'm a creative",
    text: "Photographer, videographer, singer, artist… list your work and get booked.",
    icon: Camera,
  },
] as const

// Native radios styled as cards, so the choice submits with the form and works without JS.
export function RolePicker({ defaultValue }: { defaultValue?: Role }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">How will you use Trial App?</legend>
      {OPTIONS.map(({ value, title, text, icon: Icon }) => (
        <label
          key={value}
          className="flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        >
          <input
            type="radio"
            name="role"
            value={value}
            defaultChecked={defaultValue === value}
            required
            className="sr-only"
          />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        </label>
      ))}
    </fieldset>
  )
}
