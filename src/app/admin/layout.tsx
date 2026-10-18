import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!session.user.admin) redirect("/tools/tippspiel");
  return <div className="min-h-screen bg-[var(--fb-soft)] text-[var(--fb-ink)]">{children}</div>;
}
