/**
 * Auto-analyse des liens (fiche REQ + site web) fournis pendant le diagnostic.
 *
 * Déclenché une seule fois, en arrière-plan, au premier chargement de l'espace.
 * Garde-fou anti-doublon : on « réclame » le diagnostic via `links_analyzed_at`
 * de façon atomique (update ... where links_analyzed_at is null) avant tout
 * appel LLM. Les montages multiples (React strict mode), onglets concurrents ou
 * rechargements ne relanceront donc jamais l'analyse.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { analyzeLink, applyDossierUpdate } from "@/lib/eden/tools";
import { calculateScore } from "@/lib/espace/score";
import { rowToSubmission } from "@/lib/espace/supabase-store";
import { listTasks } from "@/lib/espace/task-store";
import { bonusFromTasks } from "./score-sync.server";

const MODEL = "gpt-5.5";

export type AutoAnalyzeResult = {
  ran: ("req" | "site")[];
  score: number;
  tier: string;
  delta: number;
  facts: {
    formeJuridique: string | null;
    anneeCreation: string | null;
    nbDirigeants: string | null;
    offre: string | null;
    publicCible: string | null;
  };
};

/**
 * Renvoie `true` si l'utilisateur a au moins un lien à analyser et que
 * l'auto-analyse n'a pas encore été tentée (sert au pré-check côté page).
 */
export function shouldAutoAnalyze(row: {
  links_analyzed_at?: string | null;
  req_url?: string | null;
  site_url?: string | null;
  req_fallback?: { formeJuridique?: string } | null;
  site_fallback?: { offre?: string } | null;
}): boolean {
  if (row.links_analyzed_at) return false;
  const needReq = Boolean(row.req_url) && !row.req_fallback?.formeJuridique;
  const needSite = Boolean(row.site_url) && !row.site_fallback?.offre;
  return needReq || needSite;
}

export async function autoAnalyzeLinks(
  supabase: SupabaseClient,
  userId: string
): Promise<AutoAnalyzeResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const { data: diag } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!diag || diag.links_analyzed_at) return null;

  let submission = rowToSubmission(diag);
  const reqUrl = submission.reqUrl;
  const siteUrl = submission.siteUrl;
  const needReq = Boolean(reqUrl) && !submission.reqFallback?.formeJuridique;
  const needSite = Boolean(siteUrl) && !submission.siteFallback?.offre;

  // Réclamation atomique : pose le marqueur seulement s'il est encore nul.
  // Si une autre requête l'a déjà fait, `claim` est nul → on abandonne.
  const { data: claim } = await supabase
    .from("diagnostics")
    .update({ links_analyzed_at: new Date().toISOString() })
    .eq("id", diag.id)
    .eq("user_id", userId)
    .is("links_analyzed_at", null)
    .select("id")
    .maybeSingle();
  if (!claim) return null;

  if (!needReq && !needSite) return null;

  const tasks = await listTasks(supabase, userId);
  const bonus = bonusFromTasks(tasks);
  const before = submission.score?.total ?? calculateScore(submission).total;

  const ran: ("req" | "site")[] = [];
  const jobs: { type: "req" | "site"; url: string }[] = [];
  if (needReq && reqUrl) jobs.push({ type: "req", url: reqUrl });
  if (needSite && siteUrl) jobs.push({ type: "site", url: siteUrl });

  for (const job of jobs) {
    try {
      const { result, update } = await analyzeLink(
        apiKey,
        MODEL,
        job.type,
        job.url
      );
      if (result.ok) {
        const { submission: next, changed } = applyDossierUpdate(
          submission,
          update,
          bonus
        );
        submission = { ...next, id: submission.id, userId: submission.userId };
        if (changed.length > 0) ran.push(job.type);
      }
    } catch {
      // best-effort : un lien illisible ne bloque pas l'autre.
    }
  }

  if (ran.length > 0) {
    await supabase
      .from("diagnostics")
      .update({
        req_fallback: submission.reqFallback ?? null,
        site_fallback: submission.siteFallback ?? null,
        req_url: submission.reqUrl ?? null,
        site_url: submission.siteUrl ?? null,
        score: submission.score ?? null,
        score_total: submission.score?.total ?? null,
        score_tier: submission.score?.tier ?? null,
        score_bonus: submission.score?.bonus ?? bonus,
      })
      .eq("id", diag.id)
      .eq("user_id", userId);
  }

  const after = submission.score?.total ?? before;
  return {
    ran,
    score: after,
    tier: submission.score?.tier ?? "",
    delta: after - before,
    facts: {
      formeJuridique: submission.reqFallback?.formeJuridique || null,
      anneeCreation: submission.reqFallback?.anneeCreation || null,
      nbDirigeants: submission.reqFallback?.nbDirigeants || null,
      offre: submission.siteFallback?.offre || null,
      publicCible: submission.siteFallback?.publicCible || null,
    },
  };
}
