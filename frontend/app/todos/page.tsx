"use client";

import { Sidebar } from "../../components/layout/Sidebar";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Todo } from "../../types/todo";
import type { User } from "../../types/user";
import { AssignSelect } from "../../components/todo/AssignSelect";
import { TodoCard } from "../../components/todo/TodoCard";
import { apiRequest } from "../../lib/api";
import { auth } from "../../lib/firebase";

export default function TodosPage() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState<{
    title: string;
    description: string;
    assigneeIds: string[];
  }>({
    title: "",
    description: "",
    assigneeIds: [],
  });
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth redirect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      }
    });
    return unsubscribe;
  }, [router]);

  // Get token and current user on mount
  useEffect(() => {
    const fetchTokenAndUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setToken(await user.getIdToken());
        const profile = users.find((u) => u.uid === user.uid) ?? {
          uid: user.uid,
          name: user.displayName ?? "Unnamed",
          email: user.email ?? "",
          avatarUrl: user.photoURL ?? "",
        };
        setCurrentUser(profile);
      }
    };
    fetchTokenAndUser();
  }, [users]);

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

  // Create todo form handler
  const handleFormChange = (
    field: "title" | "description" | "assigneeIds",
    value: string | string[]
  ) => {
    setNewTodo((t) => ({ ...t, [field]: value }));
  };

  // Create todo
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

  // Edit modal form handlers
  const handleEditTitle = (v: string) =>
    setEditTodo((t) => (t ? { ...t, title: v } : t));
  const handleEditDescription = (v: string) =>
    setEditTodo((t) => (t ? { ...t, description: v } : t));
  const handleEditAssignees = (ids: string[]) =>
    setEditTodo((t) => (t ? { ...t, assigneeIds: ids } : t));

  // Update todo (modal)
  const handleUpdateTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !editTodo) return;
    setLoading(true);
    try {
      const updated = await apiRequest(
        `/todos/${editTodo.id}`,
        "PUT",
        editTodo,
        token
      );
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTodo(null);
      setEditOpen(false);
    } catch {
      setError("Failed to update todo.");
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
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Failed to update todo.");
    } finally {
      setLoading(false);
    }
  };

  // Optimistic Delete todo
  const handleDelete = async (id: string) => {
    if (!token) return;
    // Optimistically remove item from state
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/todos/${id}`, "DELETE", null, token);
      // Success: nothing else needed
    } catch {
      setError("Couldn't reach the server. Please check your connection.");
      // Optionally: Refetch or restore todo if necessary.
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };
  // Sidebar stats: calculate before return!
  const ownedCount = todos.filter((t) => t.ownerId === currentUser?.uid).length;
  const assignedCount = todos.filter(
    (t) => t.assigneeIds && t.assigneeIds.includes(currentUser?.uid ?? "")
  ).length;
  const completedCount = todos.filter((t) => t.status === "done").length;
  const openCount = todos.filter((t) => t.status === "open").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentUser={currentUser}
        ownedCount={ownedCount}
        assignedCount={assignedCount}
        completedCount={completedCount}
        openCount={openCount}
        onLogout={handleLogout}
      />
      <main className="flex-1 bg-gray-50 py-10 px-8">
        <div className="w-full max-w-2xl flex flex-col gap-4 mx-auto">
          {/* Create Todo Card */}
          <Card className="p-8 mb-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Team Tasks Dashboard
            </h1>
            <form onSubmit={handleCreateTodo} className="flex flex-col gap-4">
              <Label htmlFor="todo-title">Todo title</Label>
              <Input
                id="todo-title"
                value={newTodo.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Todo title"
                required
              />
              <Label htmlFor="todo-desc">Description</Label>
              <Input
                id="todo-desc"
                value={newTodo.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Description"
              />
              <AssignSelect
                users={users}
                selected={newTodo.assigneeIds}
                onChange={(ids: string[]) =>
                  handleFormChange("assigneeIds", ids)
                }
              />
              <Button type="submit" disabled={loading} className="mt-3">
                Create Todo
              </Button>
            </form>
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </Card>
          {loading && <div className="text-center">Loading...</div>}

          {/* Todos List */}
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              users={users}
              onToggleStatus={handleToggleStatus}
              onEdit={() => {
                setEditTodo(todo);
                setEditOpen(true);
              }}
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

          {/* Modal-based Edit */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            {editOpen && (
              <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center transition-all">
                <Card className="w-full max-w-md p-6">
                  <form
                    onSubmit={handleUpdateTodo}
                    className="flex flex-col gap-4"
                  >
                    <h3 className="text-xl font-bold mb-2">Edit Todo</h3>
                    <Input
                      value={editTodo?.title ?? ""}
                      onChange={(e) => handleEditTitle(e.target.value)}
                      placeholder="Todo title"
                      required
                    />
                    <Input
                      value={editTodo?.description ?? ""}
                      onChange={(e) => handleEditDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <AssignSelect
                      users={users}
                      selected={editTodo?.assigneeIds ?? []}
                      onChange={handleEditAssignees}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button type="submit" disabled={loading}>
                        Update
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditOpen(false);
                          setEditTodo(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                  {error && <div className="text-red-600 mt-4">{error}</div>}
                </Card>
              </div>
            )}
          </Dialog>
        </div>
      </main>
    </div>
  );
}
