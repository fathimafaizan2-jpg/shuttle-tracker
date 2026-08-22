import "dotenv/config";
import cors from "cors";
import express from "express";
import { requireAuth } from "./auth.js";
import { activitiesRouter } from "./routes/activities.js";
import { arrearsRouter } from "./routes/arrears.js";
import { attendanceRouter } from "./routes/attendance.js";
import { businessRouter } from "./routes/business.js";
import { financeRouter } from "./routes/finance.js";
import { inventoryRouter } from "./routes/inventory.js";
import { membersRouter } from "./routes/members.js";
import { reportsRouter } from "./routes/reports.js";
import { timetableRouter } from "./routes/timetable.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true, methods: ["GET", "POST", "PUT", "PATCH"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, app: "Indian Club" }));
app.get("/api/me", requireAuth, (req, res) => res.json(req.member));

app.use("/api/activities", activitiesRouter);
app.use("/api/arrears", arrearsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/business", businessRouter);
app.use("/api/finance", financeRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/members", membersRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/timetable", timetableRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(400).json({ error: message });
});

app.listen(Number(process.env.PORT ?? 3000), () => console.log("Indian Club server running"));
