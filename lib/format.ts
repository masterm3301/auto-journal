const relative = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
const fullDate = new Intl.DateTimeFormat("ar-MA-u-ca-gregory", {
  dateStyle: "long",
});

export function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) return relative.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relative.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) <= 7) return relative.format(diffDays, "day");
  return fullDate.format(date);
}

export function formatFullDate(date: Date): string {
  return fullDate.format(date);
}

export function todayArabic(): string {
  return new Intl.DateTimeFormat("ar-MA-u-ca-gregory", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}
