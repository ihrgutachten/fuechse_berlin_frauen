import Link from "next/link";
import { signOutTippspiel } from "@/lib/tippspiel-actions";
import { TIPPSPIEL_LOGIN_HREF } from "@/lib/callback-path";

type Props = {
  email?: string | null;
  nickname?: string | null;
  admin?: boolean;
};

export function SessionBar({ email, nickname, admin }: Props) {
  if (!email) {
    return (
      <Link
        href={TIPPSPIEL_LOGIN_HREF}
        className="inline-flex rounded-[var(--fb-radius)] bg-[var(--fb-green-500)] px-3 py-1.5 text-sm font-semibold uppercase text-[var(--fb-green-950)] transition hover:bg-[var(--fb-green-300)]"
      >
        Einloggen
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <p className="text-white/80">
        {nickname ? (
          <>
            <span className="font-semibold text-white">{nickname}</span>
            <span className="text-white/50"> · {email}</span>
          </>
        ) : (
          email
        )}
      </p>
      {admin ? (
        <Link href="/admin" className="font-semibold text-[var(--fb-green-300)] hover:underline">
          Admin
        </Link>
      ) : null}
      <form action={signOutTippspiel}>
        <button
          type="submit"
          className="font-semibold text-white/70 transition hover:text-white"
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}
