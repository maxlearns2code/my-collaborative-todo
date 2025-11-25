export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: "open" | "done";
  ownerId: string;
  assigneeIds: string[];
  createdAt: number;
  updatedAt: number;
}
