/**
 * Accès Supabase au CRM (contacts + opportunités). Partagé serveur (Eden,
 * chargement de page) et client (onglets CRM). Toutes les opérations passent
 * par RLS (auth.uid()).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  rowToContact,
  rowToOpportunity,
  type Contact,
  type ContactType,
  type CrmPriority,
  type CrmSource,
  type Opportunity,
  type OpportunityStage,
  type OpportunityType,
} from "./crm";

const CONTACT_COLUMNS =
  "id, name, title, organization, contact_type, email, phone, notes, priority, next_action, next_action_date, last_contacted_at, source, created_at, updated_at";
const OPP_COLUMNS =
  "id, title, opp_type, stage, value, contact_id, project_id, notes, priority, next_action, expected_close_date, probability, source, created_at, updated_at";

// ─────────────── Contacts ───────────────

export async function listContacts(
  supabase: SupabaseClient,
  userId: string
): Promise<Contact[]> {
  const { data } = await supabase
    .from("contacts")
    .select(CONTACT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToContact);
}

export type ContactInput = {
  name: string;
  title?: string | null;
  organization?: string | null;
  contactType?: ContactType;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  priority?: CrmPriority;
  nextAction?: string | null;
  nextActionDate?: string | null;
  lastContactedAt?: string | null;
};

export async function insertContact(
  supabase: SupabaseClient,
  userId: string,
  input: ContactInput,
  source: CrmSource = "user"
): Promise<Contact | null> {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: userId,
      name: input.name,
      title: input.title ?? null,
      organization: input.organization ?? null,
      contact_type: input.contactType ?? "autre",
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      priority: input.priority ?? "normal",
      next_action: input.nextAction ?? null,
      next_action_date: input.nextActionDate ?? null,
      last_contacted_at: input.lastContactedAt ?? null,
      source,
    })
    .select(CONTACT_COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToContact(data);
}

export async function updateContact(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  patch: Partial<ContactInput>
): Promise<Contact | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.organization !== undefined) row.organization = patch.organization;
  if (patch.contactType !== undefined) row.contact_type = patch.contactType;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.nextAction !== undefined) row.next_action = patch.nextAction;
  if (patch.nextActionDate !== undefined) row.next_action_date = patch.nextActionDate;
  if (patch.lastContactedAt !== undefined) row.last_contacted_at = patch.lastContactedAt;

  const { data, error } = await supabase
    .from("contacts")
    .update(row)
    .eq("id", contactId)
    .eq("user_id", userId)
    .select(CONTACT_COLUMNS)
    .maybeSingle();
  if (error || !data) return null;
  return rowToContact(data);
}

export async function deleteContact(
  supabase: SupabaseClient,
  userId: string,
  contactId: string
): Promise<void> {
  await supabase.from("contacts").delete().eq("id", contactId).eq("user_id", userId);
}

// ─────────────── Opportunités ───────────────

export async function listOpportunities(
  supabase: SupabaseClient,
  userId: string
): Promise<Opportunity[]> {
  const { data } = await supabase
    .from("opportunities")
    .select(OPP_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToOpportunity);
}

export type OpportunityInput = {
  title: string;
  oppType?: OpportunityType;
  stage?: OpportunityStage;
  value?: number | null;
  contactId?: string | null;
  projectId?: string | null;
  notes?: string | null;
  priority?: CrmPriority;
  nextAction?: string | null;
  expectedCloseDate?: string | null;
  probability?: number | null;
};

export async function insertOpportunity(
  supabase: SupabaseClient,
  userId: string,
  input: OpportunityInput,
  source: CrmSource = "user"
): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: userId,
      title: input.title,
      opp_type: input.oppType ?? "commerce",
      stage: input.stage ?? "qualification",
      value: input.value ?? null,
      contact_id: input.contactId ?? null,
      project_id: input.projectId ?? null,
      notes: input.notes ?? null,
      priority: input.priority ?? "normal",
      next_action: input.nextAction ?? null,
      expected_close_date: input.expectedCloseDate ?? null,
      probability: input.probability ?? null,
      source,
    })
    .select(OPP_COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToOpportunity(data);
}

export async function updateOpportunity(
  supabase: SupabaseClient,
  userId: string,
  opportunityId: string,
  patch: Partial<OpportunityInput>
): Promise<Opportunity | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.oppType !== undefined) row.opp_type = patch.oppType;
  if (patch.stage !== undefined) row.stage = patch.stage;
  if (patch.value !== undefined) row.value = patch.value;
  if (patch.contactId !== undefined) row.contact_id = patch.contactId;
  if (patch.projectId !== undefined) row.project_id = patch.projectId;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.nextAction !== undefined) row.next_action = patch.nextAction;
  if (patch.expectedCloseDate !== undefined) row.expected_close_date = patch.expectedCloseDate;
  if (patch.probability !== undefined) row.probability = patch.probability;

  const { data, error } = await supabase
    .from("opportunities")
    .update(row)
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .select(OPP_COLUMNS)
    .maybeSingle();
  if (error || !data) return null;
  return rowToOpportunity(data);
}

export async function deleteOpportunity(
  supabase: SupabaseClient,
  userId: string,
  opportunityId: string
): Promise<void> {
  await supabase
    .from("opportunities")
    .delete()
    .eq("id", opportunityId)
    .eq("user_id", userId);
}
