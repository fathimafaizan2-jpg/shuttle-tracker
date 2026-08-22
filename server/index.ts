import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import activitiesRouter from "./routes/activities.js";
import timetableRouter from "./routes/timetable.js";
import attendanceRouter from "./routes/attendance.js";
import inventoryRouter from "./routes/inventory.js";
import financeRouter from "./routes/finance.js";
import arrearsRouter from "./routes/arrears.js";
import membersRouter from "./routes/members.js";
import businessRouter from "./routes/business.js";
import reportsRouter from "./routes/reports.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const app = express();
const port = Number(process.env.PORT || 3000);

/* Local development CORS only. In production, set APP_ORIGIN to your own site URL. */
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.APP_ORIGIN
].filter(Boolean ));

app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (!origin || allowedOrigins.has(origin)) {
    if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    if (request.method === "OPTIONS") return response.status(204).end();
  }
  next();
});

app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "Indian Club Bahrain API", time: new Date().toISOString() });
});

/* Public endpoints exist only inside businessRouter under /api/business/public. */
app.use("/api/activities", activitiesRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/finance", financeRouter);
app.use("/api/arrears", arrearsRouter);
app.use("/api/members", membersRouter);
app.use("/api/business", businessRouter);
app.use("/api/reports", reportsRouter);

/* Serve the static HTML/CSS/JS interface when this Express server is used locally. */
app.use(express.static(projectRoot, {
  index: "index.html",
  extensions: ["html"]
}));

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", error);
  response.status(500).json({ message: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`Indian Club Bahrain is running at http://localhost:${port}` );
});
