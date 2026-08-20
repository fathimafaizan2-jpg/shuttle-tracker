// server/routes/business.ts
// Replace your current business.ts with this complete version.

import { randomBytes } from "node:crypto";
import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const businessRouter = Router();

const PUBLIC_APPROVED = "APPROVED";
const PENDING = "PENDING_SUPER_ADMIN_APPROVAL";

const phone = z.string().trim().min(6).max(30);
const imageUrl = z.string().url().max(1500).optional();

const businessSubmission = z.object({
  businessName: z.string().trim().min(2).max(100),
  ownerName: z.string().trim().min(2).max(100),
  phone,
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().min(10).max(1000),
  packageId: z.string().trim().min(1).max(80),
  flyerUrl: imageUrl,
  googleMapsUrl: imageUrl,
  websiteUrl: imageUrl,
  discountText: z.string().trim().max(300).optional()
});

const publicNotice = z.object({
  title: z.string().trim().min(2).max(140),
  body: z.string().trim().min(2).max(2000),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  startsAtUtc: z.number().int().optional(),
  endsAtUtc: z.number().int().optional(),
  posterUrl: imageUrl
});

const updateRequest = z.object({
  referenceCode: z.string().trim().regex(/^BIZ-[A-Z0-9]{8}$/),
  phone,
  flyerUrl: imageUrl,
  description: z.string().trim().max(1000).optional(),
  discountText: z.string().trim().max(300).optional(),
  googleMapsUrl: imageUrl,
  websiteUrl: imageUrl
}).refine(
  value => Boolean(value.flyerUrl || value.description || value.discountText || value.googleMapsUrl || value.websiteUrl),
  { message: "At least one update field is required" }
);

function createReferenceCode() {
  return `BIZ-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function normalisePhone(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

function nowUtc() {
  return Date.now();
}

function publicBusiness(data: Record<string, unknown>) {
  return {
    businessName: data.businessName,
    category: data.category,
    description: data.description,
    flyerUrl: data.flyerUrl ?? null,
    googleMapsUrl: data.googleMapsUrl ?? null,
    websiteUrl: data.websiteUrl ?? null,
    discountText: data.discountText ?? null,
    packageId: data.packageId,
    liveFromUtc: data.liveFromUtc ?? null,
    liveUntilUtc: data.liveUntilUtc ?? null
  };
}

// -----------------------------------------------------------------------------
// PUBLIC INDI MART COMMUNITY HUB — NO PLAYER LOGIN REQUIRED
// -----------------------------------------------------------------------------

// Public Indian Club notice ticker/banner. Only approved public notices are shown.
businessRouter.get("/public/notices", async (_req, res) => {
  const time = nowUtc();
  const rows = await db.collection("publicNotices")
    .where("status", "==", PUBLIC_APPROVED)
    .orderBy("priorityOrder", "desc")
    .limit(20)
    .get();

  const notices = rows.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((notice: any) =>
      (!notice.startsAtUtc || notice.startsAtUtc <= time) &&
      (!notice.endsAtUtc || notice.endsAtUtc >= time)
    );

  res.json(notices);
});

// Public sponsor carousel / grid. No phone number, owner name, or reference code is exposed.
businessRouter.get("/public/sponsors", async (_req, res) => {
  const time = nowUtc();
  const rows = await db.collection("businessSubmissions")
    .where("status", "==", PUBLIC_APPROVED)
    .limit(100)
    .get();

  const sponsors = rows.docs
    .map(doc => ({ id: doc.id, ...publicBusiness(doc.data()) }))
    .filter((business: any) => !business.liveUntilUtc || business.liveUntilUtc >= time)
    .filter((business: any) => !business.liveFromUtc || business.liveFromUtc <= time);

  res.json(sponsors);
});

// Public searchable Indi Mart directory.
businessRouter.get("/public/directory", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category.trim().toLowerCase() : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";

  const rows = await db.collection("businessSubmissions")
    .where("status", "==", PUBLIC_APPROVED)
    .limit(100)
    .get();

  const directory = rows.docs
    .map(doc => ({ id: doc.id, ...publicBusiness(doc.data()) }))
    .filter((business: any) => {
      const matchesCategory = !category || String(business.category).toLowerCase() === category;
      const text = `${business.businessName} ${business.category} ${business.description}`.toLowerCase();
      return matchesCategory && (!search || text.includes(search));
    });

  res.json(directory);
});

// Public footer form. This is the only public write route for businesses.
businessRouter.post("/public/submit", async (req, res) => {
  const input = businessSubmission.parse(req.body);
  const referenceCode = createReferenceCode();

  const doc = await db.collection("businessSubmissions").add({
    ...input,
    phoneNormalised: normalisePhone(input.phone),
    referenceCode,
    status: PENDING,
    liveFromUtc: null,
    liveUntilUtc: null,
    createdAt: FieldValue.serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  });

  // Display this once after submission. Do not expose it in public directory responses.
  res.status(201).json({
    id: doc.id,
    referenceCode,
    status: PENDING,
    message: "Save your Business Reference Code. It is required when requesting an update."
  });
});

// Public self-service advertiser update request. It NEVER changes a live ad directly.
// The request returns to the Super Admin review queue.
businessRouter.post("/public/update-request", async (req, res) => {
  const input = updateRequest.parse(req.body);
  const matchingBusiness = await db.collection("businessSubmissions")
    .where("referenceCode", "==", input.referenceCode)
    .limit(1)
    .get();

  if (matchingBusiness.empty) {
    return res.status(404).json({ error: "Business reference code not found" });
  }

  const business = matchingBusiness.docs[0];
  const current = business.data();
  if (normalisePhone(input.phone) !== current.phoneNormalised) {
    return res.status(403).json({ error: "Phone number does not match this business reference" });
  }

  const changes = {
    flyerUrl: input.flyerUrl ?? null,
    description: input.description ?? null,
    discountText: input.discountText ?? null,
    googleMapsUrl: input.googleMapsUrl ?? null,
    websiteUrl: input.websiteUrl ?? null
  };

  const requestDoc = await db.collection("businessUpdateRequests").add({
    businessId: business.id,
    referenceCode: input.referenceCode,
    changes,
    status: PENDING,
    submittedAt: FieldValue.serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  });

  res.status(201).json({ id: requestDoc.id, status: PENDING });
});

// -----------------------------------------------------------------------------
// SUPER ADMIN INDI MART, ADS, AND PUBLIC NOTICE MANAGEMENT
// -----------------------------------------------------------------------------

businessRouter.get("/admin/review-queue", requireAuth, requireRoles("SUPER_ADMIN"), async (_req, res) => {
  const [businesses, updates] = await Promise.all([
    db.collection("businessSubmissions").where("status", "==", PENDING).get(),
    db.collection("businessUpdateRequests").where("status", "==", PENDING).get()
  ]);

  res.json({
    businessSubmissions: businesses.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    updateRequests: updates.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
});

businessRouter.post("/admin/submissions/:id/review", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({
    approved: z.boolean(),
    reason: z.string().trim().max(500).optional(),
    liveFromUtc: z.number().int().optional(),
    liveUntilUtc: z.number().int().optional()
  }).parse(req.body);

  const status = input.approved ? PUBLIC_APPROVED : "REJECTED";
  await db.collection("businessSubmissions").doc(req.params.id).update({
    status,
    liveFromUtc: input.approved ? (input.liveFromUtc ?? nowUtc()) : null,
    liveUntilUtc: input.approved ? (input.liveUntilUtc ?? null) : null,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: req.member!.uid,
    rejectionReason: input.approved ? null : (input.reason ?? "Not approved")
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: `BUSINESS_SUBMISSION_${status}`,
    targetId: req.params.id,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ status });
});

businessRouter.post("/admin/update-requests/:id/review", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ approved: z.boolean(), reason: z.string().trim().max(500).optional() }).parse(req.body);
  const requestRef = db.collection("businessUpdateRequests").doc(req.params.id);
  const request = (await requestRef.get()).data();
  if (!request) return res.status(404).json({ error: "Update request not found" });

  if (input.approved) {
    const changes = Object.fromEntries(
      Object.entries(request.changes).filter(([, value]) => value !== null)
    );
    await db.collection("businessSubmissions").doc(request.businessId).update({
      ...changes,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: req.member!.uid
    });
  }

  const status = input.approved ? PUBLIC_APPROVED : "REJECTED";
  await requestRef.update({
    status,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: req.member!.uid,
    rejectionReason: input.approved ? null : (input.reason ?? "Not approved")
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: `BUSINESS_UPDATE_REQUEST_${status}`,
    targetId: req.params.id,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ status });
});

businessRouter.post("/admin/notices", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = publicNotice.parse(req.body);
  const priorityOrder = input.priority === "URGENT" ? 3 : input.priority === "HIGH" ? 2 : 1;
  const doc = await db.collection("publicNotices").add({
    ...input,
    priorityOrder,
    status: PUBLIC_APPROVED,
    createdBy: req.member!.uid,
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "PUBLIC_NOTICE_CREATED",
    targetId: doc.id,
    createdAt: FieldValue.serverTimestamp()
  });

  res.status(201).json({ id: doc.id });
});

// Direct Super Admin update option when an advertiser sends a new flyer through WhatsApp.
businessRouter.patch("/admin/submissions/:id", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const patch = z.object({
    flyerUrl: imageUrl,
    description: z.string().trim().max(1000).optional(),
    discountText: z.string().trim().max(300).optional(),
    googleMapsUrl: imageUrl,
    websiteUrl: imageUrl,
    liveUntilUtc: z.number().int().nullable().optional()
  }).parse(req.body);

  await db.collection("businessSubmissions").doc(req.params.id).update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: req.member!.uid
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "BUSINESS_ADMIN_DIRECT_UPDATE",
    targetId: req.params.id,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ ok: true });
});
