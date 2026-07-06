/**
 * Accès Supabase aux notifications in-app. Lecture/écriture côté serveur
 * (génération sur événements Eden) et client (cloche, marquage lu). RLS.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  rowToNotification,
  type AppNotification,
  type NotificationKind,
} from "./notifications";

const COLUMNS = "id, kind, title, body, href, read, created_at";

export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(rowToNotification);
}

export type NotificationInput = {
  kind: NotificationKind;
  title: string;
  body?: string | null;
  href?: string | null;
};

export async function insertNotification(
  supabase: SupabaseClient,
  userId: string,
  input: NotificationInput
): Promise<AppNotification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToNotification(data);
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  ids?: string[]
): Promise<void> {
  let q = supabase.from("notifications").update({ read: true }).eq("user_id", userId);
  if (ids && ids.length > 0) q = q.in("id", ids);
  else q = q.eq("read", false);
  await q;
}

/**
 * Crée au plus une notification de rappel par fenêtre de `withinHours` heures.
 * Évite de spammer la cloche à chaque chargement de page.
 */
export async function ensureReminder(
  supabase: SupabaseClient,
  userId: string,
  input: NotificationInput,
  withinHours = 12
): Promise<AppNotification | null> {
  const since = new Date(Date.now() - withinHours * 3_600_000).toISOString();
  const { data: recent } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", "reminder")
    .gte("created_at", since)
    .limit(1);
  if (recent && recent.length > 0) return null;
  return insertNotification(supabase, userId, input);
}
