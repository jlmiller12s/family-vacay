export function toIsoDate(date: Date): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = local.getTimezoneOffset();
  const adjusted = new Date(local.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export function formatLongDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export function getTripDays(startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const days: string[] = [];

  for (let date = start; date <= end; date = addDays(date, 1)) {
    days.push(toIsoDate(date));
  }

  return days;
}

export function getCurrentTripDay(startDate: string, endDate: string): string {
  const today = toIsoDate(new Date());
  const days = getTripDays(startDate, endDate);

  if (days.includes(today)) {
    return today;
  }

  return days[0] ?? today;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
