export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: "open" | "done";
  ownerId: string;
  participants: string[];
  createdAt: number;
  updatedAt: number;
}
