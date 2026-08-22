import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

function requireSuperAdmin() {
  if (state.member?.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can access this module.");
  }
}

export async function superAdminTimetableView() {
  requireSuperAdmin();
  const data = await api("/timetable/master");
  const flights = data.flights || [];
  const pattern = data.weeklyPattern || [];

  return `
    <div class="page-head"><div><h2>Master Timetable</h2><p>One weekly timetable pattern repeats for the selected month. Every flight slot always uses Courts 1 and 2.</p></div></div>
    <section class="card">
      <div class="field"><label>Month</label><input id="masterMonth" type="month" value="${escapeHtml(data.month || "")}"></div>
      <div class="field"><label>Activity</label><select id="masterActivity">${(data.activities || []).map(a => `<option value="${escapeHtml(a.id)}" ${a.id === data.activityId ? "selected" : ""}>${escapeHtml(a.name)}</option>`).join("")}</select></div>
      <button id="loadMasterMonth" class="primary">Load month</button>
    </section>
    <section class="card table-wrap">
      <table class="schedule"><thead><tr><th>Day</th><th>Flight</th><th>Start time</th><th>End time</th><th>Courts</th><th>Action</th></tr></thead>
      <tbody>
        ${pattern.map(slot => `<tr><td>${escapeHtml(slot.weekday)}</td><td>${escapeHtml(slot.flightName)}</td><td>${escapeHtml(slot.startTime)}</td><td>${escapeHtml(slot.endTime)}</td><td>1 & 2</td><td><button class="pill" data-delete-slot="${escapeHtml(slot.id)}">Remove</button></td></tr>`).join("") || "<tr><td colspan='6'>No weekly slots created yet.</td></tr>"}
      </tbody></table>
    </section>
    <section class="card"><h3>Add weekly flight slot</h3>
      <div class="grid two"><div class="field"><label>Day</label><select id="slotDay"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div><div class="field"><label>Flight</label><select id="slotFlight">${flights.map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`).join("")}</select></div></div>
      <div class="grid two"><div class="field"><label>Start time</label><input id="slotStart" type="time"></div><div class="field"><label>End time</label><input id="slotEnd" type="time"></div></div>
      <p class="note">Courts are fixed at two for every flight slot. There is no venue field.</p>
      <button id="saveMasterSlot" class="primary">Save weekly slot</button>
    </section>`;
}

export async function financeAdminView() {
  if (!['LEVEL_ADMIN', 'SUPER_ADMIN'].includes(state.member?.role)) {
    throw new Error("Only Flight Admin or Super Admin can access finance.");
  }

  const data = await api("/finance/overview");
  return `
    <div class="page-head"><div><h2>Finance & Arrears</h2><p>Credits carry forward. Cash and Benefit payments stay pending until verified by Admin.</p></div></div>
    <div class="grid metrics">
      <article class="card metric"><span>Verified credit</span><b>${bhd(data.totalCreditFils)}</b><i>Member wallets</i></article>
      <article class="card metric"><span>Pending payment</span><b>${bhd(data.pendingPaymentFils)}</b><i>Awaiting verification</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(data.arrearsFils)}</b><i>Older than 24 hours</i></article>
      <article class="card metric"><span>Session costs</span><b>${bhd(data.monthCostFils)}</b><i>Current month</i></article>
    </div>
    <section class="card"><h3>Pending Cash / Benefit payment confirmations</h3>
      ${(data.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName)}</b><p>${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-verify-payment="${escapeHtml(payment.id)}">Verify</button></div
