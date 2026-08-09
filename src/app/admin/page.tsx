import { auth, signOut } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
        Backend
      </p>
      <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Admin
      </h1>
      <p className="mt-3 text-sm text-[var(--fb-text-muted)]">
        Angemeldet als <strong>{session?.user?.email}</strong>
      </p>
      <p className="mt-6 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-6 text-sm text-[var(--fb-text-muted)]">
        Magic-Link-Login steht. Hier kommen später Bestellungen, Inhalte und weitere
        Backend-Funktionen hin.
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--fb-accent)]"
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}