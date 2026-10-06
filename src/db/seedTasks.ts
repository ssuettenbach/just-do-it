import { createTask } from '../domain/taskFactory';
import type { Task } from '../domain/types';
import { db } from './database';

const sampleTasks: Partial<Task>[] = [
  {
    title: 'Projektvorschlag fertigstellen',
    estimateMinutes: 120,
    dueDate: '2026-10-12',
    labels: ['arbeit', 'dringend'],
    status: 'open'
  },
  {
    title: 'Nebenkosten bezahlen',
    estimateMinutes: 15,
    dueDate: '2026-10-08',
    labels: ['privat', 'finanzen'],
    status: 'open'
  },
  {
    title: 'Steuerunterlagen einreichen',
    estimateMinutes: 60,
    dueDate: '2026-10-10',
    labels: ['finanzen', 'wichtig'],
    status: 'open'
  },
  {title: 'Einkaufen', estimateMinutes: 45, dueDate: '2026-10-07', labels: ['privat', 'einkauf'], status: 'open'},
  {
    title: 'Garage aufräumen',
    estimateMinutes: 180,
    dueDate: '2026-10-15',
    labels: ['zuhause', 'haushalt'],
    status: 'open'
  },
  {
    title: 'Zahnarzttermin vereinbaren',
    estimateMinutes: 10,
    dueDate: '2026-10-20',
    labels: ['gesundheit', 'privat'],
    status: 'open'
  },
  {title: 'Neues Buch lesen', estimateMinutes: null, dueDate: null, labels: ['freizeit', 'lesen'], status: 'open'},
  {
    title: 'Fotosammlung ordnen',
    estimateMinutes: 90,
    dueDate: null,
    labels: ['privat', 'organisation'],
    status: 'open'
  },
  {
    title: 'TypeScript-Patterns lernen',
    estimateMinutes: 150,
    dueDate: null,
    labels: ['lernen', 'entwicklung'],
    status: 'open'
  },
  {title: 'Mama anrufen', estimateMinutes: 5, dueDate: '2026-10-06', labels: ['familie'], status: 'open'},
  {title: 'Pflanzen gießen', estimateMinutes: 10, dueDate: null, labels: ['zuhause', 'haushalt'], status: 'open'},
  {title: 'E-Mails prüfen', estimateMinutes: 5, dueDate: null, labels: ['arbeit'], status: 'open'},
  {title: 'Bücher zurückgeben', estimateMinutes: 20, dueDate: '2026-10-01', labels: ['privat'], status: 'open'},
  {
    title: 'Spesenabrechnung einreichen',
    estimateMinutes: 30,
    dueDate: '2026-09-30',
    labels: ['arbeit', 'finanzen'],
    status: 'open'
  },
  {
    title: 'Wochenbericht abschließen',
    estimateMinutes: 45,
    dueDate: '2026-10-04',
    labels: ['arbeit'],
    status: 'completed'
  },
  {
    title: 'Geschenk zum Geburtstag kaufen',
    estimateMinutes: 60,
    dueDate: '2026-10-03',
    labels: ['privat', 'einkauf'],
    status: 'completed'
  },
  {
    title: 'Bug auf Login-Seite beheben',
    estimateMinutes: 90,
    dueDate: '2026-10-02',
    labels: ['arbeit', 'entwicklung'],
    status: 'completed'
  },
  {
    title: 'Teammeeting planen',
    estimateMinutes: 30,
    dueDate: '2026-10-09',
    labels: ['arbeit', 'meeting'],
    notes: 'Q4-Ziele und Projektzeitpläne besprechen. Alle Teammitglieder einladen.',
    status: 'open'
  },
  {
    title: 'Urlaubsziele recherchieren',
    estimateMinutes: 120,
    dueDate: null,
    labels: ['privat', 'reisen'],
    notes: 'Suche nach warmen Orten im Dezember. Budget: 2000-3000 €.',
    status: 'open'
  },
  {
    title: 'Lebenslauf aktualisieren',
    estimateMinutes: 180,
    dueDate: '2026-11-01',
    labels: ['karriere', 'wichtig'],
    status: 'open'
  },
  {
    title: 'Computerdateien sichern',
    estimateMinutes: 45,
    dueDate: null,
    labels: ['technik', 'wartung'],
    status: 'open'
  },
  {
    title: 'Blogartikel schreiben',
    estimateMinutes: 240,
    dueDate: '2026-10-30',
    labels: ['schreiben', 'kreativ'],
    status: 'open'
  },
];

export async function seedDatabase(): Promise<void> {
  const now = new Date().toISOString();
  const existingTasks = await db.tasks.toArray();

  if (existingTasks.length > 0) {
    console.log(`Die Datenbank enthält bereits ${existingTasks.length} Aufgaben. Überspringe das Befüllen.`);
    return;
  }

  for (const taskData of sampleTasks) {
    try {
      const taskInput = {
        title: taskData.title!,
        estimateMinutes: taskData.estimateMinutes ?? null,
        dueDate: taskData.dueDate ?? null,
        notes: taskData.notes || '',
        labels: taskData.labels || [],
      };

      const task = createTask(taskInput, new Date());

      if (taskData.status === 'completed') {
        task.status = 'completed';
        task.completedAt = now;
        task.updatedAt = now;
      }

      await db.tasks.add(task);
    } catch (error) {
      console.error(`Fehler beim Befüllen der Aufgabe: ${taskData.title}`, error);
    }
  }

  console.log(`${sampleTasks.length} Aufgaben in die Datenbank eingefügt.`);
}

export async function clearDatabase(): Promise<void> {
  await db.tasks.clear();
  console.log('Alle Aufgaben aus der Datenbank entfernt.');
}

export async function seedIfEmpty(): Promise<void> {
  const existingTasks = await db.tasks.toArray();
  if (existingTasks.length === 0) {
    await seedDatabase();
  }
}
