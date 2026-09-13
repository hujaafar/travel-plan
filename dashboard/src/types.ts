export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TRAVEL_MANAGER" | "VIEWER";
  status: string;
  created_at: string;
  csrf?: string;
};
declare global {
  interface Window {
    TRAVEL_PLAN_ASSETS?: Record<string, string>;
    TRAVEL_PLAN_PREVIEW?: boolean;
  }
}
export const photo = (key: string) =>
  window.TRAVEL_PLAN_ASSETS?.[key] || "/images/" + key + ".jpg";
export type Stop = {
  destination: string;
  country: string;
  activities: string;
  accommodation: string;
  transportation: string;
};
export type Travel = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  price: number;
  capacity: number;
  description: string;
  image: string;
  stops: Stop[];
  participantIds: string[];
  version: number;
};
export type Gateway = {
  id: string;
  name: string;
  provider: string;
  currency: string;
  enabled: boolean;
  configured: boolean;
  mode: string;
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export const date = (
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) =>
  new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString(
    "en-US",
    options,
  );
export const initials = (value: string) =>
  value
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const matchesTravel = (travel: Travel, search: string) =>
  [travel.title, ...travel.stops.map((s) => s.destination + " " + s.country)]
    .join(" ")
    .toLowerCase()
    .includes(search.toLowerCase());
export const csvCell = (v: unknown) =>
  '"' +
  String(v)
    .replace(/^[=+@\-]/, "'$&")
    .replaceAll('"', '""') +
  '"';
