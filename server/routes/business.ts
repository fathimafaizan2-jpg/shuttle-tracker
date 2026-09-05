import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, FieldValue, Timestamp, storageBucket } from "../firebaseAdmin.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();
const MAX_ACTIVE_FEATURED_ADS = 10;
const DEFAULT_CAROUSEL_LIMIT = 10;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const BAHRAIN_OFFSET_MS = 3 * 60 * 60 * 1000;

function imageExtension(contentType: string) {
  return contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
}

function hasImageSignature(buffer: Buffer, contentType: string) {
  if (contentType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (contentType === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}

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
  const dateValue = value as { toDate?: () => Date } | null;
  if (dateValue && typeof dateValue.toDate === "function") return dateValue.toDate().toISOString();
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateValue(value: unknown): Date | null {
  if (!value) return null;
  const firestoreDate = value as { toDate?: () => Date };
  if (typeof firestoreDate.toDate === "function") return firestoreDate.toDate();
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function businessReference() {
  return `BIZ-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function normalisePublicUrl(value: unknown, label: string, max = 1800) {
  const raw = optional(value, max);
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a complete http:// or https:// link.`);
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${label} must use http:// or https://.`);

  const driveMatch = url.hostname.endsWith("drive.google.com")
    ? url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get("id")
    : null;
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveMatch)}&sz=w1600`;
  }
  return url.toString();
}

function featureDate(value: unknown, label: string, endOfDay = false) {
  const raw = text(value, label, 20);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`${label} must use the date format YYYY-MM-DD.`);
  const [, year, month, day] = match.map(Number);
  const utc = Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0) - BAHRAIN_OFFSET_MS;
  const result = new Date(utc);
  if (Number.isNaN(result.getTime())) throw new Error(`${label} is invalid.`);
  return result;
}

function businessRow(doc: any) {
  const row = doc.data() || {};
  return {
    id: doc.id,
    businessName: row.businessName,
    ownerName: row.ownerName,
    phone: row.phone,
    category: row.category,
    description: row.description,
    packageId: row.packageId || null,
    website: row.website || null,
    destinationUrl: row.destinationUrl || row.website || null,
    address: row.address || null,
    flyerUrl: row.flyerUrl || null,
    referenceCode: row.referenceCode || null,
    status: row.status || "PENDING_APPROVAL",
    featured: Boolean(row.featured),
    featureStartAt: toIso(row.featureStartAt),
    featureEndAt: toIso(row.featureEndAt),
    discountText: row.discountText || "",
    approvalNote: row.approvalNote || null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    approvedAt: toIso(row.approvedAt)
  };
}

function noticeRow(doc: any) {
  const row = doc.data() || {};
  return {
    id: doc.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl || null,
    published: Boolean(row.published),
    publishedAt: toIso(row.publishedAt),
    createdAt: toIso(row.createdAt)
  };
}

function featureIsLive(row: Record<string, unknown>, now = new Date()) {
  if (!row.featured) return false;
  const start = dateValue(row.featureStartAt);
  const end = dateValue(row.featureEndAt);
  return Boolean(start && end && start.getTime() <= now.getTime() && end.getTime() >= now.getTime());
}

async function enforceFeaturedCapacity(businessId: string, start: Date, end: Date) {
  const published = await db.collection("businesses").where("status", "==", "PUBLISHED").get();
  const overlapping = published.docs.filter(doc => {
    if (doc.id === businessId) return false;
    const row = doc.data();
    if (!row.featured) return false;
    const otherStart = dateValue(row.featureStartAt);
    const otherEnd = dateValue(row.featureEndAt);
    if (!otherStart || !otherEnd) return false;
    return otherStart.getTime() <= end.getTime() && otherEnd.getTime() >= start.getTime();
  });
  if (overlapping.length >= MAX_ACTIVE_FEATURED_ADS) {
    throw new Error(`Only ${MAX_ACTIVE_FEATURED_ADS} featured advertisements may run at the same time. Choose different dates or end another featured ad first.`);
  }
}

function validateFeatureWindow(body: Record<string, unknown>) {
  const featured = Boolean(body.featured);
  if (!featured) return { featured: false, featureStartAt: null, featureEndAt: null };
  const featureStartAt = featureDate(body.featureStartDate, "Featured start date");
  const featureEndAt = featureDate(body.featureEndDate, "Featured end date", true);
  if (featureEndAt.getTime() < featureStartAt.getTime()) throw new Error("Featured end date must be on or after the start date.");
  return { featured: true, featureStartAt, featureEndAt };
}

/* SUPER ADMIN: upload one approved image to Firebase/Google Cloud Storage.
   Users submit text and URLs only; they never receive a bucket write path. */
router.post("/admin/upload-image", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const contentType = String(request.headers["content-type"] || "").split(";")[0].toLowerCase();
    const body = Buffer.isBuffer(request.body) ? request.body : Buffer.from([]);
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) throw new Error("Only PNG, JPEG, or WebP images are allowed.");
    if (!body.length || body.length > MAX_IMAGE_BYTES) throw new Error("Image must be between 1 byte and 2 MB.");
    if (!hasImageSignature(body, contentType)) throw new Error("The uploaded file is not a valid image.");

    const originalName = String(request.headers["x-file-name"] || "image").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || "image";
    const objectName = `club-media/${new Date().getUTCFullYear()}/${request.member!.uid}/${Date.now()}-${randomBytes(6).toString("hex")}-${originalName.replace(/\\.[^.]+$/, "")}.${imageExtension(contentType)}`;
    const file = storageBucket.file(objectName);
    await file.save(body, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: "public,max-age=3600"
      },
      validation: "md5"
    });
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365
    });
    response.status(201).json({ success: true, objectName, imageUrl: signedUrl, size: body.length, contentType });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not upload image." });
  }
});

/* PUBLIC: approved Indi Mart entries for all visitors. */
router.get("/public/directory", async (_request, response) => {
  try {
    const listings = await db.collection("businesses").where("status", "==", "PUBLISHED").get();
    response.json(listings.docs.map(businessRow).sort((a, b) => String(a.businessName).localeCompare(String(b.businessName))));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load directory." });
  }
});

/* PUBLIC: current official Club announcements, including optional approved image links. */
router.get("/public/notices", async (_request, response) => {
  try {
    const notices = await db.collection("officialNotices").where("published", "==", true).get();
    response.json(notices.docs.map(noticeRow).sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || ""))).slice(0, 8));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load official notices." });
  }
});

/* PUBLIC: maximum 10 currently active, approved front-page sponsor advertisements. */
router.get("/public/sponsors", async (_request, response) => {
  try {
    const [sponsors, settings] = await Promise.all([
      db.collection("businesses").where("status", "==", "PUBLISHED").get(),
      db.collection("siteSettings").doc("advertising").get()
    ]);
    const configuredLimit = Number(settings.data()?.carouselLimit);
    const carouselLimit = Number.isInteger(configuredLimit) ? Math.min(MAX_ACTIVE_FEATURED_ADS, Math.max(1, configuredLimit)) : DEFAULT_CAROUSEL_LIMIT;
    const now = new Date();
    response.json(sponsors.docs
      .filter(doc => featureIsLive(doc.data(), now))
      .map(businessRow)
      .sort((a, b) => String(a.featureEndAt || "").localeCompare(String(b.featureEndAt || "")))
      .slice(0, carouselLimit));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load featured sponsors." });
  }
});

/* PUBLIC: business submission creates no Firebase user and no club dashboard access. */
router.post("/public/submit", async (request, response) => {
  try {
    const businessName = text(request.body.businessName, "Business name", 100);
    const ownerName = text(request.body.ownerName, "Owner name", 100);
    const phone = text(request.body.phone, "Phone / WhatsApp", 40);
    const category = text(request.body.category, "Category", 80);
    const description = text(request.body.description, "Offer or description", 800);
    const flyerUrl = normalisePublicUrl(request.body.flyerUrl, "Flyer image link");
    const destinationUrl = normalisePublicUrl(request.body.destinationUrl, "Business destination link");
    if (flyerUrl && !destinationUrl) throw new Error("Add the website, WhatsApp, catalogue, social-media, or map link that should open when the flyer is selected.");
    const referenceCode = businessReference();

    const created = await db.collection("businesses").add({
      businessName,
      ownerName,
      phone,
      category,
      description,
      packageId: optional(request.body.packageId, 80),
      website: normalisePublicUrl(request.body.website, "Website link"),
      destinationUrl,
      address: optional(request.body.address, 200),
      flyerUrl,
      status: "PENDING_APPROVAL",
      referenceCode,
      featured: false,
      featureStartAt: null,
      featureEndAt: null,
      discountText: optional(request.body.discountText, 200),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection("businessAudit").add({ businessId: created.id, action: "PUBLIC_SUBMISSION", referenceCode, createdAt: FieldValue.serverTimestamp() });
    response.status(201).json({ success: true, referenceCode, message: "Submitted to Super Admin for approval. Save your BIZ reference code for later update requests." });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not submit business." });
  }
});

/* PUBLIC: advertiser proves ownership using BIZ code and original phone; Super Admin approves requested changes. */
router.post("/public/update-request", async (request, response) => {
  try {
    const referenceCode = text(request.body.referenceCode, "BIZ reference code", 40).toUpperCase();
    const phone = text(request.body.phone, "Phone", 40);
    const match = await db.collection("businesses").where("referenceCode", "==", referenceCode).where("phone", "==", phone).limit(1).get();
    if (match.empty) return response.status(404).json({ message: "No business request matches that phone number and BIZ reference code." });

    await db.collection("businessUpdateRequests").add({
      businessId: match.docs[0].id,
      referenceCode,
      phone,
      requestedBusinessName: optional(request.body.businessName, 100),
      requestedCategory: optional(request.body.category, 80),
      requestedDescription: optional(request.body.description, 800),
      requestedWebsite: normalisePublicUrl(request.body.website, "Website link"),
      requestedDestinationUrl: normalisePublicUrl(request.body.destinationUrl, "Business destination link"),
      requestedAddress: optional(request.body.address, 200),
      requestedFlyerUrl: normalisePublicUrl(request.body.flyerUrl, "Flyer image link"),
      status: "PENDING_APPROVAL",
      createdAt: FieldValue.serverTimestamp()
    });
    response.json({ success: true, message: "Update request sent to Super Admin for approval." });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not request business update." });
  }
});

/* SUPER ADMIN: current and pending advertisements for approval, editing, or expiry management. */
router.get("/admin/pending", requireAuth, requireRole("SUPER_ADMIN"), async (_request, response) => {
  try {
    const [businesses, updates, notices, settings] = await Promise.all([
      db.collection("businesses").get(),
      db.collection("businessUpdateRequests").where("status", "==", "PENDING_APPROVAL").get(),
      db.collection("officialNotices").get(),
      db.collection("siteSettings").doc("advertising").get()
    ]);
    response.json({
      businesses: businesses.docs.map(businessRow).sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""))),
      updateRequests: updates.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toIso(doc.data().createdAt) })),
      notices: notices.docs.map(noticeRow).sort((a, b) => String(b.publishedAt || b.createdAt || "").localeCompare(String(a.publishedAt || a.createdAt || ""))),
      carouselLimit: Number.isInteger(Number(settings.data()?.carouselLimit)) ? Math.min(MAX_ACTIVE_FEATURED_ADS, Math.max(1, Number(settings.data()?.carouselLimit))) : DEFAULT_CAROUSEL_LIMIT,
      maxCarouselLimit: MAX_ACTIVE_FEATURED_ADS
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load advertising approval." });
  }
});

router.patch("/admin/carousel-settings", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const carouselLimit = Number(request.body.carouselLimit);
    if (!Number.isInteger(carouselLimit) || carouselLimit < 1 || carouselLimit > MAX_ACTIVE_FEATURED_ADS) {
      throw new Error(`Carousel count must be a whole number between 1 and ${MAX_ACTIVE_FEATURED_ADS}.`);
    }
    await db.collection("siteSettings").doc("advertising").set({ carouselLimit, updatedBy: request.member!.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    response.json({ success: true, carouselLimit, maxCarouselLimit: MAX_ACTIVE_FEATURED_ADS });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update carousel settings." });
  }
});

router.post("/admin/:businessId/decision", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const businessId = text(request.params.businessId, "Business ID", 120);
    const decision = text(request.body.decision, "Decision", 30).toUpperCase();
    const note = optional(request.body.note, 500);
    if (!["PUBLISH", "REJECT", "UNPUBLISH"].includes(decision)) throw new Error("Decision must be PUBLISH, REJECT or UNPUBLISH.");
    const business = await db.collection("businesses").doc(businessId).get();
    if (!business.exists) throw new Error("Business record no longer exists.");

    const status = decision === "PUBLISH" ? "PUBLISHED" : decision === "REJECT" ? "REJECTED" : "UNPUBLISHED";
    await business.ref.update({ status, approvalNote: note, approvedBy: request.member!.uid, approvedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    await db.collection("businessAudit").add({ businessId, action: `SUPER_ADMIN_${decision}`, note, actionBy: request.member!.uid, createdAt: FieldValue.serverTimestamp() });
    response.json({ success: true, status });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update business decision." });
  }
});

router.patch("/admin/:businessId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const businessId = text(request.params.businessId, "Business ID", 120);
    const reference = db.collection("businesses").doc(businessId);
    const existing = await reference.get();
    if (!existing.exists) throw new Error("Business record no longer exists.");
    const current = existing.data() || {};
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };

    if (request.body.businessName !== undefined) update.businessName = text(request.body.businessName, "Business name", 100);
    if (request.body.category !== undefined) update.category = text(request.body.category, "Category", 80);
    if (request.body.description !== undefined) update.description = text(request.body.description, "Description", 800);
    if (request.body.website !== undefined) update.website = normalisePublicUrl(request.body.website, "Website link");
    if (request.body.destinationUrl !== undefined) update.destinationUrl = normalisePublicUrl(request.body.destinationUrl, "Business destination link");
    if (request.body.address !== undefined) update.address = optional(request.body.address, 200);
    if (request.body.flyerUrl !== undefined) update.flyerUrl = normalisePublicUrl(request.body.flyerUrl, "Flyer image link");
    if (request.body.discountText !== undefined) update.discountText = optional(request.body.discountText, 200);

    if (request.body.featured !== undefined) {
      const nextFeature = validateFeatureWindow(request.body);
      if (nextFeature.featured) {
        if (String(current.status) !== "PUBLISHED") throw new Error("Publish this business before placing it on the featured front-page carousel.");
        await enforceFeaturedCapacity(businessId, nextFeature.featureStartAt!, nextFeature.featureEndAt!);
      }
      Object.assign(update, nextFeature);
    }

    await reference.update(update);
    await db.collection("businessAudit").add({ businessId, action: "SUPER_ADMIN_EDIT", actionBy: request.member!.uid, createdAt: FieldValue.serverTimestamp() });
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update business." });
  }
});

router.post("/admin/update-requests/:requestId/decision", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const requestId = text(request.params.requestId, "Update request ID", 120);
    const decision = text(request.body.decision, "Decision", 30).toUpperCase();
    if (!["APPROVE", "REJECT"].includes(decision)) throw new Error("Decision must be APPROVE or REJECT.");
    const updateRequest = await db.collection("businessUpdateRequests").doc(requestId).get();
    if (!updateRequest.exists) throw new Error("Business update request no longer exists.");
    const row = updateRequest.data() || {};
    if (row.status !== "PENDING_APPROVAL") throw new Error("This business update request was already reviewed.");

    if (decision === "APPROVE") {
      const business = db.collection("businesses").doc(text(row.businessId, "Business ID", 120));
      const pendingChanges: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };
      const pairs = [
        ["businessName", "requestedBusinessName"], ["category", "requestedCategory"], ["description", "requestedDescription"],
        ["website", "requestedWebsite"], ["destinationUrl", "requestedDestinationUrl"], ["address", "requestedAddress"], ["flyerUrl", "requestedFlyerUrl"]
      ];
      for (const [target, source] of pairs) if (row[source] !== null && row[source] !== undefined && row[source] !== "") pendingChanges[target] = row[source];
      await business.update(pendingChanges);
    }

    await updateRequest.ref.update({ status: decision === "APPROVE" ? "APPROVED" : "REJECTED", reviewedBy: request.member!.uid, reviewedAt: FieldValue.serverTimestamp() });
    await db.collection("businessAudit").add({ businessId: row.businessId, action: `SUPER_ADMIN_UPDATE_${decision}`, actionBy: request.member!.uid, createdAt: FieldValue.serverTimestamp() });
    response.json({ success: true, status: decision === "APPROVE" ? "APPROVED" : "REJECTED" });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not review business update request." });
  }
});

router.post("/admin/notices", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const title = text(request.body.title, "Notice title", 160);
    const body = text(request.body.body, "Notice body", 1200);
    const published = Boolean(request.body.published);
    const created = await db.collection("officialNotices").add({
      title,
      body,
      imageUrl: normalisePublicUrl(request.body.imageUrl, "Notice image link"),
      published,
      publishedAt: published ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });
    response.status(201).json({ id: created.id });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not create notice." });
  }
});

router.patch("/admin/notices/:noticeId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const noticeId = text(request.params.noticeId, "Notice ID", 120);
    const reference = db.collection("officialNotices").doc(noticeId);
    const notice = await reference.get();
    if (!notice.exists) throw new Error("Official notice no longer exists.");
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };
    if (request.body.title !== undefined) update.title = text(request.body.title, "Notice title", 160);
    if (request.body.body !== undefined) update.body = text(request.body.body, "Notice body", 1200);
    if (request.body.imageUrl !== undefined) update.imageUrl = normalisePublicUrl(request.body.imageUrl, "Notice image link");
    if (request.body.published !== undefined) {
      update.published = Boolean(request.body.published);
      if (Boolean(request.body.published) && !notice.data()?.published) update.publishedAt = FieldValue.serverTimestamp();
    }
    await reference.update(update);
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update official notice." });
  }
});

export default router;
