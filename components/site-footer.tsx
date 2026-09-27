export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 py-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Trial App</p>
        <p>Find and book creatives near you.</p>
        <p>&copy; {year} Trial App</p>
      </div>
    </footer>
  )
}
