import { Search, Send, MessageCircle } from "lucide-react"

const STEPS = [
  { title: "Browse", text: "Find creatives by category and city.", icon: Search },
  { title: "Request", text: "Send a booking request with your date and details.", icon: Send },
  { title: "Connect", text: "Once accepted, chat directly on WhatsApp.", icon: MessageCircle },
] as const

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-xl font-semibold">How it works</h2>
      <ol className="grid gap-6 sm:grid-cols-3">
        {STEPS.map(({ title, text, icon: Icon }, i) => (
          <li key={title} className="flex gap-4 sm:flex-col sm:gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-medium">
                {i + 1}. {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
