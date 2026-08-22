import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

const text = (value: unknown, label: string, max = 300) => {
  const result = String(value || "").trim();
  if (!result || result.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return result;
};

const optional = (value: unknown, max = 400) => {
  const result = String(value || "").trim();
  if (result.length > max) throw new Error(`Value must be under ${max} characters.`);
  return result || null;
};

function toIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().toISOString();
  return value ? new Date(value as string).toISOString() : null;
}

function businessReference() {
  return `BIZ-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/* PUBLIC: no Player/Admin login needed to discover approved Indi Mart entries. */
router.get("/public/directory", async (_request, response) => {
  try {
    const listings = await db.collection("businesses").where("status", "==", "PUBLISHED").orderBy("businessName").get();
    response.json(listings.docs.map(doc => {
      const row = doc.data();
      return {
        id: doc.id,
        businessName: row.businessName,
        category: row.category,
        description: row.description,
        phone: row.phone,
        website: row.website || null,
        address: row.address || null,
        flyerUrl: row.flyerUrl || null
      };
    }));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load directory." });
  }
});

/* PUBLIC: official Club announcements only. */
router.get("/public/notices", async (_request, response) => {
  const notices = await db.collection("officialNotices").where("published", "==", true).orderBy("publishedAt", "desc").limit(8).get();
  response.json(notices.docs.map(doc => {
    const row = doc.data();
    return { id: doc.id, title: row.title, body: row.body, publishedAt: toIso(row.publishedAt) };
  }));
});

/* PUBLIC: approved advertisements shown in sponsor carousel. */
router.get("/public/sponsors", async (_request, response) => {
  const sponsors = await db.collection("businesses").where("status", "==", "PUBLISHED").where("featured", "==", true).limit(12).get();
  response.json(sponsors.docs.map(doc => {
    const row = doc.data();
    return { id: doc.id, businessName: row.businessName, discountText: row.discountText || "", flyerUrl: row.flyerUrl || null };
  }));
});

/* PUBLIC: business request creates no Firebase user and no club dashboard access. */
router.post("/public/submit", async (request, response) => {
  try {
    const businessName = text(request.body.businessName, "Business name", 100);
    const ownerName = text(request.body.ownerName, "Owner name", 100);
    const phone = text(request.body.phone, "Phone / WhatsApp", 40);
    const category = text(request.body.category, "Category", 80);
    const description = text(request.body.description, "Offer or description", 800);
    const referenceCode = businessReference();

    const created = await db.collection("businesses").add({
      businessName,
      ownerName,
      phone,
      category,
      description,
      packageId: optional(request.body.packageId, 80),
      website: optional(request.body.website, 200),
      address: optional(request.body.address, 200),
      status: "PENDING_APPROVAL",
      referenceCode,
      featured: false,
      flyerUrl: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection("businessAudit").add({
      businessId: created.id,
      action: "PUBLIC_SUBMISSION",
      referenceCode,
      createdAt: FieldValue.serverTimestamp()
    });

    response.status(201).json({
      success: true,
      referenceCode,
      message: "Submitted to Super Admin for approval. Save your BIZ reference code for update requests."
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not submit business." });
  }
});

/* PUBLIC: advertiser proves ownership using original phone + BIZ code; Super Admin approves any change. */
router.post("/public/update-request", async (request, response) => {
  try {
    const referenceCode = text(request.body.referenceCode, "BIZ reference code", 40).toUpperCase();
    const phone = text(request.body.phone, "Phone", 40);
    const match = await db.collection("businesses").where("referenceCode", "==", referenceCode).where("phone", "==", phone).limit(1).get();
    if (match.empty) return response.status(404).json({ message: "No business request matches that phone number and BIZ reference code." });

    const business = match.docs[0];
    await db.collection("businessUpdateRequests").add({
      businessId: business.id,
      referenceCode,
      phone,
      requestedBusinessName: optional(request.body.businessName, 100),
      requestedCategory: optional(request.body.category, 80),
      requestedDescription: optional(request.body.description, 800),
      requestedWebsite: optional(request.body.website, 200),
      requestedAddress: optional(request.body.address, 200),
      status: "PENDING_APPROVAL",
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true, message: "Update request sent to Super Admin for approval." });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not request business update." });
  }
});

/* SUPER ADMIN: review, publish, reject, feature or edit commercial entries. */
router.get("/admin/pending", requireAuth, requireRole("SUPER_ADMIN"), async (_request, response) => {
  const [businesses, updates] = await Promise.all([
    db.collection("businesses").where("status", "==", "PENDING_APPROVAL").orderBy("createdAt", "asc").get(),
    db.collection("businessUpdateRequests").where("status", "==", "PENDING_APPROVAL").orderBy("createdAt", "asc").get()
  ]);
  response.json({
    businesses: businesses.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toIso(doc.data().createdAt) })),
    updateRequests: updates.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toIso(doc.data().createdAt) }))
  });
});

router.post("/admin/:businessId/decision", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const businessId = text(request.params.businessId, "Business ID", 120);
    const decision = text(request.body.decision, "Decision", 30).toUpperCase();
    const note = optional(request.body.note, 500);
    if (!["PUBLISH", "REJECT", "UNPUBLISH"].includes(decision)) throw new Error("Decision must be PUBLISH, REJECT or UNPUBLISH.");

    const status = decision === "PUBLISH" ? "PUBLISHED" : decision === "REJECT" ? "REJECTED" : "UNPUBLISHED";
    await db.collection("businesses").doc(businessId).update({
      status,
      approvalNote: note,
      approvedBy: request.member!.uid,
      approvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    await db.collection("businessAudit").add({ businessId, action: `SUPER_ADMIN_${decision}`, note, actionBy: request.member!.uid, createdAt: FieldValue.serverTimestamp() });
    response.json({ success: true, status });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update business decision." });
  }
});

router.patch("/admin/:businessId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const businessId = text(request.params.businessId, "Business ID", 120);
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };
    if (request.body.businessName !== undefined) update.businessName = text(request.body.businessName, "Business name", 100);
    if (request.body.category !== undefined) update.category = text(request.body.category, "Category", 80);
    if (request.body.description !== undefined) update.description = text(request.body.description, "Description", 800);
    if (request.body.website !== undefined) update.website = optional(request.body.website, 200);
    if (request.body.address !== undefined) update.address = optional(request.body.address, 200);
    if (request.body.flyerUrl !== undefined) update.flyerUrl = optional(request.body.flyerUrl, 1000);
    if (request.body.discountText !== undefined) update.discountText = optional(request.body.discountText, 200);
    if (request.body.featured !== undefined) update.featured = Boolean(request.body.featured);
    await db.collection("businesses").doc(businessId).update(update);
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update business." });
  }
});

router.post("/admin/notices", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const title = text(request.body.title, "Notice title", 160);
    const body = text(request.body.body, "Notice body", 1200);
    const created = await db.collection("officialNotices").add({
      title,
      body,
      published: Boolean(request.body.published),
      publishedAt: Boolean(request.body.published) ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });
    response.status(201).json({ id: created.id });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not create notice." });
  }
});

export default router;
