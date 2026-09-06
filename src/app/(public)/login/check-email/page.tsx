import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-[var(--fb-gutter)] py-16">
      <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
        Konto
      </p>
      <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight text-[var(--fb-ink)]">
        E-Mail prüfen
      </h1>
      <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
        Wenn die Adresse stimmt, findest du den Magic-Link in deinem Posteingang.
        Der Link ist nur kurz gültig und nur einmal nutzbar.
      </p>
      <Link
        href="/login"
        className="mt-8 text-sm font-semibold text-[var(--fb-accent)] hover:underline"
      >
        Zurück zum Login
      </Link>
    </div>
  );
}
