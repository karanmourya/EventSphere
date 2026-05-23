export function formatDate(dateStr: string, timezone?: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  });
}

export function formatTime(dateStr: string, timezone?: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export function formatDateRange(
  start: string,
  end: string,
  timezone?: string
): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();

  if (sameDay) {
    return `${formatDate(start, timezone)} · ${formatTime(start, timezone)} – ${formatTime(end, timezone)}`;
  }

  return `${formatDate(start, timezone)} – ${formatDate(end, timezone)}`;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}
