import {
  addTask as addTaskRepo,
  completeTaskById as completeTaskByIdRepo,
  deleteTask as deleteTaskRepo,
  reopenTaskById as reopenTaskByIdRepo,
  updateTask as updateTaskRepo,
} from '../db/taskRepository';
import type { TaskInput } from '../domain/types';

export function useTaskActions() {
  return {
    addTask: (input: TaskInput) => addTaskRepo(input),
    updateTask: (id: string, input: TaskInput) => updateTaskRepo(id, input),
    completeTask: (id: string) => completeTaskByIdRepo(id),
    reopenTask: (id: string) => reopenTaskByIdRepo(id),
    deleteTask: (id: string) => deleteTaskRepo(id),
  };
}
