"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold">Pagina non trovata</h1>
      <p className="max-w-md text-muted-foreground">
        La pagina che cerchi potrebbe essere stata spostata oppure non esiste.
        Torna alla home per continuare a usare il calcolatore.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Torna alla home
      </Link>
    </main>
  )
}
