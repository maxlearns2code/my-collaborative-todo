import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "../../types/user";
import type { Todo } from "../../types/todo";

interface TodoCardProps {
  todo: Todo;
  users: User[];
  onToggleStatus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export function TodoCard({
  todo,
  users,
  onToggleStatus,
  onEdit,
  onDelete,
}: TodoCardProps) {
  const assigneeObjs: User[] = todo.assigneeIds
    .map((uid: string) => users.find((u: User) => u.uid === uid))
    .filter((u): u is User => Boolean(u));

  return (
    <Card className="mb-4 p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-bold">{todo.title}</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${todo.status === "done" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
            {todo.status}
          </span>
        </div>
      </div>
      <div className="text-muted-foreground">{todo.description}</div>
      <div className="flex gap-2 items-center my-1">
        {assigneeObjs.map((u: User) => (
          <span key={u.uid} className="px-2 py-1 rounded bg-gray-100 text-sm">{u.name}</span>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={() => onToggleStatus(todo)}>
          {todo.status === "open" ? "Mark as done" : "Reopen"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(todo)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(todo)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
