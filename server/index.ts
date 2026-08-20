import "dotenv/config";
import cors from "cors";
import express from "express";
import { businessRouter } from "./routes/business.js";
import { attendanceRouter } from "./routes/attendance.js";
import { financeRouter } from "./routes/finance.js";
import { membersRouter } from "./routes/members.js";
import { timetableRouter } from "./routes/timetable.js";
import { inventoryRouter } from "./routes/inventory.js";
import { reportsRouter } from "./routes/reports.js";
import { arrearsRouter } from "./routes/arrears.js";
import { activitiesRouter } from "./routes/activities.js";
import { requireAuth } from "./auth.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, methods: ["GET", "POST", "PUT", "PATCH"] }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/me", requireAuth, (req, res) => res.json(req.member));

app.use("/api/business", businessRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/finance", financeRouter);
app.use("/api/members", membersRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/arrears", arrearsRouter);
app.use("/api/activities", activitiesRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected error";
  res.status(message.includes("Invalid") ? 400 : 500).json({ error: message });
});

app.listen(Number(process.env.PORT ?? 3000), () => console.log("Indian Club API running"));
