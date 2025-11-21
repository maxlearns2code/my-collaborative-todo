export type TodoStatus = "open" | "in_progress" | "done";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  ownerId: string;
  assigneeIds: string[];
  participants: string[]; // owner + assignees
  createdAt: number;
  updatedAt: number;
}
