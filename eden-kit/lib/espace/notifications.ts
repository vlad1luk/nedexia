/** Notifications in-app Nedexia — types, libellés et mapping. */

export type NotificationKind =
  | "task"
  | "document"
  | "score"
  | "opportunity"
  | "contact"
  | "reminder"
  | "info";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    kind: (row.kind as NotificationKind) ?? "info",
    title: row.title,
    body: row.body ?? null,
    href: row.href ?? null,
    read: Boolean(row.read),
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Étiquette relative de temps en français québécois. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
  });
}
