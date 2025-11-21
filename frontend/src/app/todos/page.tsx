"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { apiRequest } from "../../lib/api";
import type { Todo } from "../../types/todo";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

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

  // Fetch todos
  useEffect(() => {
    if (token) {
      setLoading(true);
      apiRequest("/todos", "GET", null, token)
        .then(setTodos)
        .catch(() => setError("Failed to fetch todos."))
        .finally(() => setLoading(false));
    }
  }, [token]);

  // Create todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const created = await apiRequest("/todos", "POST", newTodo, token);
      setTodos((prev) => [...prev, created]);
      setNewTodo({ title: "", description: "" });
    } catch {
      setError("Failed to create todo.");
    } finally {
      setLoading(false);
    }
  };

  // Delete todo
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

  // Toggle status
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
      setTodos((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch {
      setError("Failed to update todo.");
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
          onChange={(e) =>
            setNewTodo((t) => ({ ...t, title: e.target.value }))
          }
          type="text"
          placeholder="Todo title"
          required
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          value={newTodo.description}
          onChange={(e) =>
            setNewTodo((t) => ({ ...t, description: e.target.value }))
          }
          type="text"
          placeholder="Description"
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 8 }}
        >
          Create Todo
        </button>
      </form>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ marginBottom: 12 }}>
            <strong>{todo.title}</strong> - {todo.status}
            <div>{todo.description}</div>
            <button onClick={() => handleToggleStatus(todo)}>
              Mark as {todo.status === "open" ? "done" : "open"}
            </button>
            <button
              style={{ marginLeft: 8, color: "red" }}
              onClick={() => handleDelete(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
