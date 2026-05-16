export type GoalArea = "work" | "health" | "learning" | "personal";
export type GoalStatus = "active" | "paused" | "done";

export type Goal = {
  id: string;
  title: string;
  area: GoalArea;
  target: number;
  progress: number;
  quarter: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

const KEY = "ebnjaos-goals-v1";

function now() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

export function listGoals(): Goal[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Goal[];
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(KEY, JSON.stringify(goals));
}

export function createGoal(input: Omit<Goal, "id" | "created_at" | "updated_at">) {
  const goals = listGoals();
  const goal: Goal = { ...input, id: uid(), created_at: now(), updated_at: now() };
  goals.unshift(goal);
  saveGoals(goals);
  return goal;
}

export function updateGoal(id: string, patch: Partial<Goal>) {
  const goals = listGoals().map((g) => (g.id === id ? { ...g, ...patch, updated_at: now() } : g));
  saveGoals(goals);
}

export function removeGoal(id: string) {
  const goals = listGoals().filter((g) => g.id !== id);
  saveGoals(goals);
}
