import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyFirebaseToken } from "./middleware/auth.js";
import todoRoutes from "./routes/todos.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/todos", verifyFirebaseToken, todoRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
