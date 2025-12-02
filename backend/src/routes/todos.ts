import { Router } from "express";
import type { Response, RequestHandler } from "express";
import { db } from "../firebase.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { Todo, TodoStatus } from "../types.js";

const router = Router();
const collection = db.collection("todos");
const allowedStatuses: TodoStatus[] = ["open", "in_progress", "done"];

// GET /todos – all todos for current user (owner or assignee)
const getTodos: RequestHandler = async (req, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest;

  const snap = await collection
    .where("participants", "array-contains", userId)
    .orderBy("createdAt", "desc")
    .get();

  const todos: Todo[] = snap.docs.map(
    (d: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: d.id,
      ...(d.data() as any),
    })
  );

  res.json(todos);
};

router.get("/", getTodos);

// POST /todos – create todo
const createTodo: RequestHandler = async (req, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest;
  const { title, description, assigneeIds = [] } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "Title required" });
    return;
  }

  if (
    !Array.isArray(assigneeIds) ||
    !assigneeIds.every((x: unknown) => typeof x === "string")
  ) {
    res.status(400).json({ error: "Invalid assigneeIds" });
    return;
  }

  const now = Date.now();
  const data = {
    title,
    description: description ? String(description) : "",
    status: "open" as TodoStatus,
    ownerId: userId,
    assigneeIds,
    participants: [userId, ...assigneeIds],
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await collection.add(data);
  const todo: Todo = { id: docRef.id, ...(data as any) };
  res.status(201).json(todo);
};

router.post("/", createTodo);

// PUT /todos/:id – update todo (only owner or assignee)
const updateTodo: RequestHandler = async (req, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest;
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }

  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const data = doc.data()!;
  if (!data.participants?.includes(userId)) {
    res.status(403).json({ error: "Not allowed" });
    return;
  }

  const { title, description, status, assigneeIds } = req.body;
  const update: Partial<Todo> & { updatedAt: number } = {
    updatedAt: Date.now(),
  };

  if (title !== undefined) update.title = String(title);
  if (description !== undefined) update.description = String(description);

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    update.status = status;
  }

  if (assigneeIds !== undefined) {
    if (
      !Array.isArray(assigneeIds) ||
      !assigneeIds.every((x: unknown) => typeof x === "string")
    ) {
      res.status(400).json({ error: "Invalid assigneeIds" });
      return;
    }
    update.assigneeIds = assigneeIds;
    update.participants = [data.ownerId, ...assigneeIds];
  }

  await docRef.update(update);
  const updated = (await docRef.get()).data();
  res.json({ id, ...(updated as any) });
};

router.put("/:id", updateTodo);

// DELETE /todos/:id – delete todo (only owner)
const deleteTodo: RequestHandler = async (req, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest;
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }

  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const data = doc.data()!;
  if (data.ownerId !== userId) {
    res.status(403).json({ error: "Only owner can delete" });
    return;
  }

  await docRef.delete();
  res.status(204).send();
};

router.delete("/:id", deleteTodo);

export default router;
