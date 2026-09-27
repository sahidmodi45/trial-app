import Link from "next/link"
import { Camera, Video, Film, Palette } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const CATEGORIES = [
  { slug: "photographer", name: "Photographer", icon: Camera },
  { slug: "videographer", name: "Videographer", icon: Video },
  { slug: "editor", name: "Editor", icon: Film },
  { slug: "artist", name: "Artist", icon: Palette },
] as const

export function CategoryTiles() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="mb-4 text-xl font-semibold">Browse by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map(({ slug, name, icon: Icon }) => (
          <Link key={slug} href={`/browse?category=${slug}`}>
            <Card className="items-center gap-2 py-6 text-center transition-colors hover:bg-muted">
              <CardContent className="flex flex-col items-center gap-2 px-4">
                <Icon className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium">{name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
