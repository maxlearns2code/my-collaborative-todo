import type { Response } from "express";
import { Router } from "express";
import { db } from "../firebase.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { Todo, TodoStatus } from "../types.js";

const router = Router();
const collection = db.collection("todos");

// Get all todos for current user (owner or assignee)
router.get("/", async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
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
});

// Create todo
router.post("/", async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { title, description, assigneeIds = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });

  const now = Date.now();
  const data = {
    title,
    description: description || "",
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
});

// Update todo (only owner or assignee)
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = req.params.id;
  if (typeof id !== "string" || !id)
    return res.status(400).json({ error: "Invalid or missing ID" });
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });

  const data = doc.data()!;
  if (!data.participants?.includes(userId)) {
    return res.status(403).json({ error: "Not allowed" });
  }

  const { title, description, status, assigneeIds } = req.body;
  const update: any = { updatedAt: Date.now() };
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (status !== undefined) update.status = status as TodoStatus;
  if (assigneeIds !== undefined) {
    update.assigneeIds = assigneeIds;
    update.participants = [data.ownerId, ...assigneeIds];
  }

  await docRef.update(update);
  const updated = (await docRef.get()).data();
  res.json({ id, ...(updated as any) });
});

// Delete todo (only owner can delete)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = req.params.id;
  if (typeof id !== "string" || !id)
    return res.status(400).json({ error: "Invalid or missing ID" });
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });

  const data = doc.data()!;
  if (data.ownerId !== userId) {
    return res.status(403).json({ error: "Only owner can delete" });
  }

  await docRef.delete();
  res.status(204).send();
});

export default router;
