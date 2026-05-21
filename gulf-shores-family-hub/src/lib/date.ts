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

export function formatTimeLabel(time: string): string {
  const [rawHours, rawMinutes] = time.split(":").map(Number);

  if (!Number.isFinite(rawHours) || !Number.isFinite(rawMinutes)) {
    return time;
  }

  const period = rawHours >= 12 ? "PM" : "AM";
  const displayHours = rawHours % 12 || 12;
  const displayMinutes = String(rawMinutes).padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${period}`;
}

export function getTimeOptions(stepMinutes = 15): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = Math.floor(minutes / 60);
    const minutePart = minutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutePart).padStart(2, "0")}`;
    options.push({ value, label: formatTimeLabel(value) });
  }

  return options;
}
