"use client";

import Link from "next/link";
import { useEspace } from "./../espace-context";
import { PageHeader, Panel } from "./../ui";

/**
 * Paramètres — compte, crédits Eden, intégrations, facturation.
 *
 * Les crédits Eden et la facturation sont des emplacements réservés : la
 * mécanique n'est pas encore arrêtée côté produit — on prévoit l'espace sans
 * sur-spécifier. Les intégrations listées sont les connecteurs prévus, tous
 * marqués « à venir » tant que rien n'est branché.
 */

const INTEGRATIONS = [
  { name: "QuickBooks", role: "Comptabilité — états financiers à jour, sans ressaisie" },
  { name: "HubSpot", role: "CRM — pipeline et clients lisibles par Eden" },
  { name: "Zoho", role: "Suite de gestion — données d'exploitation" },
  { name: "Mailchimp", role: "Marketing — signaux de traction commerciale" },
  { name: "Salesforce", role: "CRM — pipeline et clients lisibles par Eden" },
] as const;

export default function ParametresPage() {
  const { companyName, displayName, email } = useEspace();

  return (
    <>
      <PageHeader title="Paramètres" />

      <div className="flex flex-col gap-4">
        {/* Compte */}
        <Panel label="Compte">
          <dl className="flex flex-col border-t border-ink/15">
            <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink/20 py-3">
              <dt className="text-sm text-ink-soft">Entreprise</dt>
              <dd className="text-sm font-medium text-ink">
                {companyName ?? "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink/20 py-3">
              <dt className="text-sm text-ink-soft">Prénom</dt>
              <dd className="text-sm font-medium text-ink">{displayName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-sm text-ink-soft">Courriel</dt>
              <dd className="text-sm font-medium text-ink">{email}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center gap-5 border-t border-ink/15 pt-4">
            <Link
              href="/"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Retour au site
            </Link>
            <a
              href="/auth/signout?next=/connexion"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-rust"
            >
              Se déconnecter
            </a>
          </div>
        </Panel>

        {/* Crédits Eden — emplacement réservé */}
        <Panel
          label="Crédits Eden"
          meta={
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              À venir
            </span>
          }
        >
          <p className="text-sm leading-relaxed text-ink-soft">
            Les crédits Eden seront liés à votre financement — la mécanique
            précise sera annoncée ici. Rien à configurer pour l&rsquo;instant.
          </p>
        </Panel>

        {/* Intégrations — connecteurs prévus */}
        <Panel label="Intégrations">
          <p className="text-sm leading-relaxed text-ink-soft">
            Connectez vos outils pour qu&rsquo;Eden travaille sur des données à
            jour, sans ressaisie. Les connecteurs arrivent progressivement.
          </p>
          <ul className="mt-4 flex flex-col border-t border-ink/15">
            {INTEGRATIONS.map((integ) => (
              <li
                key={integ.name}
                className="flex items-baseline gap-4 border-b border-ink/15 py-3.5 last:border-b-0"
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-ink">
                  {integ.name}
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink-soft">
                  {integ.role}
                </span>
                <span className="shrink-0 bg-ink/8 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  À venir
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Facturation — emplacement réservé */}
        <Panel
          label="Facturation"
          meta={
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              À venir
            </span>
          }
        >
          <p className="text-sm leading-relaxed text-ink-soft">
            Le diagnostic et l&rsquo;espace sont gratuits. Quand des services
            payants s&rsquo;ajouteront, votre facturation vivra ici.
          </p>
        </Panel>
      </div>
    </>
  );
}
