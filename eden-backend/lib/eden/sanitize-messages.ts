import type { EdenChatMessage, EdenChatRole } from "./system-prompt";

const MAX_MESSAGES = 40;
const MAX_CHARS = 12_000;

export function sanitizeClientMessages(
  raw: unknown,
): { role: EdenChatRole; content: string }[] {
  if (!Array.isArray(raw)) return [];

  const out: { role: EdenChatRole; content: string }[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = (item as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CHARS);
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
  }

  return out.slice(-MAX_MESSAGES);
}
