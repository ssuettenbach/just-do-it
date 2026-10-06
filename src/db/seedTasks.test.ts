import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from './database';
import { seedDatabase, clearDatabase } from './seedTasks';

describe('seedTasks', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should seed the database with sample tasks', async () => {
    await seedDatabase();
    const tasks = await db.tasks.toArray();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should create tasks with various statuses', async () => {
    await seedDatabase();
    const tasks = await db.tasks.toArray();
    const openTasks = tasks.filter(t => t.status === 'open');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    expect(openTasks.length).toBeGreaterThan(0);
    expect(completedTasks.length).toBeGreaterThan(0);
  });

  it('should create tasks with various priorities', async () => {
    await seedDatabase();
    const tasks = await db.tasks.toArray();

    const withEstimates = tasks.filter(t => t.estimateMinutes !== null);
    const withoutEstimates = tasks.filter(t => t.estimateMinutes === null);

    expect(withEstimates.length).toBeGreaterThan(0);
    expect(withoutEstimates.length).toBeGreaterThan(0);
  });

  it('should create tasks with various due dates', async () => {
    await seedDatabase();
    const tasks = await db.tasks.toArray();

    const withDueDates = tasks.filter(t => t.dueDate !== null);
    const withoutDueDates = tasks.filter(t => t.dueDate === null);

    expect(withDueDates.length).toBeGreaterThan(0);
    expect(withoutDueDates.length).toBeGreaterThan(0);
  });

  it('should create tasks with various labels', async () => {
    await seedDatabase();
    const tasks = await db.tasks.toArray();

    const uniqueLabels = new Set<string>();
    tasks.forEach(t => t.labels.forEach(label => uniqueLabels.add(label)));

    expect(uniqueLabels.size).toBeGreaterThan(0);
  });

  it('should clear the database', async () => {
    await seedDatabase();
    await clearDatabase();
    const tasks = await db.tasks.toArray();
    expect(tasks.length).toBe(0);
  });
});
