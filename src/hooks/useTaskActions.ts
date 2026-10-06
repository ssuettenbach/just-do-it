import {
  addTask as addTaskRepo,
  updateTask as updateTaskRepo,
  completeTaskById as completeTaskByIdRepo,
  reopenTaskById as reopenTaskByIdRepo,
  deleteTask as deleteTaskRepo,
} from '../db/taskRepository';
import type { Task, TaskInput } from '../domain/types';

export function useTaskActions() {
  return {
    addTask: (input: TaskInput) => addTaskRepo(input),
    updateTask: (id: string, input: TaskInput) => updateTaskRepo(id, input),
    completeTask: (id: string) => completeTaskByIdRepo(id),
    reopenTask: (id: string) => reopenTaskByIdRepo(id),
    deleteTask: (id: string) => deleteTaskRepo(id),
  };
}
