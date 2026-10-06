export function normalizeLabels(labels: string[]): string[] {
  if (!Array.isArray(labels)) return [];

  const seen = new Map<string, string>();
  const result: string[] = [];

  labels.forEach((label) => {
    const trimmed = String(label).trim();
    if (trimmed === '') return;

    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.set(lower, trimmed);
      result.push(trimmed);
    }
  });

  return result;
}

export function collectKnownLabels(tasks: any[]): string[] {
  const labelSet = new Set<string>();

  tasks.forEach((task) => {
    if (Array.isArray(task.labels)) {
      task.labels.forEach((label: string) => {
        labelSet.add(label.toLowerCase());
      });
    }
  });

  const normalized = Array.from(labelSet).map((lower) => {
    const original = tasks
      .flatMap((t) => t.labels || [])
      .find((l: string) => l.toLowerCase() === lower);
    return original || lower;
  });

  return normalized.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}
