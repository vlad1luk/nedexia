/**
 * Mémoire du tuteur Eden — notes durables prises au fil des conversations.
 * `sommet` et `humain` sont des singletons (une note remplacée à chaque mise
 * à jour) ; `entreprise`, `fait` et `preference` s'accumulent.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type EdenNoteKind =
  | "sommet"
  | "humain"
  | "entreprise"
  | "fait"
  | "preference";

export type EdenNote = {
  id: string;
  kind: EdenNoteKind;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const EDEN_NOTE_KINDS: EdenNoteKind[] = [
  "sommet",
  "humain",
  "entreprise",
  "fait",
  "preference",
];

/** Genres pour lesquels une seule note est conservée (remplacée à la mise à jour). */
const SINGLETON_KINDS: EdenNoteKind[] = ["sommet", "humain"];

const COLUMNS = "id, kind, content, created_at, updated_at";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToNote(row: any): EdenNote {
  return {
    id: row.id,
    kind: row.kind as EdenNoteKind,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listEdenNotes(
  supabase: SupabaseClient,
  userId: string
): Promise<EdenNote[]> {
  const { data } = await supabase
    .from("eden_notes")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []).map(rowToNote);
}

/**
 * Enregistre une note. Pour les genres singletons (sommet, humain), la note
 * existante du même genre est remplacée.
 */
export async function saveEdenNote(
  supabase: SupabaseClient,
  userId: string,
  kind: EdenNoteKind,
  content: string
): Promise<EdenNote | null> {
  if (SINGLETON_KINDS.includes(kind)) {
    const { data: existing } = await supabase
      .from("eden_notes")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", kind)
      .limit(1)
      .maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from("eden_notes")
        .update({ content })
        .eq("id", existing.id)
        .eq("user_id", userId)
        .select(COLUMNS)
        .maybeSingle();
      if (error || !data) return null;
      return rowToNote(data);
    }
  }

  const { data, error } = await supabase
    .from("eden_notes")
    .insert({ user_id: userId, kind, content })
    .select(COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToNote(data);
}

export async function deleteEdenNote(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
): Promise<void> {
  await supabase
    .from("eden_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);
}
