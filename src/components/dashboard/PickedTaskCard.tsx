import { type ReactNode } from 'react';
import type { Task, PickCategory } from '../../domain/types';
import { TaskMeta } from '../TaskMeta';

interface PickedTaskCardProps {
  category: PickCategory;
  task: Task;
  actions: ReactNode;
}

const categoryLabels: Record<PickCategory, string> = {
  quick: 'Schnellauswahl',
  any: 'Beliebige Auswahl',
  big: 'Große Auswahl',
};

export function PickedTaskCard({ category, task, actions }: PickedTaskCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <p className="text-sm text-indigo-400 font-medium mb-2">{categoryLabels[category]}</p>
      <h2 className="text-xl font-semibold text-slate-100 mb-4">{task.title}</h2>
      
      <div className="mb-4">
        <TaskMeta task={task} />
      </div>
      
      {task.notes && (
        <p className="text-slate-300 text-sm mb-6 whitespace-pre-wrap">{task.notes}</p>
      )}
      
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  );
}
