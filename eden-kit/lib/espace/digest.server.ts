/**
 * Construction du « point de la semaine » d'Eden — le suivi proactif entre
 * deux sessions. À partir des tâches ouvertes d'un dirigeant, produit le texte
 * d'une notification in-app et d'un courriel, dans la voix d'Eden.
 *
 * Logique : on n'écrit que s'il y a quelque chose d'utile à dire —
 * des actions en retard, ou le rituel du lundi avec des actions de la semaine.
 */

import { daysUntil, dueLabel, isOpen, isOverdue, type Task } from "./tasks";

export type WeeklyDigest = {
  overdueCount: number;
  weekCount: number;
  notificationTitle: string;
  notificationBody: string;
  emailSubject: string;
  emailText: string;
};

const MAX_LISTED = 5;

export function buildWeeklyDigest(opts: {
  displayName: string;
  tasks: Task[];
  isMonday: boolean;
  siteUrl: string;
}): WeeklyDigest | null {
  const { displayName, tasks, isMonday, siteUrl } = opts;

  const overdue = tasks
    .filter(isOverdue)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const week = tasks
    .filter((t) => isOpen(t) && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Rien d'utile à dire : pas de retard, et (hors lundi) pas de rituel.
  if (overdue.length === 0 && !isMonday) return null;
  if (overdue.length === 0 && week.length === 0) return null;

  const chatUrl = `${siteUrl.replace(/\/$/, "")}/espace/chat`;

  const notificationTitle =
    overdue.length > 0
      ? overdue.length === 1
        ? "1 action en attente"
        : `${overdue.length} actions en attente`
      : "Votre point de la semaine";
  const notificationBody =
    overdue.length > 0
      ? "Eden peut vous aider à les débloquer ou à les reprogrammer."
      : `${week.length} action${week.length > 1 ? "s" : ""} cette semaine — on fait le point ?`;

  const emailSubject =
    overdue.length > 0
      ? overdue.length === 1
        ? "Une action vous attend chez Nedexia"
        : `${overdue.length} actions vous attendent chez Nedexia`
      : `Votre semaine chez Nedexia — ${week.length} priorité${week.length > 1 ? "s" : ""}`;

  const lines: string[] = [`Bonjour ${displayName},`, ""];

  if (isMonday && overdue.length === 0) {
    lines.push(
      "On entame une nouvelle semaine. Voici ce qui compte pour vous d'ici sept jours :"
    );
  } else if (overdue.length > 0) {
    lines.push(
      overdue.length === 1
        ? "Une action a dépassé son échéance. Pas de pression — voyons ce qui a coincé :"
        : "Quelques actions ont dépassé leur échéance. Pas de pression — voyons ce qui a coincé :"
    );
  }
  lines.push("");

  if (overdue.length > 0) {
    for (const t of overdue.slice(0, MAX_LISTED)) {
      lines.push(`• ${t.title} — ${dueLabel(t.dueDate).toLowerCase()}`);
    }
    if (overdue.length > MAX_LISTED) {
      lines.push(`… et ${overdue.length - MAX_LISTED} autre(s).`);
    }
    lines.push("");
  }

  if (isMonday && week.length > 0) {
    if (overdue.length > 0) lines.push("Et cette semaine :");
    for (const t of week.slice(0, MAX_LISTED)) {
      lines.push(`• ${t.title} — ${dueLabel(t.dueDate).toLowerCase()}`);
    }
    lines.push("");
  }

  lines.push(
    "Un pas à la fois. Ouvrez votre espace, on en parle :",
    chatUrl,
    "",
    "— Eden, votre tuteur Nedexia"
  );

  return {
    overdueCount: overdue.length,
    weekCount: week.length,
    notificationTitle,
    notificationBody,
    emailSubject,
    emailText: lines.join("\n"),
  };
}
