import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;
const recordDate = value => {
  if (!value) return "—";
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-BH", { dateStyle: "medium" });
};
const inputDate = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = type => parts.find(item => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const imageUrl = value => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const id = url.hostname.endsWith("drive.google.com") ? (url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get("id")) : null;
    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : url.toString();
  } catch { return ""; }
};

async function uploadAdminImage(file) {
  if (!file) throw new Error("Choose a PNG, JPEG, or WebP image first.");
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Only PNG, JPEG, or WebP images are allowed.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Image must be 2 MB or smaller.");
  const result = await api("/business/admin/upload-image", {
    method: "POST",
    body: file,
    confirm: false,
    loadingLabel: "Uploading image…",
    headers: { "Content-Type": file.type, "X-File-Name": file.name }
  });
  return result.imageUrl;
}
let selectedMasterMonth = new Date().toISOString().slice(0, 7);
let selectedMasterActivityId = "";
let selectedFinanceActivityId = "";
let selectedFinanceFlightId = "";
let selectedFinanceTab = "credits";
let selectedFinanceCreditMemberId = "";
let selectedRosterActivityId = "";
let selectedRosterFlightId = "";
let latestInvitation = null;
let selectedAuditCategory = "ALL";
let selectedAuditActivityId = "";
let selectedAuditFlightId = "";
let selectedAuditDate = "";
let selectedAuditMember = "";

function requireSuperAdmin() {
  if (state.member?.role !== "SUPER_ADMIN") throw new Error("Only Super Admin can access this module.");
}
function refresh() { window.dispatchEvent(new CustomEvent("indianclub:render")); }
function notify(message) { window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message })); }
function flattenFlights(activities) { return activities.flatMap(activity => (activity.flights || []).map(flight => ({ ...flight, activityId: activity.id, activityName: activity.name }))); }
function flightOptions(activities, selectedFlightId = "") { return activities.map(activity => `<optgroup label="${escapeHtml(activity.name)}">${(activity.flights || []).map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedFlightId ? "selected" : ""}>${escapeHtml(flight.name)}</option>`).join("")}</optgroup>`).join(""); }
function financeRows(rows, emptyText, options = {}) {
  if (!rows?.length) return `<p class="note">${escapeHtml(emptyText)}</p>`;
  const due = Boolean(options.showAmountDue), reminders = Boolean(options.showReminder), dates = Boolean(options.showDate);
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th>${dates ? "<th>Date</th>" : ""}<th>Flight</th><th>Amount</th><th>Status</th>${reminders ? "<th>Action</th>" : ""}</tr></thead><tbody>${rows.map(row => { const amountFils = due ? row.amountDueFils : (row.balanceFils ?? row.totalChargeFils ?? row.amountFils ?? 0); const status = row.status || (Number(row.balanceFils || 0) < 1000 ? "DUE" : "CREDIT AVAILABLE"); return `<tr><td><b>${escapeHtml(row.memberName || row.memberId || row.memberUid)}</b>  
<small>${escapeHtml(row.memberId || "")}</small></td>${dates ? `<td>${escapeHtml(recordDate(row.updatedAt || row.paidAt || row.createdAt || row.dueAt))}</td>` : ""}<td>${escapeHtml(row.flightName || "—")}</td><td>${bhd(amountFils)}</td><td><span class="tag ${String(status).startsWith("PAID") || status === "CREDIT AVAILABLE" ? "blue" : String(status) === "DUE" ? "red" : "amber"}">${escapeHtml(status)}</span></td>${reminders ? `<td><button class="pill" data-whatsapp-reminder="${escapeHtml(row.phone || "")}" data-whatsapp-name="${escapeHtml(row.memberName || "Member")}" data-whatsapp-amount="${escapeHtml(bhd(row.amountDueFils))}">WhatsApp reminder</button></td>` : ""}</tr>`; }).join("")}</tbody></table></div>`;
}

function auditDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const valueFor = type => parts.find(part => part.type === type)?.value || "";
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

function auditPrint(sectionId, title) {
  const section = document.getElementById(sectionId);
  if (!section) return notify("The current log is not ready to print.");
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return notify("Allow pop-ups to print this page.");
  printWindow.opener = null;
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#172554}.card{border:1px solid #cbd5e1;border-radius:12px;padding:20px}.table-wrap{overflow:visible}.schedule{width:100%;border-collapse:collapse;margin-top:16px}.schedule th,.schedule td{border:1px solid #cbd5e1;padding:9px;text-align:left;vertical-align:top}.tag{font-size:10px;font-weight:700}button,input,select{display:none}</style></head><body>${section.outerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function auditScopeOptions(records) {
  const activities = [...new Map(records.filter(row => row.activityId).map(row => [row.activityId, row.activityName || row.activityId])).entries()];
  const flights = records.filter(row => row.flightId && (!selectedAuditActivityId || row.activityId === selectedAuditActivityId));
  const flightOptions = [...new Map(flights.map(row => [row.flightId, row.flightName || row.flightId])).entries()];
  const memberOptions = [...new Set(records.flatMap(row => [row.subject, row.actor]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  return { activities, flightOptions, memberOptions };
}

async function superAdminAuditLogView(options = {}) {
  requireSuperAdmin();
  const records = await api("/members/audit");
  const title = options.title || "Audit History";
  const description = options.description || "Read-only club history of member, attendance, payment, game, and stock actions.";
  const permittedCategories = options.categories || ["MEMBER", "ATTENDANCE", "WALLET / PAYMENT", "SESSION CONTROL", "SHUTTLE STOCK"];
  if (!permittedCategories.includes(selectedAuditCategory) && selectedAuditCategory !== "ALL") selectedAuditCategory = "ALL";
  const { activities, flightOptions, memberOptions } = auditScopeOptions(records);
  if (selectedAuditActivityId && !activities.some(([id]) => id === selectedAuditActivityId)) selectedAuditActivityId = "";
  if (selectedAuditFlightId && !flightOptions.some(([id]) => id === selectedAuditFlightId)) selectedAuditFlightId = "";
  const displayedRecords = records.filter(row => {
    if (!permittedCategories.includes(row.category)) return false;
    if (selectedAuditCategory !== "ALL" && row.category !== selectedAuditCategory) return false;
    if (selectedAuditActivityId && row.activityId !== selectedAuditActivityId) return false;
    if (selectedAuditFlightId && row.flightId !== selectedAuditFlightId) return false;
    if (selectedAuditDate && auditDateKey(row.createdAt) !== selectedAuditDate && auditDateKey(row.sessionDate) !== selectedAuditDate) return false;
    if (selectedAuditMember && row.subject !== selectedAuditMember && row.actor !== selectedAuditMember) return false;
    return true;
  });
  const categoryButtons = ["ALL", ...permittedCategories].map(category => `<button class="${selectedAuditCategory === category ? "primary" : "pill"}" data-audit-category="${escapeHtml(category)}">${escapeHtml(category === "ALL" ? "All actions" : category)}</button>`).join("");
  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN · READ ONLY</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div><button class="pill" data-print-audit-log>Print current log</button></div>
    <section class="card"><h3>Filter this log</h3><div class="actions">${categoryButtons}</div><div class="grid two"><div class="field"><label for="auditActivityFilter">Activity</label><select id="auditActivityFilter"><option value="">All activities</option>${activities.map(([id, name]) => `<option value="${escapeHtml(id)}" ${id === selectedAuditActivityId ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></div><div class="field"><label for="auditFlightFilter">Flight / Level</label><select id="auditFlightFilter"><option value="">All levels</option>${flightOptions.map(([id, name]) => `<option value="${escapeHtml(id)}" ${id === selectedAuditFlightId ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></div><div class="field"><label for="auditDateFilter">Date</label><input id="auditDateFilter" type="date" value="${escapeHtml(selectedAuditDate)}" /></div><div class="field"><label for="auditMemberFilter">Member name</label><select id="auditMemberFilter"><option value="">All members and admins</option>${memberOptions.map(name => `<option value="${escapeHtml(name)}" ${name === selectedAuditMember ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></div></div></section>
    <section id="superAdminAuditPrint" class="card table-wrap"><div class="page-head"><div><h3>${displayedRecords.length} matching action${displayedRecords.length === 1 ? "" : "s"}</h3><p class="note">Player and Flight Admin activity retains the date, level, member, action, and actor.</p></div></div><table class="schedule"><thead><tr><th>Date</th><th>Category</th><th>Action</th><th>Member / Flight</th><th>Details</th><th>By</th></tr></thead><tbody>${displayedRecords.map(row => `<tr><td>${escapeHtml(recordDate(row.createdAt))}${row.sessionDate ? `<br><small>Game: ${escapeHtml(recordDate(row.sessionDate))}</small>` : ""}</td><td><span class="tag blue">${escapeHtml(row.category || "—")}</span></td><td>${escapeHtml(row.action || "—")}</td><td><b>${escapeHtml(row.subject || "—")}</b><br><small>${escapeHtml(row.activityName || "Club")} · ${escapeHtml(row.flightName || "All levels")}</small></td><td>${escapeHtml(row.detail || "—")}</td><td>${escapeHtml(row.actor || "System")}</td></tr>`).join("") || "<tr><td colspan='6'>No actions match the selected filters.</td></tr>"}</tbody></table></section>`;
}

export async function superAdminHomeView() {
  requireSuperAdmin();
  const records = await api("/members/audit");
  const latest = records.slice(0, 5);
  const count = category => records.filter(row => row.category === category).length;
  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Club Oversight</h2><p>Review Player and Flight Admin history by activity, level, date, member, and action without changing the personal Player dashboard.</p></div></div><div class="grid metrics"><article class="card metric"><span>Member actions</span><b>${count("MEMBER")}</b><i>Registration and profile records</i></article><article class="card metric"><span>Wallet actions</span><b>${count("WALLET / PAYMENT")}</b><i>Credits and payment records</i></article><article class="card metric"><span>Completed sessions</span><b>${count("SESSION CONTROL")}</b><i>Final game records</i></article><article class="card metric"><span>Stock actions</span><b>${count("SHUTTLE STOCK")}</b><i>Shuttle stock audit</i></article></div><section class="card"><h3>Open a filtered club log</h3><div class="actions"><button class="primary" data-go-page="logs">Player & Admin Activity</button><button class="pill" data-go-page="wallet">Wallet & Payments</button><button class="pill" data-go-page="sessions">Session Control Logs</button><button class="pill" data-go-page="stock">Shuttle Stock Logs</button><button class="pill" data-go-page="audit">All Audit History</button></div></section><section class="card"><h3>Most recent club actions</h3>${latest.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.action || "Club action")}</b><p>${escapeHtml(row.subject || "Club")} · ${escapeHtml(recordDate(row.createdAt))}</p></div><span class="tag blue">${escapeHtml(row.category || "AUDIT")}</span></div>`).join("") || "<p class='note'>No club actions have been recorded yet.</p>"}</section>`;
}

export async function superAdminActivityLogView() { return superAdminAuditLogView({ title: "Player & Flight Admin Activity", description: "Registration, profile, and attendance activity by Players and Flight Admins.", categories: ["MEMBER", "ATTENDANCE"] }); }
export async function superAdminWalletLogView() { return superAdminAuditLogView({ title: "Player Wallet & Payment Log", description: "Read-only Player credit, charge, and Cash / Benefit payment activity across all levels.", categories: ["WALLET / PAYMENT"] }); }
export async function superAdminSessionLogView() { return superAdminAuditLogView({ title: "Flight Admin Session Control Log", description: "Final attendance and completed-game records from every level.", categories: ["ATTENDANCE", "SESSION CONTROL"] }); }
export async function superAdminStockLogView() { return superAdminAuditLogView({ title: "Flight Admin Shuttle Stock Log", description: "Read-only stock and completed-game shuttle-usage history across all levels.", categories: ["SHUTTLE STOCK"] }); }

export async function activitiesAndFlightsView() {
  requireSuperAdmin();
  const [activities, allMembers] = await Promise.all([api("/activities"), api("/members")]);
  const flights = flattenFlights(activities);
  const accounts = allMembers.filter(member => ["PLAYER", "LEVEL_ADMIN"].includes(member.role));
  const rosterFlights = selectedRosterActivityId ? flights.filter(flight => flight.activityId === selectedRosterActivityId) : flights;
  if (selectedRosterFlightId && !rosterFlights.some(flight => flight.id === selectedRosterFlightId)) selectedRosterFlightId = "";
  const roster = accounts.filter(member => selectedRosterFlightId ? member.flightId === selectedRosterFlightId : selectedRosterActivityId ? rosterFlights.some(flight => flight.id === member.flightId) : true);

  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Activities, Flights & Members</h2><p>Create activities, manage levels, view every roster, and assign delegated Flight Admins.</p></div></div>
  <section class="card"><h3>Add sport / activity</h3><div class="grid two"><div class="field"><label for="newActivityName">Activity name</label><input id="newActivityName" placeholder="Badminton" /></div><div class="field"><label>&nbsp;</label><button id="createActivity" class="primary">Create activity</button></div></div></section>
  <section class="grid admin-activity-list">${activities.map(activity => `<article class="card activity-card"><div class="page-head"><div><span class="tag ${activity.active ? "blue" : "red"}">${activity.active ? "ACTIVE" : "INACTIVE"}</span><h3>${escapeHtml(activity.name)}</h3><p>${activity.flights?.length || 0} flight(s). Courts are always 1 and 2.</p></div><button class="pill" data-toggle-activity="${escapeHtml(activity.id)}" data-active="${activity.active}">${activity.active ? "Deactivate" : "Activate"}</button></div><div class="flight-list">${(activity.flights || []).map(flight => `<div class="session"><div class="datebox">2<small>courts</small></div><div class="grow"><b>${escapeHtml(flight.name)}</b><p>Display order: ${Number(flight.sortOrder ?? 999)}</p></div><span class="tag ${flight.active ? "blue" : "red"}">${flight.active ? "ACTIVE" : "INACTIVE"}</span><button class="pill" data-toggle-flight="${escapeHtml(flight.id)}" data-activity-id="${escapeHtml(activity.id)}" data-active="${flight.active}">${flight.active ? "Deactivate" : "Activate"}</button></div>`).join("") || "<p class='note'>No flights yet.</p>"}</div><div class="add-flight-box"><div class="field"><label for="flightName-${escapeHtml(activity.id)}">New flight name</label><input id="flightName-${escapeHtml(activity.id)}" placeholder="Premier, Flight 1, Flight 4B" /></div><div class="field"><label for="flightSort-${escapeHtml(activity.id)}">Display order</label><input id="flightSort-${escapeHtml(activity.id)}" type="number" min="0" value="${(activity.flights?.length || 0) + 1}" /></div><button class="primary" data-create-flight="${escapeHtml(activity.id)}">Add flight</button></div></article>`).join("") || "<section class='card'><p class='note'>Create Badminton first.</p></section>"}</section>
  <section class="card"><span class="tag blue">PRE-REGISTER PLAYER OR FLIGHT ADMIN</span><h3>Record member for first access</h3><p class="note">Super Admin records the chosen name, phone number, role, and level. The member later matches the same name and phone number to create their own Member ID, email address, and password.</p><div class="grid two"><div class="field"><label for="memberFullName">Registered name</label><input id="memberFullName" placeholder="Name commonly used by the member" /></div><div class="field"><label for="memberPhone">Phone / WhatsApp number</label><input id="memberPhone" inputmode="tel" placeholder="97312345678" /></div><div class="field"><label for="memberRole">Account role</label><select id="memberRole"><option value="PLAYER">Player</option><option value="LEVEL_ADMIN">Flight Admin / Delegate</option></select></div><div class="field"><label for="memberFlight">Assigned flight</label><select id="memberFlight"><option value="">Choose a flight</option>${flightOptions(activities)}</select></div><div class="field"><label>&nbsp;</label><button id="createMember" class="primary">Pre-register member</button></div></div></section>
  ${latestInvitation ? `<section class="card"><span class="tag blue">MEMBER PRE-REGISTERED</span><h3>${escapeHtml(latestInvitation.fullName)}</h3><p class="note">The member can now open the app and use the same registered name and phone number to create their own email and password.</p><div class="actions"><button class="primary" data-whatsapp-onboarding-name="${escapeHtml(latestInvitation.fullName)}" data-whatsapp-onboarding-phone="${escapeHtml(latestInvitation.phone)}">WhatsApp app link</button><button id="hideLatestInvitation" class="pill">Done</button></div></section>` : ""}
  <section class="card table-wrap"><span class="tag blue">ALL LEVELS ROSTER</span><h3>Players and Flight Admins</h3><p class="note">To promote an existing Player, choose Flight Admin / Delegate, select one flight, then save.</p><div class="grid two"><div class="field"><label for="rosterActivityFilter">Activity</label><select id="rosterActivityFilter"><option value="">All activities</option>${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedRosterActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div><div class="field"><label for="rosterFlightFilter">Flight / Level</label><select id="rosterFlightFilter"><option value="">All flights in this selection</option>${rosterFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedRosterFlightId ? "selected" : ""}>${escapeHtml(flight.activityName)} · ${escapeHtml(flight.name)}</option>`).join("")}</select></div></div><table class="schedule"><thead><tr><th>Member</th><th>Role</th><th>Assigned flight</th><th>Access</th><th>Save</th></tr></thead><tbody>${roster.map(member => `<tr><td><b>${escapeHtml(member.fullName)}</b>  
<small>${escapeHtml(member.memberId || "")} · ${escapeHtml(member.email || "")}</small></td><td><select id="memberRole-${escapeHtml(member.uid)}"><option value="PLAYER" ${member.role === "PLAYER" ? "selected" : ""}>Player</option><option value="LEVEL_ADMIN" ${member.role === "LEVEL_ADMIN" ? "selected" : ""}>Flight Admin / Delegate</option></select></td><td><select id="memberFlight-${escapeHtml(member.uid)}">${flightOptions(activities, member.flightId)}</select></td><td><span class="tag ${member.active ? "blue" : "red"}">${member.active ? "ACTIVE" : "INACTIVE"}</span></td><td><div class="actions"><button class="primary" data-save-member="${escapeHtml(member.uid)}">Save role / flight</button><button class="pill" data-toggle-member="${escapeHtml(member.uid)}" data-active="${member.active}">${member.active ? "Deactivate" : "Activate"}</button></div></td></tr>`).join("") || "<tr><td colspan='5'>No account exists for this selection.</td></tr>"}</tbody></table></section>`;
}

export async function superAdminTimetableView() {
  requireSuperAdmin();
  const baseData = await api(`/timetable/master?${new URLSearchParams({ month: selectedMasterMonth }).toString()}`);
  const activities = baseData.activities || [];
  if (!activities.some(activity => activity.id === selectedMasterActivityId)) selectedMasterActivityId = baseData.activityId || activities[0]?.id || "";
  const query = new URLSearchParams({ month: selectedMasterMonth });
  if (selectedMasterActivityId) query.set("activityId", selectedMasterActivityId);
  const data = selectedMasterActivityId === baseData.activityId ? baseData : await api(`/timetable/master?${query.toString()}`);
  const flights = data.flights || [];
  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Master Timetable</h2><p>Weekly pattern for the selected month. Courts always use 1 and 2.</p></div></div><section class="card"><div class="grid two"><div class="field"><label for="masterMonth">Month</label><input id="masterMonth" type="month" value="${escapeHtml(selectedMasterMonth)}" /></div><div class="field"><label for="masterActivity">Activity</label><select id="masterActivity">${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedMasterActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div></div><div class="actions"><button id="loadMasterMonth" class="pill">Load timetable</button><button id="publishMasterMonth" class="primary">Publish this month</button></div></section><section class="card table-wrap"><table class="schedule"><thead><tr><th>Day</th><th>Flight</th><th>Start</th><th>End</th><th>Courts</th><th>Action</th></tr></thead><tbody>${(data.weeklyPattern || []).map(slot => `<tr><td>${escapeHtml(slot.weekday)}</td><td>${escapeHtml(slot.flightName)}</td><td>${escapeHtml(slot.startTime)}</td><td>${escapeHtml(slot.endTime)}</td><td>1 & 2</td><td><button class="pill" data-delete-slot="${escapeHtml(slot.id)}">Remove</button></td></tr>`).join("") || "<tr><td colspan='6'>No weekly slots yet.</td></tr>"}</tbody></table></section><section class="card"><h3>Bulk weekly grid</h3><p class="note">Paste one row per occupied cell from your weekly chart. Use the flight name exactly as shown in the flight list. The app creates the whole weekly pattern at once and rejects duplicate or overlapping times for the same flight and weekday.</p><div class="field"><label for="bulkTimetableCsv">CSV rows: weekday, flight, start time, end time</label><textarea id="bulkTimetableCsv" rows="8" placeholder="weekday,flight,startTime,endTime\nSaturday,Flight 2,18:35,19:35\nSaturday,Flight 1,19:35,20:35\nSunday,Flight 4B,18:35,19:35"></textarea></div><div class="actions"><button id="importBulkTimetable" class="primary">Import weekly grid</button><button id="downloadBulkTemplate" class="pill">Download CSV template</button></div></section><section class="card"><h3>Add weekly flight slot</h3><div class="grid two"><div class="field"><label for="slotDay">Day</label><select id="slotDay"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div><div class="field"><label for="slotFlight">Flight</label><select id="slotFlight">${flights.map(flight => `<option value="${escapeHtml(flight.id)}">${escapeHtml(flight.name)}</option>`).join("")}</select></div><div class="field"><label for="slotStart">Start time</label><input id="slotStart" type="time" /></div><div class="field"><label for="slotEnd">End time</label><input id="slotEnd" type="time" /></div></div><button id="saveMasterSlot" class="primary">Save weekly slot</button></section>`;
}

export async function financeAdminView() {
  const isSuperAdmin = state.member?.role === "SUPER_ADMIN", isFlightAdmin = state.member?.role === "LEVEL_ADMIN";
  if (!isSuperAdmin && !isFlightAdmin) throw new Error("Only Flight Admin or Super Admin can access finance.");
  const [activities, members] = await Promise.all([api("/activities"), isSuperAdmin ? api("/members") : Promise.resolve([])]);
  const flights = flattenFlights(activities);
  if (selectedFinanceActivityId && !activities.some(activity => activity.id === selectedFinanceActivityId)) selectedFinanceActivityId = "";
  const selectedFlights = selectedFinanceActivityId ? flights.filter(flight => flight.activityId === selectedFinanceActivityId) : flights;
  if (selectedFinanceFlightId && !selectedFlights.some(flight => flight.id === selectedFinanceFlightId)) selectedFinanceFlightId = "";
  const query = new URLSearchParams();
  if (isSuperAdmin && selectedFinanceFlightId) query.set("flightId", selectedFinanceFlightId);
  else if (isSuperAdmin && selectedFinanceActivityId) query.set("activityId", selectedFinanceActivityId);
  let data;
  try {
    data = await api(`/finance/overview${query.size ? `?${query.toString()}` : ""}`);
  } catch (error) {
    const message = String(error?.message || error || "");
    if (!isSuperAdmin || (!message.toLowerCase().includes("selected flight") && !message.toLowerCase().includes("invalid option"))) throw error;
    selectedFinanceActivityId = "";
    selectedFinanceFlightId = "";
    data = await api("/finance/overview");
  }
  const allowedFlights = new Set(selectedFlights.map(flight => flight.id));
  const players = members.filter(member => member.active && member.flightId && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role) && (!selectedFinanceFlightId || member.flightId === selectedFinanceFlightId) && (!selectedFinanceActivityId || allowedFlights.has(member.flightId)));
  const creditRecipients = players;
  if (selectedFinanceCreditMemberId && !creditRecipients.some(member => member.uid === selectedFinanceCreditMemberId)) selectedFinanceCreditMemberId = "";
  const selectedCreditBalanceFils = Number((data.credits || []).find(row => row.memberUid === selectedFinanceCreditMemberId)?.balanceFils || 0);
  const scope = isFlightAdmin ? (data.scope?.flights?.[0]?.name || state.member?.flightName || "Your flight") : selectedFinanceFlightId ? (flights.find(flight => flight.id === selectedFinanceFlightId)?.name || "Selected flight") : selectedFinanceActivityId ? (activities.find(activity => activity.id === selectedFinanceActivityId)?.name || "Selected activity") : "All activities and flights";
  const tabs = {
    credits: { label: "Credited Players", content: `<section class="card"><h3>Add or deduct member credit</h3><p class="note">First select Activity and Flight / Level above. The Member list below then shows only active members assigned to that selection. Changing a filter intentionally returns the Member field to “Choose member”; it never selects a recipient automatically.</p><div class="grid two"><div class="field"><label for="financeCreditMember">Member receiving credit</label><select id="financeCreditMember" required><option value="" disabled ${selectedFinanceCreditMemberId ? "" : "selected"}>Choose member${selectedFinanceFlightId ? " in selected level" : selectedFinanceActivityId ? " in selected activity" : ""}</option>${creditRecipients.map(member => `<option value="${escapeHtml(member.uid)}" data-wallet-balance="${Number((data.credits || []).find(row => row.memberUid === member.uid)?.balanceFils || 0)}" ${member.uid === selectedFinanceCreditMemberId ? "selected" : ""}>${escapeHtml(member.fullName)} · ${escapeHtml(member.memberId || "No ID")} · ${escapeHtml(member.flightName || flights.find(flight => flight.id === member.flightId)?.name || "Assigned flight")} · ${escapeHtml(String(member.role || "PLAYER").replaceAll("_", " "))}</option>`).join("")}</select><p id="financeSelectedMemberPreview" class="note">${selectedFinanceCreditMemberId ? `Selected member: <b>${escapeHtml(creditRecipients.find(member => member.uid === selectedFinanceCreditMemberId)?.fullName || "selected member")}</b><br>Current wallet credit: <b id="financeCurrentCredit">${bhd(selectedCreditBalanceFils)}</b>` : creditRecipients.length ? "Choose the exact member before adding or deducting credit." : "No active member is assigned to this activity / level yet."}</p></div><div class="field"><label for="financeCreditAmount">Credit to add in BHD</label><input id="financeCreditAmount" type="number" min="0.001" step="0.001" placeholder="1.000" /></div></div><div class="field"><label for="financeCreditNote">Add-credit verification note</label><input id="financeCreditNote" value="Verified club credit" /></div><button id="addFinanceCredit" class="primary" ${selectedFinanceCreditMemberId ? "" : "disabled"}>Add verified credit</button><hr><h3>Deduct an incorrect credit</h3><p class="note">Enter the amount to deduct as a normal positive number. For example, enter <b>0.100</b> to reduce the wallet by BHD 0.100. The app will never make the balance negative, and every deduction stays in the audit history.</p><div class="grid two"><div class="field"><label for="financeCreditDeduction">Credit to deduct in BHD</label><input id="financeCreditDeduction" type="number" min="0.001" step="0.001" placeholder="0.100" /></div><div class="field"><label for="financeCreditAdjustmentNote">Deduction reason</label><input id="financeCreditAdjustmentNote" placeholder="Reason for manual deduction" /></div></div><button id="deductFinanceCredit" class="primary" ${selectedFinanceCreditMemberId ? "" : "disabled"}>Deduct selected wallet credit</button></section><section class="card"><h3>Current Wallet Credit by Member</h3><p class="note">This table shows one current wallet balance for each member. Additions and deductions remain in the private audit history; they do not create duplicate current-credit rows.</p>${financeRows(data.credits, "No member wallet balance exists for this selection.", { showDate: true })}</section>` },
    pending: { label: "Pending Cash / Benefit", content: `<section class="card"><h3>Pending Cash / Benefit confirmations</h3><p class="note">Confirm only after receiving the Player's Cash or Benefit payment.</p>${(data.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>${escapeHtml(payment.flightName || "Flight")} · ${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-verify-payment="${escapeHtml(payment.id)}">Verify</button></div>`).join("") || "<p class='note'>No settlement payment awaits confirmation for this flight.</p>"}</section>` },
    paid: { label: "Paid Players", content: `<section class="card"><h3>Paid Players</h3>${financeRows(data.paid, "No paid charges for this selection.", { showDate: true })}</section>` },
    unpaid: { label: "Unpaid Players", content: `<section class="card"><h3>Unpaid Players</h3>${financeRows(data.unpaid, "No unpaid charges for this selection.", { showAmountDue: true, showDate: true, showReminder: isFlightAdmin })}</section>` }
  };
  const keys = isSuperAdmin ? ["credits", "paid", "unpaid"] : ["pending", "paid", "unpaid"];
  if (!keys.includes(selectedFinanceTab)) selectedFinanceTab = keys[0];
  const active = tabs[selectedFinanceTab];
  return `<div class="page-head"><div><span class="tag blue">${isSuperAdmin ? "SUPER ADMIN FINANCE" : "FLIGHT ADMIN FINANCE"}</span><h2>Finance</h2><p>${isSuperAdmin ? "View and print audit lists by selected activity and level." : "Manage only your assigned flight."}</p></div></div><div class="grid metrics"><article class="card metric"><span>Verified credit</span><b>${bhd(data.totalCreditFils)}</b><i>${escapeHtml(scope)}</i></article>${isFlightAdmin ? `<article class="card metric"><span>Pending payment</span><b>${bhd(data.pendingPaymentFils)}</b><i>Your flight</i></article>` : ""}<article class="card metric"><span>Unpaid amount</span><b>${bhd((data.unpaid || []).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0))}</b><i>Selected level</i></article><article class="card metric"><span>Session costs</span><b>${bhd(data.monthCostFils)}</b><i>Current month</i></article></div>${isSuperAdmin ? `<section class="card"><h3>Select activity and level</h3><div class="grid two"><div class="field"><label for="financeActivityFilter">Activity</label><select id="financeActivityFilter"><option value="">All activities</option>${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedFinanceActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div><div class="field"><label for="financeFlightFilter">Flight / Level</label><select id="financeFlightFilter"><option value="">All flights in this selection</option>${selectedFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedFinanceFlightId ? "selected" : ""}>${escapeHtml(flight.activityName)} · ${escapeHtml(flight.name)}</option>`).join("")}</select></div></div></section>` : ""}<section class="card"><div class="actions">${keys.map(key => `<button class="${key === selectedFinanceTab ? "primary" : "pill"}" data-finance-tab="${key}">${tabs[key].label}</button>`).join("")}<button class="pill" data-print-finance>Print current tab</button></div></section><section class="card"><div class="page-head"><div><h3>${escapeHtml(active.label)}</h3><p class="note">${escapeHtml(scope)}</p></div></div>${active.content}</section>`;
}

export async function auditHistoryView() {
  return superAdminAuditLogView();
}

export async function advertisingApprovalView() {
  requireSuperAdmin();
  const data = await api("/business/admin/pending");
  const businesses = data.businesses || [];
  const pending = businesses.filter(row => row.status === "PENDING_APPROVAL");
  const published = businesses.filter(row => row.status === "PUBLISHED");
  const other = businesses.filter(row => !["PENDING_APPROVAL", "PUBLISHED"].includes(row.status));
  const defaultFeatureStart = inputDate(new Date());
  const defaultFeatureEnd = inputDate(new Date(Date.now() + (6 * 24 * 60 * 60 * 1000)));
  const adCard = business => {
    const image = imageUrl(business.flyerUrl);
    const tone = business.status === "PUBLISHED" ? "blue" : business.status === "PENDING_APPROVAL" ? "amber" : "red";
    return `<article class="card advertising-card"><div class="page-head"><div><span class="tag ${tone}">${escapeHtml(String(business.status).replaceAll("_", " "))}</span><h3>${escapeHtml(business.businessName)}</h3><p class="note">BIZ reference: ${escapeHtml(business.referenceCode || "—")} · Submitted ${escapeHtml(recordDate(business.createdAt))}</p></div>${image ? `<a class="pill" href="${escapeHtml(image)}" target="_blank" rel="noopener">Open image / save local backup</a>` : ""}</div>${image ? `<img class="approval-image" src="${escapeHtml(image)}" alt="${escapeHtml(business.businessName)} flyer preview" />` : "<div class='approval-image approval-image-empty'>No flyer image link supplied</div>"}<div class="grid two"><div class="field"><label for="adCategory-${escapeHtml(business.id)}">Category</label><input id="adCategory-${escapeHtml(business.id)}" value="${escapeHtml(business.category || "Other")}" /></div><div class="field"><label for="adOffer-${escapeHtml(business.id)}">Featured offer text</label><input id="adOffer-${escapeHtml(business.id)}" value="${escapeHtml(business.discountText || "")}" placeholder="Example: 10% club offer" /></div><div class="field"><label for="adFlyer-${escapeHtml(business.id)}">Flyer image URL</label><input id="adFlyer-${escapeHtml(business.id)}" value="${escapeHtml(business.flyerUrl || "")}" placeholder="Uploaded Storage URL or existing Drive link" /><div class="actions"><input id="adFlyerFile-${escapeHtml(business.id)}" type="file" accept="image/png,image/jpeg,image/webp" /><button class="pill" type="button" data-upload-ad-image="${escapeHtml(business.id)}">Upload flyer</button></div></div><div class="field"><label for="adDestination-${escapeHtml(business.id)}">Click-through business link</label><input id="adDestination-${escapeHtml(business.id)}" value="${escapeHtml(business.destinationUrl || business.website || "")}" placeholder="Website, WhatsApp, catalogue, social page, or map" /></div><div class="field"><label for="adWebsite-${escapeHtml(business.id)}">Website link</label><input id="adWebsite-${escapeHtml(business.id)}" value="${escapeHtml(business.website || "")}" placeholder="Optional website" /></div><div class="field"><label for="adAddress-${escapeHtml(business.id)}">Location / address</label><input id="adAddress-${escapeHtml(business.id)}" value="${escapeHtml(business.address || "")}" placeholder="Area, building, or shop location" /></div></div><div class="advertising-feature-window"><label class="pill"><input id="adFeatured-${escapeHtml(business.id)}" type="checkbox" ${business.featured ? "checked" : ""} /> Feature on front page</label><div class="field"><label for="adFeatureStart-${escapeHtml(business.id)}">Featured start date</label><input id="adFeatureStart-${escapeHtml(business.id)}" type="date" value="${escapeHtml(inputDate(business.featureStartAt) || defaultFeatureStart)}" /></div><div class="field"><label for="adFeatureEnd-${escapeHtml(business.id)}">Featured end date</label><input id="adFeatureEnd-${escapeHtml(business.id)}" type="date" value="${escapeHtml(inputDate(business.featureEndAt) || defaultFeatureEnd)}" /></div></div><div class="actions"><button class="primary" data-save-ad="${escapeHtml(business.id)}">Save advertisement</button>${business.status === "PENDING_APPROVAL" ? `<button class="primary" data-ad-decision="PUBLISH" data-ad-id="${escapeHtml(business.id)}">Approve & publish</button><button class="pill" data-ad-decision="REJECT" data-ad-id="${escapeHtml(business.id)}">Reject</button>` : business.status === "PUBLISHED" ? `<button class="pill" data-ad-decision="UNPUBLISH" data-ad-id="${escapeHtml(business.id)}">Unpublish</button>` : ""}</div></article>`;
  };
  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Advertising Approval</h2><p>Review BaZaar submissions, publish approved businesses, manage up to ten current featured ads, and publish official notices.</p></div></div><section class="card"><h3>Create official notice</h3><p class="note">An optional public Google Drive image can be displayed with the club announcement. Use the image preview button before publishing.</p><div class="field"><label for="noticeTitle">Notice title</label><input id="noticeTitle" maxlength="160" placeholder="Club notice or announcement title" /></div><div class="field"><label for="noticeBody">Notice message</label><textarea id="noticeBody" maxlength="1200" placeholder="Write the official club notice."></textarea></div><div class="field"><label for="noticeImageUrl">Announcement image URL (optional)</label><input id="noticeImageUrl" type="url" maxlength="1800" placeholder="Uploaded Storage URL or existing Drive link" /><div class="actions"><input id="noticeImageFile" type="file" accept="image/png,image/jpeg,image/webp" /><button id="uploadNoticeImage" class="pill" type="button">Upload announcement</button></div></div><div class="actions"><button id="previewNoticeImage" class="pill" type="button">Preview notice image</button><button id="publishOfficialNotice" class="primary" type="button">Publish official notice</button></div><div id="noticeImagePreview" class="image-link-preview hidden"></div></section><section class="card"><h3>Pending business approvals</h3><p class="note">Review every business, open the image if you want to save a local backup, then approve, reject, or edit the listing.</p><div class="advertising-list">${pending.map(adCard).join("") || "<p class='note'>No business submission is awaiting approval.</p>"}</div></section><section class="card"><h3>Business update requests</h3>${(data.updateRequests || []).map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.referenceCode || "Business update")}</b><p>${escapeHtml(row.requestedBusinessName || "Existing business")} · ${escapeHtml(row.requestedCategory || "No category change")} · ${escapeHtml(recordDate(row.createdAt))}</p></div><div class="actions"><button class="primary" data-update-request-decision="APPROVE" data-update-request-id="${escapeHtml(row.id)}">Approve update</button><button class="pill" data-update-request-decision="REJECT" data-update-request-id="${escapeHtml(row.id)}">Reject</button></div></div>`).join("") || "<p class='note'>No advertiser update request is awaiting approval.</p>"}</section><section class="card"><h3>Published directory and featured ads</h3><p class="note">Maximum ten featured ads may overlap. When a feature end date passes, the business stays in BaZaar but automatically leaves the landing-page carousel.</p><div class="advertising-list">${published.map(adCard).join("") || "<p class='note'>No business has been published yet.</p>"}</div></section>${other.length ? `<section class="card"><h3>Unpublished or rejected businesses</h3><div class="advertising-list">${other.map(adCard).join("")}</div></section>` : ""}<section class="card"><h3>Official notice history</h3>${(data.notices || []).map(notice => `<div class="session"><div class="grow"><b>${escapeHtml(notice.title)}</b><p>${escapeHtml(recordDate(notice.publishedAt || notice.createdAt))} · ${notice.published ? "Published" : "Draft"}</p></div>${notice.imageUrl ? `<a class="pill" href="${escapeHtml(imageUrl(notice.imageUrl))}" target="_blank" rel="noopener">Open image / save backup</a>` : ""}<button class="pill" data-toggle-notice="${escapeHtml(notice.id)}" data-notice-published="${notice.published}">${notice.published ? "Unpublish" : "Publish"}</button></div>`).join("") || "<p class='note'>No official notices have been created yet.</p>"}</section>`;
}

export function bindAdminViews() {
  const createActivity = document.getElementById("createActivity");
  if (createActivity) createActivity.onclick = async () => { try { await api("/activities", { method: "POST", body: { name: document.getElementById("newActivityName").value.trim() } }); notify("Activity created."); refresh(); } catch (error) { notify(error.message); } };
  document.querySelectorAll("[data-create-flight]").forEach(button => button.onclick = async () => { try { const id = button.dataset.createFlight; await api(`/activities/${encodeURIComponent(id)}/flights`, { method: "POST", body: { name: document.getElementById(`flightName-${id}`).value.trim(), sortOrder: Number(document.getElementById(`flightSort-${id}`).value) } }); notify("Flight created."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-activity]").forEach(button => button.onclick = async () => { try { await api(`/activities/${encodeURIComponent(button.dataset.toggleActivity)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-flight]").forEach(button => button.onclick = async () => { try { await api(`/activities/${encodeURIComponent(button.dataset.activityId)}/flights/${encodeURIComponent(button.dataset.toggleFlight)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); refresh(); } catch (error) { notify(error.message); } });

  const createMember = document.getElementById("createMember");
  if (createMember) createMember.onclick = async () => { try { const flightId = document.getElementById("memberFlight").value; if (!flightId) throw new Error("Choose an assigned flight."); latestInvitation = await api("/members/pre-register", { method: "POST", body: { registeredName: document.getElementById("memberFullName").value.trim(), phone: document.getElementById("memberPhone").value.trim(), role: document.getElementById("memberRole").value, flightId } }); latestInvitation.fullName = latestInvitation.registeredName || document.getElementById("memberFullName").value.trim(); notify("Member pre-registered."); refresh(); } catch (error) { notify(error.message); } };
  const hideLatestInvitation = document.getElementById("hideLatestInvitation");
  if (hideLatestInvitation) hideLatestInvitation.onclick = () => { latestInvitation = null; refresh(); };
  document.querySelectorAll("[data-whatsapp-onboarding-name]").forEach(button => button.onclick = () => { const phone = String(button.dataset.whatsappOnboardingPhone || "").replace(/\D/g, ""); if (!phone) return notify("No phone number was saved."); const name = button.dataset.whatsappOnboardingName || "Member"; const appUrl = `${window.location.origin}${window.location.pathname}`; const message = encodeURIComponent(`Hello ${name}, your Indian Club Bahrain membership is ready. Open ${appUrl}, choose New registered member? Create my login, then enter the same registered name and phone number provided to Super Admin. You can create your own email address and password.`); window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener" ); });

  const rosterActivity = document.getElementById("rosterActivityFilter"); if (rosterActivity) rosterActivity.onchange = () => { selectedRosterActivityId = rosterActivity.value; selectedRosterFlightId = ""; refresh(); };
  const rosterFlight = document.getElementById("rosterFlightFilter"); if (rosterFlight) rosterFlight.onchange = () => { selectedRosterFlightId = rosterFlight.value; refresh(); };
  document.querySelectorAll("[data-save-member]").forEach(button => button.onclick = async () => { try { const uid = button.dataset.saveMember, role = document.getElementById(`memberRole-${uid}`).value, flightId = document.getElementById(`memberFlight-${uid}`).value; if (!flightId) throw new Error("Choose one assigned flight."); await api(`/members/${encodeURIComponent(uid)}`, { method: "PATCH", body: { role, flightId } }); notify(role === "LEVEL_ADMIN" ? "Member is now Flight Admin for the selected level only." : "Member is now a Player."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-member]").forEach(button => button.onclick = async () => { try { await api(`/members/${encodeURIComponent(button.dataset.toggleMember)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); notify("Member access updated."); refresh(); } catch (error) { notify(error.message); } });

  const loadMonth = document.getElementById("loadMasterMonth"); if (loadMonth) loadMonth.onclick = () => { selectedMasterMonth = document.getElementById("masterMonth").value; selectedMasterActivityId = document.getElementById("masterActivity").value; refresh(); };
  const bulkImport = document.getElementById("importBulkTimetable"); if (bulkImport) bulkImport.onclick = async () => { try { const lines = document.getElementById("bulkTimetableCsv").value.split(/\r?\n/).map(line => line.trim()).filter(Boolean); if (lines[0]?.toLowerCase().replaceAll(" ", "") === "weekday,flight,starttime,endtime") lines.shift(); const rows = lines.map((line, index) => { const parts = line.split(",").map(value => value.trim()); if (parts.length !== 4) throw new Error(`Bulk row ${index + 1} must have weekday, flight, start time, and end time.`); const flight = flights.find(item => item.name.toLowerCase() === parts[1].toLowerCase()); if (!flight) throw new Error(`Bulk row ${index + 1} flight was not found: ${parts[1]}.`); return { weekday: parts[0], flightId: flight.id, startTime: parts[2], endTime: parts[3] }; }); if (!rows.length) throw new Error("Paste at least one timetable row."); const result = await api("/timetable/master/bulk-slots", { method: "POST", body: { activityId: selectedMasterActivityId, rows } }); notify(`${result.created?.length || 0} weekly slots imported. ${result.skipped?.length || 0} overlapping existing slots skipped.`); refresh(); } catch (error) { notify(error.message); } };
  const downloadBulkTemplate = document.getElementById("downloadBulkTemplate"); if (downloadBulkTemplate) downloadBulkTemplate.onclick = () => { const csv = "weekday,flight,startTime,endTime\nSaturday,Flight 2,18:35,19:35\nSaturday,Flight 1,19:35,20:35\nSunday,Flight 4B,18:35,19:35\n"; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "master-timetable-template.csv"; link.click(); URL.revokeObjectURL(link.href); };
  const saveSlot = document.getElementById("saveMasterSlot"); if (saveSlot) saveSlot.onclick = async () => { try { await api("/timetable/master/slot", { method: "POST", body: { weekday: document.getElementById("slotDay").value, flightId: document.getElementById("slotFlight").value, startTime: document.getElementById("slotStart").value, endTime: document.getElementById("slotEnd").value } }); notify("Weekly timetable slot saved."); refresh(); } catch (error) { notify(error.message); } };
  const publish = document.getElementById("publishMasterMonth"); if (publish) publish.onclick = async () => { try { await api("/timetable/master/publish-month", { method: "POST", body: { month: selectedMasterMonth, activityId: selectedMasterActivityId } }); notify("Monthly sessions published."); } catch (error) { notify(error.message); } };
  document.querySelectorAll("[data-delete-slot]").forEach(button => button.onclick = async () => { if (!confirm("Remove this weekly timetable slot?")) return; try { await api(`/timetable/master/slot/${encodeURIComponent(button.dataset.deleteSlot)}`, { method: "DELETE" }); refresh(); } catch (error) { notify(error.message); } });

  const financeActivity = document.getElementById("financeActivityFilter"); if (financeActivity) financeActivity.onchange = () => { selectedFinanceActivityId = financeActivity.value && [...financeActivity.options].some(option => option.value === financeActivity.value) ? financeActivity.value : ""; selectedFinanceFlightId = ""; selectedFinanceCreditMemberId = ""; refresh(); };
  const financeFlight = document.getElementById("financeFlightFilter"); if (financeFlight) financeFlight.onchange = () => { selectedFinanceFlightId = financeFlight.value && [...financeFlight.options].some(option => option.value === financeFlight.value) ? financeFlight.value : ""; selectedFinanceCreditMemberId = ""; refresh(); };
  const financeCreditMember = document.getElementById("financeCreditMember"); if (financeCreditMember) financeCreditMember.onchange = () => { selectedFinanceCreditMemberId = financeCreditMember.value; const selectedOption = financeCreditMember.options[financeCreditMember.selectedIndex]; const preview = document.getElementById("financeSelectedMemberPreview"); const addButton = document.getElementById("addFinanceCredit"); const deductButton = document.getElementById("deductFinanceCredit"); const balance = Number(selectedOption?.dataset.walletBalance || 0); if (preview) preview.innerHTML = selectedFinanceCreditMemberId ? `Selected member: <b>${escapeHtml(selectedOption.textContent || "selected member")}</b><br>Current wallet credit: <b id="financeCurrentCredit">${bhd(balance)}</b>` : "Choose the exact member before adding or deducting credit."; if (addButton) addButton.disabled = !selectedFinanceCreditMemberId; if (deductButton) deductButton.disabled = !selectedFinanceCreditMemberId; };
  document.querySelectorAll("[data-finance-tab]").forEach(button => button.onclick = () => { selectedFinanceTab = button.dataset.financeTab || "credits"; refresh(); });
  document.querySelectorAll("[data-audit-category]").forEach(button => button.onclick = () => { selectedAuditCategory = button.dataset.auditCategory || "ALL"; refresh(); });
  const auditActivity = document.getElementById("auditActivityFilter"); if (auditActivity) auditActivity.onchange = () => { selectedAuditActivityId = auditActivity.value; selectedAuditFlightId = ""; refresh(); };
  const auditFlight = document.getElementById("auditFlightFilter"); if (auditFlight) auditFlight.onchange = () => { selectedAuditFlightId = auditFlight.value; refresh(); };
  const auditDate = document.getElementById("auditDateFilter"); if (auditDate) auditDate.onchange = () => { selectedAuditDate = auditDate.value; refresh(); };
  const auditMember = document.getElementById("auditMemberFilter"); if (auditMember) auditMember.onchange = () => { selectedAuditMember = auditMember.value; refresh(); };
  document.querySelectorAll("[data-print-audit-log]").forEach(button => button.onclick = () => auditPrint("superAdminAuditPrint", "Indian Club Bahrain filtered audit log"));
  const addCredit = document.getElementById("addFinanceCredit"); if (addCredit) addCredit.onclick = async () => { try { const memberUid = document.getElementById("financeCreditMember").value, amountFils = Math.round(Number(document.getElementById("financeCreditAmount").value) * 1000), note = document.getElementById("financeCreditNote").value.trim(); if (!memberUid) throw new Error("Choose a member."); if (!Number.isInteger(amountFils) || amountFils < 1) throw new Error("Enter a valid credit amount."); await api("/finance/admin/wallet-credit", { method: "POST", body: { memberUid, amountFils, note } }); notify("Verified wallet credit added to the selected member."); refresh(); } catch (error) { notify(error.message); } };
  const deductCredit = document.getElementById("deductFinanceCredit"); if (deductCredit) deductCredit.onclick = async () => { try { const memberUid = document.getElementById("financeCreditMember").value, deductionFils = Math.round(Number(document.getElementById("financeCreditDeduction").value) * 1000), note = document.getElementById("financeCreditAdjustmentNote").value.trim(); if (!memberUid) throw new Error("Choose a member."); if (!Number.isInteger(deductionFils) || deductionFils < 1) throw new Error("Enter a valid deduction amount."); if (!note) throw new Error("Enter the reason for this manual deduction."); const result = await api("/finance/admin/wallet-adjustment", { method: "POST", body: { memberUid, adjustmentFils: -deductionFils, note } }); notify(`Credit deducted. Current wallet credit: ${bhd(result.balanceAfterFils)}.`); refresh(); } catch (error) { notify(error.message); } };
  document.querySelectorAll("[data-verify-payment]").forEach(button => button.onclick = async () => { try { await api(`/finance/payments/${encodeURIComponent(button.dataset.verifyPayment)}/verify`, { method: "POST" }); notify("Cash / Benefit payment confirmed."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-whatsapp-reminder]").forEach(button => button.onclick = () => { const phone = String(button.dataset.whatsappReminder || "").replace(/\D/g, ""); if (!phone) return notify("This Player has no phone number saved."); const message = encodeURIComponent(`Hello ${button.dataset.whatsappName}, a club shuttlecock amount of ${button.dataset.whatsappAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`); window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener" ); });
  document.querySelectorAll("[data-print-finance], [data-print-audit]").forEach(button => button.onclick = () => window.print());

  document.querySelectorAll("[data-upload-ad-image]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.uploadAdImage;
      const file = document.getElementById(`adFlyerFile-${id}`).files[0];
      document.getElementById(`adFlyer-${id}`).value = await uploadAdminImage(file);
      notify("Flyer uploaded. Save the advertisement to attach it.");
    } catch (error) { notify(error.message); }
  });
  const uploadNoticeImage = document.getElementById("uploadNoticeImage");
  if (uploadNoticeImage) uploadNoticeImage.onclick = async () => {
    try {
      const file = document.getElementById("noticeImageFile").files[0];
      document.getElementById("noticeImageUrl").value = await uploadAdminImage(file);
      notify("Announcement image uploaded.");
    } catch (error) { notify(error.message); }
  };
  const previewNoticeImage = document.getElementById("previewNoticeImage");
  if (previewNoticeImage) previewNoticeImage.onclick = () => {
    const preview = document.getElementById("noticeImagePreview");
    const url = imageUrl(document.getElementById("noticeImageUrl").value);
    if (!url) return notify("Paste a valid Google Drive or public image link first.");
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Official notice image preview" />`;
    preview.classList.remove("hidden");
  };
  const publishOfficialNotice = document.getElementById("publishOfficialNotice");
  if (publishOfficialNotice) publishOfficialNotice.onclick = async () => {
    try {
      await api("/business/admin/notices", { method: "POST", body: {
        title: document.getElementById("noticeTitle").value.trim(),
        body: document.getElementById("noticeBody").value.trim(),
        imageUrl: document.getElementById("noticeImageUrl").value.trim(),
        published: true
      }});
      notify("Official notice published.");
      refresh();
    } catch (error) { notify(error.message); }
  };
  document.querySelectorAll("[data-toggle-notice]").forEach(button => button.onclick = async () => {
    try {
      await api(`/business/admin/notices/${encodeURIComponent(button.dataset.toggleNotice)}`, { method: "PATCH", body: { published: button.dataset.noticePublished !== "true" } });
      notify("Official notice updated.");
      refresh();
    } catch (error) { notify(error.message); }
  });
  document.querySelectorAll("[data-ad-decision]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.adId;
      const note = String(prompt(`Optional note for ${button.dataset.adDecision.toLowerCase()}:`) || "").trim();
      await api(`/business/admin/${encodeURIComponent(id)}/decision`, { method: "POST", body: { decision: button.dataset.adDecision, note } });
      if (button.dataset.adDecision === "PUBLISH") {
        const featured = document.getElementById(`adFeatured-${id}`).checked;
        const body = {
          category: document.getElementById(`adCategory-${id}`).value.trim(),
          discountText: document.getElementById(`adOffer-${id}`).value.trim(),
          flyerUrl: document.getElementById(`adFlyer-${id}`).value.trim(),
          destinationUrl: document.getElementById(`adDestination-${id}`).value.trim(),
          website: document.getElementById(`adWebsite-${id}`).value.trim(),
          address: document.getElementById(`adAddress-${id}`).value.trim(),
          featured,
          featureStartDate: document.getElementById(`adFeatureStart-${id}`).value,
          featureEndDate: document.getElementById(`adFeatureEnd-${id}`).value
        };
        if (featured && (!body.featureStartDate || !body.featureEndDate)) throw new Error("The business was published, but both featured dates are needed before it can be featured.");
        await api(`/business/admin/${encodeURIComponent(id)}`, { method: "PATCH", body });
      }
      notify(`Business ${String(button.dataset.adDecision).toLowerCase()}ed.`);
      refresh();
    } catch (error) { notify(error.message); }
  });
  document.querySelectorAll("[data-save-ad]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.saveAd;
      const featured = document.getElementById(`adFeatured-${id}`).checked;
      const body = {
        category: document.getElementById(`adCategory-${id}`).value.trim(),
        discountText: document.getElementById(`adOffer-${id}`).value.trim(),
        flyerUrl: document.getElementById(`adFlyer-${id}`).value.trim(),
        destinationUrl: document.getElementById(`adDestination-${id}`).value.trim(),
        website: document.getElementById(`adWebsite-${id}`).value.trim(),
        address: document.getElementById(`adAddress-${id}`).value.trim(),
        featured,
        featureStartDate: document.getElementById(`adFeatureStart-${id}`).value,
        featureEndDate: document.getElementById(`adFeatureEnd-${id}`).value
      };
      if (featured && (!body.featureStartDate || !body.featureEndDate)) throw new Error("Choose both featured start and end dates.");
      await api(`/business/admin/${encodeURIComponent(id)}`, { method: "PATCH", body });
      notify("Advertisement saved.");
      refresh();
    } catch (error) { notify(error.message); }
  });
  document.querySelectorAll("[data-update-request-decision]").forEach(button => button.onclick = async () => {
    try {
      await api(`/business/admin/update-requests/${encodeURIComponent(button.dataset.updateRequestId)}/decision`, { method: "POST", body: { decision: button.dataset.updateRequestDecision } });
      notify("Business update request reviewed.");
      refresh();
    } catch (error) { notify(error.message); }
  });
}
