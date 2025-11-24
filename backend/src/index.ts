import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyFirebaseToken } from "./middleware/auth.js";
import todoRoutes from "./routes/todos.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

console.log("Starting server, PORT =", process.env.PORT);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/todos", verifyFirebaseToken, todoRoutes);
app.use("/users", verifyFirebaseToken, usersRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
