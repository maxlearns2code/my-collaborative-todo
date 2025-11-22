"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { auth } from "../../lib/firebase";
import type { Todo } from "../../types/todo";
import type { User } from "../../types/user";
import { AssignSelect } from "../../components/todo/AssignSelect";
import { TodoCard } from "../../components/todo/TodoCard";
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
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24 }}>
      <h2>My Collaborative Todos</h2>
      <form onSubmit={handleCreateTodo} style={{ marginBottom: 16 }}>
        <input
          value={newTodo.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange("title", e.target.value)}
          type="text"
          placeholder="Todo title"
          required
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          value={newTodo.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange("description", e.target.value)}
          type="text"
          placeholder="Description"
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <AssignSelect
          users={users}
          selected={newTodo.assigneeIds}
          onChange={(ids: string[]) => handleFormChange("assigneeIds", ids)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 8, marginTop: 8 }}
        >
          Create Todo
        </button>
      </form>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      {loading && <div>Loading...</div>}

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

      <button
        onClick={() => router.push("/")}
        className="btn"
        aria-label="Go to Home"
      >
        ← Back to Home
      </button>
    </div>
  );
}
