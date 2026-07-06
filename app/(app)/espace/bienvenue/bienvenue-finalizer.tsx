"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import symbole from "@/public/symbole-eden.png";

/** Doit rester identique à la clé écrite par le tunnel de diagnostic. */
const STORAGE_KEY = "nedexia.diagnostic.v1";

/**
 * Après authentification, on récupère le diagnostic mis en cache pendant le
 * tunnel et on l'enregistre dans Supabase (lié au compte), puis on redirige
 * vers l'espace entreprise (chat Eden + plan d'action).
 */
export function BienvenueFinalizer() {
  const router = useRouter();
  const [status, setStatus] = useState<"saving" | "done" | "nodata" | "error">(
    "saving"
  );
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const finalize = async () => {
      let draft: unknown = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        draft = raw ? JSON.parse(raw) : null;
      } catch {
        draft = null;
      }

      const submission = draft as {
        intention?: string;
        score?: unknown;
      } | null;

      if (!submission || !submission.intention || !submission.score) {
        setStatus("nodata");
        setTimeout(() => router.replace("/espace/entreprise"), 1200);
        return;
      }

      try {
        const res = await fetch("/api/diagnostic/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(submission),
        });
        if (!res.ok) throw new Error(String(res.status));
        localStorage.removeItem(STORAGE_KEY);
        setStatus("done");
        router.replace("/espace/entreprise");
      } catch {
        setStatus("error");
      }
    };

    void finalize();
  }, [router]);

  return (
    <div className="grid h-full place-items-center px-5 text-center">
      <div className="flex flex-col items-center gap-5">
        <Image src={symbole} alt="" className="h-16 w-auto animate-float-subtle" />
        {status === "error" ? (
          <>
            <p className="text-sm text-foreground/75">
              Un souci est survenu en enregistrant votre diagnostic.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/espace/entreprise")}
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              Ouvrir mon espace
            </button>
          </>
        ) : (
          <p className="text-sm text-foreground/75">
            {status === "nodata"
              ? "Bienvenue — on ouvre votre espace…"
              : "On enregistre votre diagnostic et on prépare votre espace…"}
          </p>
        )}
      </div>
    </div>
  );
}
