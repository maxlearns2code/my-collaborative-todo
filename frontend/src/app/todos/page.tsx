"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { auth } from "../../lib/firebase";
import type { Todo } from "../../types/todo";
import type { User } from "../../types/user";
import { AssignSelect } from "../../components/todo/AssignSelect";
import { TodoCard } from "../../components/todo/TodoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function TodosPage() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState<{ title: string; description: string; assigneeIds: string[] }>({
    title: "",
    description: "",
    assigneeIds: []
  });
  const [error, setError] = useState("");

  // Auth redirect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/"); // Redirect to home if not logged in
      }
    });
    return unsubscribe;
  }, [router]);

  // Get token on mount
  useEffect(() => {
    const fetchToken = async () => {
      const user = auth.currentUser;
      if (user) {
        setToken(await user.getIdToken());
      }
    };
    fetchToken();
  }, []);

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const usersList = await apiRequest("/users", "GET", null, token);
        setUsers(usersList);
      } catch {
        setError("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const todosData = await apiRequest("/todos", "GET", null, token);
        setTodos(todosData);
      } catch {
        setError("Failed to fetch todos.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [token]);

  // Typed form change handler
  const handleFormChange = (field: "title" | "description" | "assigneeIds", value: string | string[]) => {
    setNewTodo((t) => ({ ...t, [field]: value }));
  };

  const handleCreateTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const created = await apiRequest("/todos", "POST", newTodo, token);
      setTodos((prev) => [...prev, created]);
      setNewTodo({ title: "", description: "", assigneeIds: [] });
    } catch {
      setError("Failed to create todo.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (todo: Todo) => {
    if (!token) return;
    setLoading(true);
    try {
      const updated = await apiRequest(
        `/todos/${todo.id}`,
        "PUT",
        { ...todo, status: todo.status === "open" ? "done" : "open" },
        token
      );
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Failed to update todo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiRequest(`/todos/${id}`, "DELETE", null, token);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch {
      setError("Failed to delete todo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen flex justify-center py-10">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">My Collaborative Todos</h2>
          <form onSubmit={handleCreateTodo} className="flex flex-col gap-4">
            <Input
              value={newTodo.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="Todo title"
              required
            />
            <Input
              value={newTodo.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Description"
            />
            <AssignSelect
              users={users}
              selected={newTodo.assigneeIds}
              onChange={(ids: string[]) => handleFormChange("assigneeIds", ids)}
            />
            <Button
              type="submit"
              disabled={loading}
              className="mt-3"
            >
              Create Todo
            </Button>
          </form>
          {error && <div className="text-red-600 mt-4">{error}</div>}
        </Card>
        {loading && <div className="text-center">Loading...</div>}
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            users={users}
            onToggleStatus={handleToggleStatus}
            onEdit={() => {}}
            onDelete={(todo: Todo) => handleDelete(todo.id)}
          />
        ))}
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mt-6"
        >
          ← Back to Home
        </Button>
      </div>
    </main>
  );
}
