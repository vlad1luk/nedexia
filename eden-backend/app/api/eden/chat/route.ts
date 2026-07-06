import { runDocumentAnalysis } from "@/lib/eden/analyze-document.server";
import { recomputeScoreFromTasks } from "@/lib/eden/score-sync.server";
import { after } from "next/server";

import {
  buildEdenSystemPrompt,
  type CrmContextItem,
  type DocContextItem,
  type EdenProfile,
  type EdenRelationMeta,
  type PastConversationSummary,
  type ProjectContextItem,
} from "@/lib/eden/context";
import {
  EDEN_NOTE_KINDS,
  listEdenNotes,
  saveEdenNote,
  type EdenNoteKind,
} from "@/lib/eden/notes-store";
import {
  EDEN_TOOLS,
  analyzeLink,
  applyDossierUpdate,
  buildGeneratedDocument,
  buildSeedTasksFromArgs,
  type AnalyzeDocumentArgs,
  type CreateContactArgs,
  type CreateOpportunityArgs,
  type CreateProjectArgs,
  type CreateProjectFolderArgs,
  type CreateTasksArgs,
  type DeleteContactArgs,
  type DeleteOpportunityArgs,
  type GenerateDocumentArgs,
  type RememberArgs,
  type UpdateContactArgs,
  type UpdateDossierArgs,
  type UpdateMilestoneArgs,
  type UpdateOpportunityArgs,
  type UpdateProjectArgs,
  type UpdateTaskArgs,
} from "@/lib/eden/tools";
import {
  OPPORTUNITY_STAGE_LABELS,
  type ContactType,
  type CrmPriority,
  type OpportunityStage,
  type OpportunityType,
} from "@/lib/espace/crm";
import {
  deleteContact,
  deleteOpportunity,
  insertContact,
  insertOpportunity,
  listContacts,
  listOpportunities,
  updateContact,
  updateOpportunity,
} from "@/lib/espace/crm-store";
import { insertNotification } from "@/lib/espace/notification-store";
import {
  insertFolder,
  insertProject,
  listFolders,
  listProjects,
  updateProject,
} from "@/lib/espace/project-store";
import type {
  ProjectStatus,
  WorkspaceFolder,
  WorkspaceProject,
} from "@/lib/espace/workspace-types";
import { rowToSubmission, submissionToRow } from "@/lib/espace/supabase-store";
import {
  dueDateInDays,
  edenTasksThisWeekCount,
  phaseIdForScore,
  type Task,
} from "@/lib/espace/tasks";
import { insertTasks, listTasks, updateTask } from "@/lib/espace/task-store";
import { listScoreHistory } from "@/lib/espace/score-history";
import {
  listMilestones,
  updateMilestone,
  type ProgramMilestone,
} from "@/lib/espace/program";
import type { DiagnosticSubmission } from "@/lib/espace/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-5.5";
const MAX_TOOL_ROUNDS = 4;

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
  tool_call_id?: string;
};

type ToolCallAccumulator = {
  id: string;
  name: string;
  args: string;
};

function sseLine(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY n'est pas configurée." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: { conversationId?: string | null; content?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps invalide." }, { status: 400 });
  }

  const content = (body.content ?? "").trim().slice(0, 8000);
  if (!content) {
    return Response.json({ error: "Message vide." }, { status: 400 });
  }

  // ─── Dossier + profil + plan d'action + documents + mémoire ───
  const [
    { data: diagRow },
    { data: profileRow },
    taskList,
    { data: docRows },
    edenNotes,
    { count: convCount },
    { data: lastMsgRow },
    { data: summaryRows },
  ] = await Promise.all([
    supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, company_name, email, sector, goal")
      .eq("id", user.id)
      .maybeSingle(),
    listTasks(supabase, user.id),
    supabase
      .from("documents")
      .select("id, name, analysis_status, analysis")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    listEdenNotes(supabase, user.id),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("messages")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select("id, title, summary, updated_at")
      .eq("user_id", user.id)
      .not("summary", "is", null)
      .order("updated_at", { ascending: false })
      .limit(4),
  ]);

  // Résumés des conversations passées (hors conversation courante).
  const pastSummaries: PastConversationSummary[] = (summaryRows ?? [])
    .filter((r) => r.id !== body.conversationId && r.summary)
    .slice(0, 3)
    .map((r) => ({
      title: r.title,
      summary: r.summary as string,
      updatedAt: r.updated_at ?? null,
    }));

  const docContext: DocContextItem[] = (docRows ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => ({
      id: d.id,
      name: d.name,
      analysisStatus: d.analysis_status ?? "pending",
      docType: d.analysis?.docType ?? null,
      summary: d.analysis?.summary ?? null,
    })
  );

  const [crmContacts, crmOpportunities] = await Promise.all([
    listContacts(supabase, user.id),
    listOpportunities(supabase, user.id),
  ]);
  const crmContext: CrmContextItem = {
    contacts: crmContacts.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.contactType,
      organization: c.organization,
      priority: c.priority,
      nextAction: c.nextAction,
    })),
    opportunities: crmOpportunities.map((o) => ({
      id: o.id,
      title: o.title,
      stage: o.stage,
      type: o.oppType,
      contactId: o.contactId,
      projectId: o.projectId,
      value: o.value,
      probability: o.probability,
      nextAction: o.nextAction,
    })),
  };

  let tasks: Task[] = taskList;

  const [projectList, folderList, { data: docProjectRows }, scoreHistory, program] =
    await Promise.all([
      listProjects(supabase, user.id),
      listFolders(supabase, user.id),
      supabase.from("documents").select("project_id").eq("user_id", user.id),
      listScoreHistory(supabase, user.id),
      listMilestones(supabase, user.id) as Promise<ProgramMilestone[]>,
    ]);

  let projects: WorkspaceProject[] = projectList;
  let folders: WorkspaceFolder[] = folderList;

  const docCountByProject = new Map<string, number>();
  for (const r of docProjectRows ?? []) {
    const pid = (r as { project_id: string | null }).project_id;
    if (pid) docCountByProject.set(pid, (docCountByProject.get(pid) ?? 0) + 1);
  }

  const buildProjectContext = (): ProjectContextItem[] =>
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      objective: p.objective,
      folders: folders
        .filter((f) => f.projectId === p.id)
        .map((f) => ({ id: f.id, name: f.name })),
      openTasks: tasks.filter(
        (t) => t.projectId === p.id && t.status !== "done" && t.status !== "skipped"
      ).length,
      docCount: docCountByProject.get(p.id) ?? 0,
    }));

  let submission: (DiagnosticSubmission & { id?: string }) | null = diagRow
    ? rowToSubmission(diagRow)
    : null;
  const diagnosticId: string | null = diagRow?.id ?? null;

  const profile: EdenProfile = {
    displayName:
      profileRow?.full_name ||
      profileRow?.company_name ||
      (user.email ? user.email.split("@")[0] : "vous"),
    companyName: profileRow?.company_name ?? null,
    email: profileRow?.email ?? user.email ?? null,
    sector: profileRow?.sector ?? null,
    goal: profileRow?.goal ?? null,
  };

  // Relation Eden ↔ dirigeant : lue AVANT d'insérer le message courant.
  const relation: EdenRelationMeta = {
    conversationCount: Math.max(
      1,
      (convCount ?? 0) + (body.conversationId ? 0 : 1)
    ),
    lastExchangeAt: lastMsgRow?.created_at ?? null,
  };

  // ─── Conversation (créée si absente) ───
  let conversationId = body.conversationId ?? null;
  let conversationTitle = content.slice(0, 48) + (content.length > 48 ? "…" : "");
  const history: ChatMessage[] = [];

  if (conversationId) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, title")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!conv) {
      conversationId = null;
    } else {
      conversationTitle = conv.title;
      // Les 40 derniers messages, remis en ordre chronologique.
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(40);
      for (const m of (msgs ?? []).reverse()) {
        if (m.role === "user" || m.role === "assistant") {
          history.push({ role: m.role, content: m.content });
        }
      }
    }
  }

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: conversationTitle })
      .select("id, title")
      .single();
    if (error || !created) {
      console.error("[eden] échec création conversation:", error);
      return Response.json(
        { error: "Impossible de créer la conversation." },
        { status: 500 }
      );
    }
    conversationId = created.id;
    conversationTitle = created.title;
  }

  // Persiste le message utilisateur
  const { data: userMsgRow, error: userMsgErr } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content,
    })
    .select("id, created_at")
    .single();
  if (userMsgErr) {
    console.error("[eden] échec persistance message utilisateur:", userMsgErr);
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: buildEdenSystemPrompt(
        submission,
        profile,
        tasks,
        docContext,
        crmContext,
        buildProjectContext(),
        relation,
        edenNotes,
        pastSummaries,
        scoreHistory,
        program
      ),
    },
    ...history,
    { role: "user", content },
  ];

  // ─── Stream vers le client ───
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let dossierChanged = false;
      let assistantText = "";

      const emit = (obj: unknown) => controller.enqueue(sseLine(obj));

      const emitTasks = (createdIds?: string[]) =>
        emit({ type: "tasks", tasks, createdIds: createdIds ?? null });

      const notify = async (input: {
        kind: "task" | "document" | "score" | "opportunity" | "contact";
        title: string;
        body?: string;
        href?: string;
      }) => {
        const n = await insertNotification(supabase, user.id, input);
        if (n) emit({ type: "notification", notification: n });
      };

      const executeTool = async (
        name: string,
        rawArgs: string
      ): Promise<string> => {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(rawArgs || "{}");
        } catch {
          return JSON.stringify({ ok: false, error: "Arguments invalides." });
        }

        // ─── Mémoire du tuteur ───
        if (name === "remember") {
          const a = args as RememberArgs;
          const kind: EdenNoteKind = EDEN_NOTE_KINDS.includes(
            a.kind as EdenNoteKind
          )
            ? (a.kind as EdenNoteKind)
            : "fait";
          const noteContent = (a.content ?? "").trim().slice(0, 500);
          if (!noteContent) {
            return JSON.stringify({ ok: false, error: "Contenu manquant." });
          }
          const note = await saveEdenNote(supabase, user.id, kind, noteContent);
          if (!note) {
            return JSON.stringify({
              ok: false,
              error: "Enregistrement impossible.",
            });
          }
          return JSON.stringify({ ok: true, id: note.id, kind: note.kind });
        }

        // ─── Outils plan d'action (indépendants du diagnostic) ───
        if (name === "create_tasks") {
          const rawSeeds = buildSeedTasksFromArgs(args as CreateTasksArgs);
          if (rawSeeds.length === 0) {
            return JSON.stringify({ ok: false, error: "Aucune tâche valide." });
          }
          const defaultPhase = phaseIdForScore(submission?.score?.total ?? 0);
          const seeds = rawSeeds.map((s) => ({
            ...s,
            phaseId: s.phaseId ?? defaultPhase,
          }));
          const remaining = Math.max(0, 3 - edenTasksThisWeekCount(tasks));
          if (remaining === 0) {
            return JSON.stringify({
              ok: false,
              error:
                "Quota atteint : 3 tâches Eden déjà actives cette semaine. Aide à terminer ou reporter l'existant avant d'en créer.",
            });
          }
          const reqProjectId = (args as CreateTasksArgs).project_id;
          const taskProjectId =
            typeof reqProjectId === "string" &&
            projects.some((p) => p.id === reqProjectId)
              ? reqProjectId
              : null;
          const reqMilestoneId = (args as CreateTasksArgs).milestone_id;
          const taskMilestoneId =
            typeof reqMilestoneId === "string" &&
            program.some((m) => m.id === reqMilestoneId)
              ? reqMilestoneId
              : null;
          const created = await insertTasks(
            supabase,
            user.id,
            seeds.slice(0, remaining),
            {
              diagnosticId,
              conversationId,
              source: "eden",
              projectId: taskProjectId,
              milestoneId: taskMilestoneId,
            }
          );
          tasks = [...tasks, ...created];
          if (created.length > 0) {
            emitTasks(created.map((t) => t.id));
            await notify({
              kind: "task",
              title:
                created.length === 1
                  ? "Eden a ajouté une action"
                  : `Eden a ajouté ${created.length} actions`,
              body: created.map((t) => t.title).join(" · ").slice(0, 140),
              href: "#plan",
            });
          }
          return JSON.stringify({
            ok: true,
            created: created.map((t) => ({
              id: t.id,
              title: t.title,
              dueDate: t.dueDate,
            })),
          });
        }

        if (name === "update_task") {
          const a = args as UpdateTaskArgs;
          if (!a.task_id) {
            return JSON.stringify({ ok: false, error: "task_id manquant." });
          }
          const dueDate =
            typeof a.due_in_days === "number"
              ? dueDateInDays(Math.max(0, Math.round(a.due_in_days)))
              : undefined;
          const updated = await updateTask(supabase, user.id, a.task_id, {
            status: a.status,
            dueDate,
            blockedReason: a.blocked_reason,
            proofNote: a.proof_note,
            priority: a.priority,
          });
          if (!updated) {
            return JSON.stringify({ ok: false, error: "Tâche introuvable." });
          }
          tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
          emitTasks();

          // Points d'élan : une action complétée/rouverte peut bouger le score.
          const synced = await recomputeScoreFromTasks(supabase, user.id);
          if (synced && synced.delta !== 0) {
            emit({ type: "score", score: synced.score, tier: synced.tier });
            if (submission?.score) {
              submission.score.total = synced.score;
              submission.score.tier = synced.tier as typeof submission.score.tier;
              submission.score.bonus = synced.bonus;
            }
            if (synced.delta > 0) {
              await notify({
                kind: "score",
                title: `Score +${synced.delta} point${synced.delta > 1 ? "s" : ""}`,
                body: "Action complétée — votre dossier progresse.",
                href: "#overview",
              });
            }
          }

          return JSON.stringify({
            ok: true,
            task: {
              id: updated.id,
              title: updated.title,
              status: updated.status,
              dueDate: updated.dueDate,
            },
            // Score effectif après recalcul des points d'élan — c'est CETTE
            // valeur qu'Eden doit annoncer, pas celle du contexte initial.
            score: synced?.score ?? submission?.score?.total ?? null,
            scoreDelta: synced?.delta ?? 0,
            tier: synced?.tier ?? submission?.score?.tier ?? null,
          });
        }

        if (name === "update_milestone") {
          const a = args as UpdateMilestoneArgs;
          if (!a.milestone_id || !a.status) {
            return JSON.stringify({
              ok: false,
              error: "milestone_id et status requis.",
            });
          }
          if (!program.some((m) => m.id === a.milestone_id)) {
            return JSON.stringify({ ok: false, error: "Jalon introuvable." });
          }
          const updated = await updateMilestone(
            supabase,
            user.id,
            a.milestone_id,
            a.status
          );
          if (!updated) {
            return JSON.stringify({ ok: false, error: "Mise à jour impossible." });
          }
          emit({ type: "milestone", milestone: updated });
          if (updated.status === "done") {
            await notify({
              kind: "task",
              title: "Jalon franchi",
              body: updated.title,
              href: "#timeline",
            });
          }
          return JSON.stringify({
            ok: true,
            id: updated.id,
            status: updated.status,
            title: updated.title,
          });
        }

        if (name === "analyze_document") {
          const a = args as AnalyzeDocumentArgs;
          if (!a.document_id) {
            return JSON.stringify({ ok: false, error: "document_id manquant." });
          }
          const outcome = await runDocumentAnalysis(
            supabase,
            user.id,
            a.document_id,
            apiKey,
            MODEL
          );
          if (!outcome.ok) {
            return JSON.stringify({ ok: false, error: outcome.message });
          }

          // runDocumentAnalysis a écrit en base : on rafraîchit la copie mémoire
          // pour éviter qu'une persistance ultérieure n'écrase le nouveau score.
          if (outcome.changed && outcome.changed.length > 0 && diagnosticId) {
            const { data: fresh } = await supabase
              .from("diagnostics")
              .select("*")
              .eq("id", diagnosticId)
              .eq("user_id", user.id)
              .maybeSingle();
            if (fresh) submission = { ...rowToSubmission(fresh), id: diagnosticId };
            emit({
              type: "score",
              score: outcome.score ?? null,
              tier: outcome.tier ?? null,
            });
            const delta =
              outcome.score != null && outcome.scoreBefore != null
                ? outcome.score - outcome.scoreBefore
                : 0;
            await notify({
              kind: "score",
              title:
                delta > 0
                  ? `Score +${delta} points`
                  : "Score recalculé",
              body: `${outcome.documentName ?? "Document"} analysé · ${outcome.score}/100`,
              href: "#overview",
            });
          }

          emit({
            type: "document",
            document: {
              id: outcome.documentId,
              name: outcome.documentName ?? "",
              analysisStatus: "done",
              analysis: outcome.analysis ?? null,
            },
          });

          return JSON.stringify({
            ok: true,
            docType: outcome.analysis?.docType,
            summary: outcome.analysis?.summary,
            keyFindings: outcome.analysis?.keyFindings ?? [],
            changed: outcome.changed ?? [],
            score: outcome.score ?? null,
          });
        }

        if (name === "generate_document") {
          const doc = buildGeneratedDocument(args as GenerateDocumentArgs);
          if (!doc) {
            return JSON.stringify({
              ok: false,
              error: "Contenu de document invalide ou trop court.",
            });
          }

          const docProjectId =
            doc.projectId && projects.some((p) => p.id === doc.projectId)
              ? doc.projectId
              : null;
          const docFolderId =
            docProjectId &&
            doc.folderId &&
            folders.some(
              (f) => f.id === doc.folderId && f.projectId === docProjectId
            )
              ? doc.folderId
              : null;

          let saved: Record<string, unknown> | null = null;
          try {
            const slug =
              doc.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 60) || "document";
            const fileName = `${doc.title}.md`;
            const path = `${user.id}/generated/${Date.now()}-${slug}.md`;
            const size = new TextEncoder().encode(doc.markdown).length;
            const { error: upErr } = await supabase.storage
              .from("documents")
              .upload(path, doc.markdown, {
                contentType: "text/markdown",
                upsert: false,
              });
            if (!upErr) {
              const { data: row } = await supabase
                .from("documents")
                .insert({
                  user_id: user.id,
                  diagnostic_id: diagnosticId,
                  project_id: docProjectId,
                  folder_id: docFolderId,
                  name: fileName,
                  size,
                  mime: "text/markdown",
                  storage_path: path,
                  analysis_status: "unsupported",
                })
                .select(
                  "id, name, size, mime, storage_path, project_id, folder_id, created_at"
                )
                .single();
              if (row) {
                saved = {
                  id: row.id,
                  name: row.name,
                  size: row.size,
                  mime: row.mime ?? null,
                  storagePath: row.storage_path,
                  projectId: row.project_id ?? null,
                  folderId: row.folder_id ?? null,
                  createdAtLabel: "à l'instant",
                  analysisStatus: "unsupported",
                  analysis: null,
                };
              }
            }
          } catch {
            // La persistance est best-effort : on garde la carte inline même si l'écriture échoue.
          }

          emit({ type: "document", generated: doc, saved });
          return JSON.stringify({
            ok: true,
            title: doc.title,
            type: doc.type,
            saved: saved != null,
          });
        }

        if (name === "create_contact") {
          const a = args as CreateContactArgs;
          const cname = (a.name ?? "").trim();
          if (!cname) {
            return JSON.stringify({ ok: false, error: "Nom manquant." });
          }
          const contact = await insertContact(
            supabase,
            user.id,
            {
              name: cname.slice(0, 200),
              contactType: (a.contact_type as ContactType) ?? "autre",
              title: a.title?.slice(0, 160) ?? null,
              organization: a.organization?.slice(0, 200) ?? null,
              email: a.email?.slice(0, 200) ?? null,
              phone: a.phone?.slice(0, 60) ?? null,
              notes: a.notes?.slice(0, 600) ?? null,
              priority: (a.priority as CrmPriority) ?? "normal",
              nextAction: a.next_action?.slice(0, 200) ?? null,
              nextActionDate: a.next_action_date?.slice(0, 10) ?? null,
              lastContactedAt: a.last_contacted_at ?? null,
            },
            "eden"
          );
          if (!contact) {
            return JSON.stringify({ ok: false, error: "Création impossible." });
          }
          emit({ type: "contact", contact });
          await notify({
            kind: "contact",
            title: "Nouveau contact",
            body: `${contact.name} ajouté à votre CRM`,
            href: "#contacts",
          });
          return JSON.stringify({ ok: true, id: contact.id, name: contact.name });
        }

        if (name === "update_contact") {
          const a = args as UpdateContactArgs;
          if (!a.contact_id) {
            return JSON.stringify({ ok: false, error: "contact_id manquant." });
          }
          const contact = await updateContact(supabase, user.id, a.contact_id, {
            name: a.name?.slice(0, 200),
            contactType: a.contact_type as ContactType | undefined,
            title: a.title?.slice(0, 160),
            organization: a.organization?.slice(0, 200),
            email: a.email?.slice(0, 200),
            phone: a.phone?.slice(0, 60),
            notes: a.notes?.slice(0, 600),
            priority: a.priority as CrmPriority | undefined,
            nextAction: a.next_action?.slice(0, 200),
            nextActionDate: a.next_action_date?.slice(0, 10),
            lastContactedAt: a.last_contacted_at,
          });
          if (!contact) {
            return JSON.stringify({ ok: false, error: "Contact introuvable." });
          }
          emit({ type: "contact", contact });
          await notify({
            kind: "contact",
            title: "Contact mis à jour",
            body: contact.name,
            href: "#contacts",
          });
          return JSON.stringify({ ok: true, id: contact.id, name: contact.name });
        }

        if (name === "delete_contact") {
          const a = args as DeleteContactArgs;
          if (!a.contact_id) {
            return JSON.stringify({ ok: false, error: "contact_id manquant." });
          }
          await deleteContact(supabase, user.id, a.contact_id);
          emit({ type: "contact_deleted", contactId: a.contact_id });
          return JSON.stringify({ ok: true, id: a.contact_id });
        }

        if (name === "create_opportunity") {
          const a = args as CreateOpportunityArgs;
          const title = (a.title ?? "").trim();
          if (!title) {
            return JSON.stringify({ ok: false, error: "Intitulé manquant." });
          }
          const opportunity = await insertOpportunity(
            supabase,
            user.id,
            {
              title: title.slice(0, 200),
              oppType: (a.opp_type as OpportunityType) ?? "commerce",
              stage: (a.stage as OpportunityStage) ?? "qualification",
              value: typeof a.value === "number" ? a.value : null,
              contactId: a.contact_id ?? null,
              projectId: a.project_id ?? null,
              notes: a.notes?.slice(0, 600) ?? null,
              priority: (a.priority as CrmPriority) ?? "normal",
              nextAction: a.next_action?.slice(0, 200) ?? null,
              expectedCloseDate: a.expected_close_date?.slice(0, 10) ?? null,
              probability:
                typeof a.probability === "number"
                  ? Math.min(100, Math.max(0, Math.round(a.probability)))
                  : null,
            },
            "eden"
          );
          if (!opportunity) {
            return JSON.stringify({ ok: false, error: "Création impossible." });
          }
          emit({ type: "opportunity", opportunity });
          await notify({
            kind: "opportunity",
            title: "Nouvelle opportunité",
            body: opportunity.title,
            href: "#opportunities",
          });
          return JSON.stringify({
            ok: true,
            id: opportunity.id,
            title: opportunity.title,
          });
        }

        if (name === "update_opportunity") {
          const a = args as UpdateOpportunityArgs;
          if (!a.opportunity_id) {
            return JSON.stringify({ ok: false, error: "opportunity_id manquant." });
          }
          const opportunity = await updateOpportunity(
            supabase,
            user.id,
            a.opportunity_id,
            {
              title: a.title?.slice(0, 200),
              oppType: a.opp_type as OpportunityType | undefined,
              stage: a.stage as OpportunityStage | undefined,
              value: typeof a.value === "number" ? a.value : undefined,
              contactId: a.contact_id,
              projectId: a.project_id,
              notes: a.notes?.slice(0, 600),
              priority: a.priority as CrmPriority | undefined,
              nextAction: a.next_action?.slice(0, 200),
              expectedCloseDate: a.expected_close_date?.slice(0, 10),
              probability:
                typeof a.probability === "number"
                  ? Math.min(100, Math.max(0, Math.round(a.probability)))
                  : undefined,
            }
          );
          if (!opportunity) {
            return JSON.stringify({ ok: false, error: "Opportunité introuvable." });
          }
          emit({ type: "opportunity", opportunity });
          if (a.stage) {
            await notify({
              kind: "opportunity",
              title: "Opportunité mise à jour",
              body: `${opportunity.title} — ${OPPORTUNITY_STAGE_LABELS[opportunity.stage]}`,
              href: "#opportunities",
            });
          }
          return JSON.stringify({
            ok: true,
            id: opportunity.id,
            stage: opportunity.stage,
          });
        }

        if (name === "delete_opportunity") {
          const a = args as DeleteOpportunityArgs;
          if (!a.opportunity_id) {
            return JSON.stringify({ ok: false, error: "opportunity_id manquant." });
          }
          await deleteOpportunity(supabase, user.id, a.opportunity_id);
          emit({ type: "opportunity_deleted", opportunityId: a.opportunity_id });
          return JSON.stringify({ ok: true, id: a.opportunity_id });
        }

        if (name === "create_project") {
          const a = args as CreateProjectArgs;
          const pname = (a.name ?? "").trim();
          if (!pname) {
            return JSON.stringify({ ok: false, error: "Nom de projet manquant." });
          }
          const project = await insertProject(supabase, user.id, {
            name: pname.slice(0, 160),
            objective: a.objective?.slice(0, 600) ?? null,
            type: a.type?.slice(0, 60) ?? "general",
          });
          if (!project) {
            return JSON.stringify({ ok: false, error: "Création impossible." });
          }
          projects = [...projects, project];
          emit({ type: "project", project });
          await notify({
            kind: "task",
            title: "Nouveau projet",
            body: `${project.name} créé dans votre espace`,
            href: "#projects",
          });
          return JSON.stringify({ ok: true, id: project.id, name: project.name });
        }

        if (name === "update_project") {
          const a = args as UpdateProjectArgs;
          if (!a.project_id || !projects.some((p) => p.id === a.project_id)) {
            return JSON.stringify({ ok: false, error: "Projet introuvable." });
          }
          const project = await updateProject(supabase, user.id, a.project_id, {
            status: a.status as ProjectStatus | undefined,
            objective: a.objective?.slice(0, 600),
          });
          if (!project) {
            return JSON.stringify({ ok: false, error: "Mise à jour impossible." });
          }
          projects = projects.map((p) => (p.id === project.id ? project : p));
          emit({ type: "project", project });
          return JSON.stringify({
            ok: true,
            id: project.id,
            status: project.status,
          });
        }

        if (name === "create_project_folder") {
          const a = args as CreateProjectFolderArgs;
          const fname = (a.name ?? "").trim();
          if (!a.project_id || !projects.some((p) => p.id === a.project_id)) {
            return JSON.stringify({ ok: false, error: "Projet introuvable." });
          }
          if (!fname) {
            return JSON.stringify({ ok: false, error: "Nom de dossier manquant." });
          }
          const folder = await insertFolder(
            supabase,
            user.id,
            a.project_id,
            fname.slice(0, 120)
          );
          if (!folder) {
            return JSON.stringify({ ok: false, error: "Création impossible." });
          }
          folders = [...folders, folder];
          emit({ type: "folder", folder });
          return JSON.stringify({ ok: true, id: folder.id, name: folder.name });
        }

        if (!submission) {
          return JSON.stringify({
            ok: false,
            error: "Aucun diagnostic à mettre à jour.",
          });
        }

        if (name === "update_dossier") {
          const { submission: next, changed } = applyDossierUpdate(
            submission,
            args as UpdateDossierArgs,
            submission.score?.bonus ?? 0
          );
          submission = { ...next, id: submission.id };
          if (changed.length > 0) {
            dossierChanged = true;
            emit({
              type: "score",
              score: submission.score?.total ?? null,
              tier: submission.score?.tier ?? null,
            });
          }
          return JSON.stringify({
            ok: true,
            changed,
            score: submission.score?.total ?? null,
            tier: submission.score?.tier ?? null,
          });
        }

        if (name === "analyze_link") {
          const type = args.type === "site" ? "site" : "req";
          const url = typeof args.url === "string" ? args.url : "";
          if (!url) return JSON.stringify({ ok: false, error: "URL manquante." });

          const { result, update } = await analyzeLink(
            apiKey,
            MODEL,
            type,
            url
          );
          if (result.ok) {
            const { submission: next, changed } = applyDossierUpdate(
              submission,
              update,
              submission.score?.bonus ?? 0
            );
            submission = { ...next, id: submission.id };
            if (changed.length > 0) {
              dossierChanged = true;
              emit({
                type: "score",
                score: submission.score?.total ?? null,
                tier: submission.score?.tier ?? null,
              });
            }
            return JSON.stringify({
              ok: true,
              extracted: result.extracted,
              changed,
              score: submission.score?.total ?? null,
            });
          }
          return JSON.stringify({ ok: false, message: result.message });
        }

        return JSON.stringify({ ok: false, error: "Outil inconnu." });
      };

      try {
        emit({
          type: "meta",
          conversationId,
          title: conversationTitle,
          userMessageId: userMsgRow?.id ?? null,
          userCreatedAt: userMsgRow?.created_at ?? null,
        });

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const openaiRes = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: MODEL,
                stream: true,
                max_completion_tokens: 1600,
                tools: EDEN_TOOLS,
                tool_choice: "auto",
                messages,
              }),
            }
          );

          if (!openaiRes.ok || !openaiRes.body) {
            emit({
              type: "error",
              message: "Eden n'a pas pu répondre pour le moment.",
            });
            break;
          }

          const reader = openaiRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let roundContent = "";
          const toolCalls: Record<number, ToolCallAccumulator> = {};
          let finishReason: string | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") continue;

              let json: {
                choices?: {
                  delta?: {
                    content?: string;
                    tool_calls?: {
                      index: number;
                      id?: string;
                      function?: { name?: string; arguments?: string };
                    }[];
                  };
                  finish_reason?: string | null;
                }[];
              };
              try {
                json = JSON.parse(payload);
              } catch {
                continue;
              }

              const choice = json.choices?.[0];
              const delta = choice?.delta;
              if (delta?.content) {
                roundContent += delta.content;
                assistantText += delta.content;
                emit({ type: "delta", text: delta.content });
              }
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const slot = (toolCalls[tc.index] ??= {
                    id: "",
                    name: "",
                    args: "",
                  });
                  if (tc.id) slot.id = tc.id;
                  if (tc.function?.name) slot.name = tc.function.name;
                  if (tc.function?.arguments) slot.args += tc.function.arguments;
                }
              }
              if (choice?.finish_reason) finishReason = choice.finish_reason;
            }
          }

          const calls = Object.values(toolCalls).filter((c) => c.name);

          if (finishReason === "tool_calls" && calls.length > 0) {
            messages.push({
              role: "assistant",
              content: roundContent || null,
              tool_calls: calls.map((c) => ({
                id: c.id,
                type: "function",
                function: { name: c.name, arguments: c.args || "{}" },
              })),
            });

            for (const c of calls) {
              const result = await executeTool(c.name, c.args);
              messages.push({
                role: "tool",
                tool_call_id: c.id,
                content: result,
              });
            }
            continue;
          }

          break;
        }

        // ─── Persistance ───
        let assistantRow: { id: string; created_at: string } | null = null;
        if (assistantText.trim()) {
          const { data, error: aErr } = await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              content: assistantText.trim(),
            })
            .select("id, created_at")
            .single();
          if (aErr) {
            console.error("[eden] échec persistance message assistant:", aErr);
          }
          assistantRow = data ?? null;
        }

        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        if (dossierChanged && submission && diagnosticId) {
          await supabase
            .from("diagnostics")
            .update(submissionToRow(submission, user.id))
            .eq("id", diagnosticId)
            .eq("user_id", user.id);
        }

        emit({
          type: "done",
          score: submission?.score?.total ?? null,
          tier: submission?.score?.tier ?? null,
          assistantMessageId: assistantRow?.id ?? null,
          assistantCreatedAt: assistantRow?.created_at ?? null,
        });

        // ─── Résumé de session (mémoire de continuité) ───
        // Généré APRÈS l'envoi de la réponse pour ne pas retarder le stream.
        const finalText = assistantText.trim();
        if (finalText) {
          const transcript = [
            ...history,
            { role: "user" as const, content },
            { role: "assistant" as const, content: finalText },
          ]
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-14)
            .map(
              (m) =>
                `${m.role === "user" ? "Dirigeant" : "Eden"} : ${(m.content ?? "").slice(0, 500)}`
            )
            .join("\n");
          after(async () => {
            try {
              const res = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: MODEL,
                    max_completion_tokens: 160,
                    messages: [
                      {
                        role: "system",
                        content:
                          "Résume cette conversation entre Eden (tuteur d'affaires Nedexia) et un dirigeant d'entreprise, en français, en 2 phrases factuelles maximum : sujets abordés, décisions prises, actions lancées. Pas de préambule, pas de conseil.",
                      },
                      { role: "user", content: transcript },
                    ],
                  }),
                }
              );
              if (!res.ok) return;
              const data = (await res.json()) as {
                choices?: { message?: { content?: string } }[];
              };
              const summary = data.choices?.[0]?.message?.content?.trim();
              if (summary) {
                await supabase
                  .from("conversations")
                  .update({ summary: summary.slice(0, 600) })
                  .eq("id", conversationId)
                  .eq("user_id", user.id);
              }
            } catch {
              // best-effort : le résumé sera retenté au prochain message
            }
          });
        }
      } catch {
        emit({ type: "error", message: "Une erreur est survenue." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
