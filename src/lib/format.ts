export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatMatchDate(iso: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatScenarioDay(iso: string) {
  const parts = berlinDateParts(iso);
  return `${parts.day}.${parts.month}.${parts.year}`;
}

export function formatScenarioTime(iso: string) {
  const parts = berlinDateParts(iso);
  return `${parts.hour}:${parts.minute}`;
}

function berlinDateParts(iso: string) {
  const stamp = new Date(iso).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" });
  const [datePart, timePart = "00:00:00"] = stamp.split(" ");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return { year, month, day, hour, minute };
}
