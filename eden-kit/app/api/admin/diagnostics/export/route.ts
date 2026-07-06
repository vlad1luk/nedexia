import { adminKeyMatches } from "@/lib/espace/admin-auth";
import { listSubmissionsAdmin } from "@/lib/espace/supabase-store";
import {
  ALL_BLOC_A,
  ALL_BLOC_B,
  ALL_BLOC_C,
  QUESTIONS_INTENTION,
} from "@/lib/espace/questions";
import {
  DIMENSION_LABELS,
  type DimensionId,
  type Intention,
} from "@/lib/espace/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/diagnostics/export?key=...
 * Génère un CSV plat de toutes les soumissions complétées.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!adminKeyMatches(key)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const submissions = await listSubmissionsAdmin().catch(() => []);
  const csv = buildCsv(submissions);

  const filename = `nedexia-diagnostics-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(
  submissions: Awaited<ReturnType<typeof listSubmissionsAdmin>>
): string {
  // Colonnes principales
  const baseCols = [
    "sessionId",
    "startedAt",
    "completedAt",
    "reachedScreen",
    "email",
    "intention",
    "intentionPrecision",
    "reqUrl",
    "reqSkipped",
    "reqFallback_formeJuridique",
    "reqFallback_anneeCreation",
    "reqFallback_nbDirigeants",
    "siteUrl",
    "siteSkipped",
    "siteFallback_offre",
    "siteFallback_publicCible",
    "uploadedFile_name",
    "uploadedFile_size",
    "score_total",
    "score_tier",
    "userId",
  ];

  // Une colonne par dimension
  const dimensionCols = (Object.keys(DIMENSION_LABELS) as DimensionId[]).map(
    (d) => `score_dim_${d}`
  );

  // Une colonne par question des blocs A/B/C
  const questionCols: string[] = [];
  for (const q of [...ALL_BLOC_A, ...ALL_BLOC_B, ...ALL_BLOC_C]) {
    questionCols.push(`q_${q.id}`);
  }

  // Questions par intention (préfixe ti_<intention>_<id>)
  const intentionQuestionCols: string[] = [];
  (Object.keys(QUESTIONS_INTENTION) as Intention[]).forEach((intention) => {
    QUESTIONS_INTENTION[intention].forEach((q) => {
      intentionQuestionCols.push(`ti_${intention}_${q.id}`);
    });
  });

  const headers = [...baseCols, ...dimensionCols, ...questionCols, ...intentionQuestionCols];
  const rows: string[] = [headers.join(",")];

  for (const s of submissions) {
    const row: Array<string | number | undefined | null> = [
      s.sessionId,
      s.startedAt,
      s.completedAt,
      s.reachedScreen,
      s.email,
      s.intention,
      s.intentionPrecision,
      s.reqUrl,
      s.reqSkipped ? "true" : "",
      s.reqFallback?.formeJuridique,
      s.reqFallback?.anneeCreation,
      s.reqFallback?.nbDirigeants,
      s.siteUrl,
      s.siteSkipped ? "true" : "",
      s.siteFallback?.offre,
      s.siteFallback?.publicCible,
      s.uploadedFile?.name,
      s.uploadedFile?.size,
      s.score?.total,
      s.score?.tier,
      s.userId,
    ];

    for (const d of Object.keys(DIMENSION_LABELS) as DimensionId[]) {
      row.push(s.score?.dimensions[d] ?? "");
    }

    for (const q of ALL_BLOC_A) row.push(s.answersBlocA?.[q.id] ?? "");
    for (const q of ALL_BLOC_B) row.push(s.answersBlocB?.[q.id] ?? "");
    for (const q of ALL_BLOC_C) row.push(s.answersBlocC?.[q.id] ?? "");

    for (const intention of Object.keys(QUESTIONS_INTENTION) as Intention[]) {
      for (const q of QUESTIONS_INTENTION[intention]) {
        const isIntention = s.intention === intention;
        row.push(isIntention ? (s.answersIntention?.[q.id] ?? "") : "");
      }
    }

    rows.push(row.map(escapeCsv).join(","));
  }

  return rows.join("\n");
}
