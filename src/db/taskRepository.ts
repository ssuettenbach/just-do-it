import type { Task, TaskInput, PickCategory } from '../domain/types';
import { db } from './database';
import { createTask, applyUpdate, completeTask, reopenTask } from '../domain/taskFactory';
import { getCandidates, pickRandom } from '../domain/picker';

export async function addTask(input: TaskInput): Promise<Task> {
  const task = createTask(input);
  await db.tasks.add(task);
  return task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const task = await db.tasks.get(id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }

  const updated = applyUpdate(task, input);
  await db.tasks.put(updated);
  return updated;
}

export async function completeTaskById(id: string): Promise<Task> {
  const task = await db.tasks.get(id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }

  const completed = completeTask(task);
  await db.tasks.put(completed);
  return completed;
}

export async function reopenTaskById(id: string): Promise<Task> {
  const task = await db.tasks.get(id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }

  const reopened = reopenTask(task);
  await db.tasks.put(reopened);
  return reopened;
}

export async function deleteTask(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }

  await db.tasks.delete(id);
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function getOpenTasks(): Promise<Task[]> {
  return db.tasks.where('status').equals('open').toArray();
}

export async function getCompletedTasks(): Promise<Task[]> {
  return db.tasks.where('status').equals('completed').toArray();
}

export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}

export async function pickTask(category: PickCategory, excludeId?: string): Promise<Task | null> {
  const openTasks = await getOpenTasks();
  const candidates = getCandidates(openTasks, category);
  return pickRandom(candidates, excludeId);
}
