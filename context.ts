const CONTEXT_KEY = "user_personal_context";
const MAX_PER_CATEGORY = 5;

export type ContextType = "goals" | "tendencies" | "priorities";

export interface UserContext {
  goals: string[];
  tendencies: string[];
  priorities: string[];
}

const defaultContext = (): UserContext => ({
  goals: [],
  tendencies: [],
  priorities: [],
});

export function getContext(): UserContext {
  if (typeof window === "undefined") return defaultContext();
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (!raw) return defaultContext();
    const parsed = JSON.parse(raw);
    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      tendencies: Array.isArray(parsed.tendencies) ? parsed.tendencies : [],
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
    };
  } catch {
    return defaultContext();
  }
}

export function saveContext(context: UserContext): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
}

export function addContextItem(type: ContextType, value: string): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  const ctx = getContext();
  const list = ctx[type];
  if (list.includes(trimmed)) return;
  ctx[type] = [...list, trimmed].slice(-MAX_PER_CATEGORY);
  saveContext(ctx);
}

export function hasContext(ctx: UserContext): boolean {
  return (
    ctx.goals.length > 0 ||
    ctx.tendencies.length > 0 ||
    ctx.priorities.length > 0
  );
}

export function buildContextPrompt(ctx: UserContext): string {
  if (!hasContext(ctx)) return "";
  const lines: string[] = ["User context:"];
  if (ctx.goals.length > 0) lines.push(`Goals: ${ctx.goals.join(", ")}`);
  if (ctx.tendencies.length > 0) lines.push(`Tendencies: ${ctx.tendencies.join(", ")}`);
  if (ctx.priorities.length > 0) lines.push(`Priorities: ${ctx.priorities.join(", ")}`);
  return lines.join("\n");
}
