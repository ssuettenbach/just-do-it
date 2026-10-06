import type { PickCategory, Task } from './types';

export const QUICK_MAX_MINUTES = 5;
export const BIG_MIN_MINUTES = 30;

export function isEligible(task: Task, category: PickCategory): boolean {
  if (task.status !== 'open') return false;

  if (category === 'quick') {
    return task.estimateMinutes !== null && task.estimateMinutes >= 0 && task.estimateMinutes <= QUICK_MAX_MINUTES;
  }

  if (category === 'big') {
    return task.estimateMinutes !== null && task.estimateMinutes >= BIG_MIN_MINUTES;
  }

  if (category === 'any') {
    return true;
  }

  return false;
}

export function getCandidates(tasks: Task[], category: PickCategory): Task[] {
  return tasks.filter((task) => isEligible(task, category));
}

export function randomIndex(length: number): number {
  if (length <= 0) {
    throw new Error('length must be > 0');
  }

  const randomValues = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(randomValues);
    const randomValue = randomValues[0];
    const index = randomValue % length;

    if (randomValue - index <= 0xffffffff - (length - 1)) {
      return index;
    }
  }
}

export function pickRandom(candidates: Task[], excludeId?: string): Task | null {
  if (candidates.length === 0) return null;

  let validCandidates = candidates;

  if (excludeId && candidates.length >= 2) {
    validCandidates = candidates.filter((t) => t.id !== excludeId);
    if (validCandidates.length === 0) {
      validCandidates = candidates;
    }
  }

  const index = randomIndex(validCandidates.length);
  return validCandidates[index];
}
