import { api, submitPublicBusiness } from "./auth.js";
import { APP_CONFIG } from "../config.js";

const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const money = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

export async function playerDashboard(member) {
  const sessions = await api("/timetable/mine");
  const next = sessions.sort((a,b) => a.startAtUtc - b.startAtUtc).find(s => s.startAtUtc >= Date.now());
  return `
    <section class="page">
      <h2>Welcome, ${escapeHtml(member.fullName)}</h2>
      <p>${escapeHtml(member.flightId || "No flight assigned")}</p>
      <article class="card"><h3>Next game</h3>${next ? `<b>${new Date(next.startAtUtc).toLocaleString()}</b><p>2 courts · ${escapeHtml(member.flightId)}</p>` : "No upcoming game"}</article>
      <article class="card"><h3>Rules</h3><p>Attendance locks automatically 15 minutes after session start. Only actual attendees pay shuttlecock cost.</p></article>
    </section>`;
}

export async function playerTimetable() {
  const sessions = await api("/timetable/mine");
  return `<section class="page"><h2>My Timetable</h2><div class="carousel">${sessions.map(s => `<article class="card"><b>${new Date(s.startAtUtc).toLocaleDateString()}</b><p>${new Date(s.startAtUtc).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} – ${new Date(s.endAtUtc).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p><p>2 courts · ${escapeHtml(s.flightId)}</p></article>`).join("") || "No sessions"}</div></section>`;
}

export async function attendanceView(sessionId) {
  const data = await api(`/attendance/${sessionId}/roster`);
  return `<section class="page"><h2>Attendance</h2><p>${data.locked ? "Locked: Flight Admin only can correct." : "Open: update only your own response."}</p>${data.roster.map(p => `<article class="roster-row"><b>${escapeHtml(p.fullName)}</b><span>${escapeHtml(p.status)}</span>${p.isCurrentUser && !data.locked ? `<button data-attendance="COMING">Coming</button><button data-attendance="NOT_COMING">Not coming</button>` : ""}</article>`).join("")}</section>`;
}

export async function publicIndiMart(search = "") {
  const [notices, sponsors, directory] = await Promise.all([
    fetch(`${APP_CONFIG.API_BASE_URL}/business/public/notices`).then(r => r.json()),
    fetch(`${APP_CONFIG.API_BASE_URL}/business/public/sponsors`).then(r => r.json()),
    fetch(`${APP_CONFIG.API_BASE_URL}/business/public/directory?search=${encodeURIComponent(search)}`).then(r => r.json())
  ]);
  return `<section class="page"><h2>Indi Mart</h2><p>Indian community notices, approved sponsors and local directory.</p>
    <div class="ad-carousel">${sponsors.map(s => `<article class="ad-card">${s.flyerUrl ? `<img src="${escapeHtml(s.flyerUrl)}" alt="${escapeHtml(s.businessName)}">` : ""}<h3>${escapeHtml(s.businessName)}</h3><p>${escapeHtml(s.discountText || "Approved sponsor")}</p></article>`).join("")}</div>
    <h3>Official notices</h3>${notices.map(n => `<article class="notice"><b>${escapeHtml(n.title)}</b><p>${escapeHtml(n.body)}</p></article>`).join("")}
    <h3>Directory</h3>${directory.map(b => `<article class="card"><h3>${escapeHtml(b.businessName)}</h3><p>${escapeHtml(b.category)}</p><p>${escapeHtml(b.description)}</p>${b.googleMapsUrl ? `<a href="${escapeHtml(b.googleMapsUrl)}" target="_blank" rel="noopener">Open map</a>` : ""}</article>`).join("")}</section>`;
}

export async function businessSubmissionForm() {
  return `<section class="business-form"><h2>Business Submission</h2><p>This form goes only to Super Admin approval. It does not create Player/Admin access.</p><input id="bizName" placeholder="Business name"><input id="bizOwner" placeholder="Owner name"><input id="bizPhone" placeholder="Phone"><input id="bizCategory" placeholder="Category"><textarea id="bizDescription" placeholder="Description / offer"></textarea><button id="submitBusiness">Submit</button></section>`;
}

export function bindBusinessSubmission() {
  document.getElementById("submitBusiness")?.addEventListener("click", async () => {
    const result = await submitPublicBusiness({
      businessName: document.getElementById("bizName").value,
      ownerName: document.getElementById("bizOwner").value,
      phone: document.getElementById("bizPhone").value,
      category: document.getElementById("bizCategory").value,
      description: document.getElementById("bizDescription").value,
      packageId: "community-standard"
    });
    alert(`Submitted. Save your reference code: ${result.referenceCode}`);
  });
}
