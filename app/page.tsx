import { Hero } from "@/components/landing/hero"
import { CategoryTiles } from "@/components/landing/category-tiles"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CreatorCta } from "@/components/landing/creator-cta"

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryTiles />
      <HowItWorks />
      <CreatorCta />
    </>
  )
}
