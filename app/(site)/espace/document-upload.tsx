"use client";

import { useId, useRef, useState } from "react";

export type UploadedFileMeta = {
  name: string;
  size: number;
};

const ACCEPT = ".pdf,.xls,.xlsx,.csv,.doc,.docx";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function fileFromInput(f: File): UploadedFileMeta {
  return { name: f.name, size: f.size };
}

type Props = {
  value: UploadedFileMeta | null;
  onChange: (file: UploadedFileMeta | null) => void;
};

/**
 * Zone de dépôt de document · diagnostic (métadonnées seulement au V1 test).
 */
export function DocumentUpload({ value, onChange }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    onChange(fileFromInput(f));
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  if (value) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-navy/10 bg-white px-4 py-3.5 shadow-sm">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-teal/20 bg-teal/10 text-teal">
          <DocumentIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy">{value.name}</p>
          <p className="mt-0.5 text-xs text-foreground/55">{formatSize(value.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 text-xs font-medium text-foreground/55 underline-offset-4 transition hover:text-navy hover:underline"
        >
          Retirer
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={onDrop}
      className={`relative rounded-xl border border-dashed px-5 py-8 text-center transition-colors ${
        dragOver
          ? "border-teal bg-teal/10"
          : "border-navy/15 bg-background/50 hover:border-teal/35 hover:bg-white/80"
      }`}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onInputChange}
      />

      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-navy/10 bg-white text-navy/55 shadow-sm">
          <UploadIcon />
        </span>
        <div>
          <p className="text-sm font-medium text-navy">
            Déposer un document{" "}
            <span className="font-normal text-foreground/55">(optionnel)</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/55">
            États financiers, plan d&apos;affaires ou structure capitalistique.
            Formats acceptés : PDF, Excel, Word.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-navy/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy transition hover:border-teal/40 hover:bg-teal/5"
        >
          Parcourir
        </button>
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </svg>
  );
}
