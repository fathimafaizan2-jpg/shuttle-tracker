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

/*
  Only these trusted browser origins may call the protected API.
  GitHub Pages is explicitly included so browser login can work even if a
  Render environment variable is delayed or not loaded after redeployment.
*/
const allowedOrigins = new Set(
  [
    "https://fathimafaizan2-jpg.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.APP_ORIGIN?.trim( ).replace(/\/$/, "")
  ].filter((origin): origin is string => Boolean(origin))
);

app.use((request, response, next) => {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.setHeader("Vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  next();
});

/* Image bytes must be parsed before the global JSON parser. The route still enforces Super Admin membership. */
app.use("/api/business/admin/upload-image", express.raw({
  type: ["image/png", "image/jpeg", "image/webp"],
  limit: "2mb"
}));

app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "Indian Club Bahrain API",
    time: new Date().toISOString()
  });
});

/* Public Indi Mart routes are intentionally inside businessRouter under /api/business/public. */
app.use("/api/activities", activitiesRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/finance", financeRouter);
app.use("/api/arrears", arrearsRouter);
app.use("/api/members", membersRouter);
app.use("/api/business", businessRouter);
app.use("/api/reports", reportsRouter);

/* Render can also serve the static app shell if needed. */
app.use(express.static(projectRoot, {
  index: "index.html",
  extensions: ["html"]
}));

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", error);
  response.status(500).json({ message: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`Indian Club Bahrain API running on port ${port}`);
});
