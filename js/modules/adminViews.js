import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

let selectedMasterMonth = new Date().toISOString().slice(0, 7);
let selectedMasterActivityId = "";
let selectedFinanceActivityId = "";
let selectedFinanceFlightId = "";
let selectedRosterActivityId = "";
let selectedRosterFlightId = "";
let latestInvitation = null;

function requireSuperAdmin() {
  if (state.member?.role !== "SUPER_ADMIN") throw new Error("Only Super Admin can access this module.");
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function flattenFlights(activities) {
  return activities.flatMap(activity => (activity.flights || []).map(flight => ({
    ...flight,
    activityId: activity.id,
    activityName: activity.name
  })));
}

function flightOptions(activities, selectedFlightId = "") {
  return activities.map(activity => `
    <optgroup label="${escapeHtml(activity.name)}">
      ${(activity.flights || []).map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedFlightId ? "selected" : ""}>${escapeHtml(flight.name)}</option>`).join("")}
    </optgroup>
  `).join("");
}

function financeRows(rows, emptyText, options = {}) {
  if (!rows?.length) return `<p class="note">${escapeHtml(emptyText)}</p>`;
  const due = Boolean(options.showAmountDue);
  const reminders = Boolean(options.showReminder);
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th><th>Flight</th><th>Amount</th><th>Status</th>${reminders ? "<th>Action</th>" : ""}</tr></thead><tbody>${rows.map(row => `<tr><td><b>${escapeHtml(row.memberName || row.memberId || row.memberUid)}</b>  
<small>${escapeHtml(row.memberId || "")}</small></td><td>${escapeHtml(row.flightName || "—")}</td><td>${bhd(due ? row.amountDueFils : (row.totalChargeFils || row.amountFils))}</td><td><span class="tag ${String(row.status || "").startsWith("PAID") ? "blue" : String(row.status) === "DUE" ? "red" : "amber"}">${escapeHtml(row.status || "DUE")}</span></td>${reminders ? `<td><button class="pill" data-whatsapp-reminder="${escapeHtml(row.phone || "")}" data-whatsapp-name="${escapeHtml(row.memberName || "Member")}" data-whatsapp-amount="${escapeHtml(bhd(row.amountDueFils))}">WhatsApp reminder</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

export async function activitiesAndFlightsView() {
  requireSuperAdmin();
  const [activities, allMembers, invitations] = await Promise.all([
    api("/activities"), api("/members"), api("/members/invitations")
  ]);

  const allFlights = flattenFlights(activities);
  const memberAccounts = allMembers.filter(member => ["PLAYER", "LEVEL_ADMIN"].includes(member.role));
  const rosterFlights = selectedRosterActivityId
    ? allFlights.filter(flight => flight.activityId === selectedRosterActivityId)
    : allFlights;

  if (selectedRosterFlightId && !rosterFlights.some(flight => flight.id === selectedRosterFlightId)) {
    selectedRosterFlightId = "";
  }

  const rosterMembers = memberAccounts.filter(member => {
    if (selectedRosterFlightId) return member.flightId === selectedRosterFlightId;
    if (selectedRosterActivityId) return rosterFlights.some(flight => flight.id === member.flightId);
    return true;
  });

  return `
    <div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Activities, Flights & Members</h2><p>Create activities, manage levels, see every roster, and assign delegated Flight Admins.</p></div></div>

    <section class="card">
      <h3>Add sport / activity</h3>
      <div class="grid two"><div class="field"><label for="newActivityName">Activity name</label><input id="newActivityName" placeholder="Badminton" /></div><div class="field"><label>&nbsp;</label><button id="createActivity" class="primary">Create activity</button></div></div>
    </section>

    <section class="grid admin-activity-list">
      ${activities.map(activity => `<article class="card activity-card"><div class="page-head"><div><span class="tag ${activity.active ? "blue" : "red"}">${activity.active ? "ACTIVE" : "INACTIVE"}</span><h3>${escapeHtml(activity.name)}</h3><p>${activity.flights?.length || 0} flight(s). Timetable slots always use Courts 1 and 2.</p></div><button class="pill" data-toggle-activity="${escapeHtml(activity.id)}" data-active="${activity.active}">${activity.active ? "Deactivate" : "Activate"}</button></div><div class="flight-list">${(activity.flights || []).map(flight => `<div class="session"><div class="datebox">2<small>courts</small></div><div class="grow"><b>${escapeHtml(flight.name)}</b><p>Display order: ${Number(flight.sortOrder ?? 999)}</p></div><span class="tag ${flight.active ? "blue" : "red"}">${flight.active ? "ACTIVE" : "INACTIVE"}</span><button class="pill" data-toggle-flight="${escapeHtml(flight.id)}" data-activity-id="${escapeHtml(activity.id)}" data-active="${flight.active}">${flight.active ? "Deactivate" : "Activate"}</button></div>`).join("") || "<p class='note'>No flights yet.</p>"}</div><div class="add-flight-box"><div class="field"><label for="flightName-${escapeHtml(activity.id)}">New flight name</label><input id="flightName-${escapeHtml(activity.id)}" placeholder="Premier, Flight 1, Flight 4B" /></div><div class="field"><label for="flightSort-${escapeHtml(activity.id)}">Display order</label><input id="flightSort-${escapeHtml(activity.id)}" type="number" min="0" value="${(activity.flights?.length || 0) + 1}" /></div><button class="primary" data-create-flight="${escapeHtml(activity.id)}">Add flight</button></div></article>`).join("") || "<section class='card'><p class='note'>Create Badminton first.</p></section>"}
    </section>

    <section class="card" id="memberManagement">
      <span class="tag blue">INVITE MEMBER OR DELEGATE</span><h3>Add Player or delegated Flight Admin</h3>
      <p class="note">To add another delegate, select <b>Flight Admin</b> and select one flight. The delegate can manage only that flight. They complete their own Member ID, email, phone number, and password during sign-up.</p>
      <div class="grid two"><div class="field"><label for="memberFullName">Full name</label><input id="memberFullName" autocomplete="name" /></div><div class="field"><label for="memberRole">Account role</label><select id="memberRole"><option value="PLAYER">Player</option><option value="LEVEL_ADMIN">Flight Admin / Delegate</option></select></div><div class="field"><label for="memberFlight">Assigned flight</label><select id="memberFlight"><option value="">Choose a flight</option>${flightOptions(activities)}</select></div><div class="field"><label>&nbsp;</label><button id="createMember" class="primary">Create invitation</button></div></div>
    </section>

    ${latestInvitation ? `<section class="card"><span class="tag amber">ONE-TIME JOIN CODE</span><h3>Share this code privately with ${escapeHtml(latestInvitation.fullName)}</h3><p><strong>${escapeHtml(latestInvitation.inviteCode)}</strong></p><button id="hideLatestInvitation" class="pill">I have copied the code</button></section>` : ""}

    <section class="card table-wrap">
      <h3>Pending member sign-ups</h3>
      <table class="schedule"><thead><tr><th>Name</th><th>Role</th><th>Activity / Flight</th><th>Expiry</th><th>Action</th></tr></thead><tbody>${invitations.map(invitation => `<tr><td><b>${escapeHtml(invitation.fullName)}</b></td><td>${invitation.role === "LEVEL_ADMIN" ? "Flight Admin" : "Player"}</td><td>${escapeHtml(invitation.activityName || "—")} / ${escapeHtml(invitation.flightName || "—")}</td><td>${invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString("en-BH") : "—"}</td><td><button class="pill" data-regenerate-invitation="${escapeHtml(invitation.id)}">New code</button></td></tr>`).join("") || "<tr><td colspan='5'>No member sign-up is pending.</td></tr>"}</tbody></table>
    </section>

    <section class="card table-wrap">
      <span class="tag blue">ALL LEVELS ROSTER</span><h3>Players and Flight Admins</h3>
      <p class="note">Select any activity or level. To promote an existing Player, change the role to <b>Flight Admin / Delegate</b>, choose their one assigned flight, then save. You may also return a delegate to Player.</p>
      <div class="grid two"><div class="field"><label for="rosterActivityFilter">Activity</label><select id="rosterActivityFilter"><option value="">All activities</option>${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedRosterActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div><div class="field"><label for="rosterFlightFilter">Flight / Level</label><select id="rosterFlightFilter"><option value="">All flights in this selection</option>${rosterFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedRosterFlightId ? "selected" : ""}>${escapeHtml(flight.activityName)} · ${escapeHtml(flight.name)}</option>`).join("")}</select></div></div>
      <table class="schedule"><thead><tr><th>Member</th><th>Role / delegation</th><th>Assigned flight</th><th>Access</th><th>Save</th></tr></thead><tbody>${rosterMembers.map(member => `<tr><td><b>${escapeHtml(member.fullName)}</b>  
<small>${escapeHtml(member.memberId)} · ${escapeHtml(member.email)}</small></td><td><select id="memberRole-${escapeHtml(member.uid)}"><option value="PLAYER" ${member.role === "PLAYER" ? "selected" : ""}>Player</option><option value="LEVEL_ADMIN" ${member.role === "LEVEL_ADMIN" ? "selected" : ""}>Flight Admin / Delegate</option></select></td><td><select id="memberFlight-${escapeHtml(member.uid)}">${flightOptions(activities, member.flightId)}</select></td><td><span class="tag ${member.active ? "blue" : "red"}">${member.active ? "ACTIVE" : "INACTIVE"}</span></td><td><div class="actions"><button class="primary" data-save-member="${escapeHtml(member.uid)}">Save role / flight</button><button class="pill" data-toggle-member="${escapeHtml(member.uid)}" data-active="${member.active}">${member.active ? "Deactivate" : "Activate"}</button></div></td></tr>`).join("") || "<tr><td colspan='5'>No account exists for this selection.</td></tr>"}</tbody></table>
    </section>
  `;
}

export async function superAdminTimetableView() {
  requireSuperAdmin();
  const query = new URLSearchParams({ month: selectedMasterMonth });
  if (selectedMasterActivityId) query.set("activityId", selectedMasterActivityId);
  const data = await api(`/timetable/master?${query.toString()}`);
  const activities = data.activities || [];
  const flights = data.flights || [];
  if (!selectedMasterActivityId && data.activityId) selectedMasterActivityId = data.activityId;

  return `<div class="page-head"><div><span class="tag blue">SUPER ADMIN</span><h2>Master Timetable</h2><p>One weekly pattern repeats for the chosen month. Courts are always fixed at 1 and 2.</p></div></div><section class="card"><div class="grid two"><div class="field"><label for="masterMonth">Month</label><input id="masterMonth" type="month" value="${escapeHtml(selectedMasterMonth)}" /></div><div class="field"><label for="masterActivity">Activity</label><select id="masterActivity">${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedMasterActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div></div><div class="actions"><button id="loadMasterMonth" class="pill">Load timetable</button><button id="publishMasterMonth" class="primary">Publish this month</button></div></section><section class="card table-wrap"><table class="schedule"><thead><tr><th>Day</th><th>Flight</th><th>Start</th><th>End</th><th>Courts</th><th>Action</th></tr></thead><tbody>${(data.weeklyPattern || []).map(slot => `<tr><td>${escapeHtml(slot.weekday)}</td><td>${escapeHtml(slot.flightName)}</td><td>${escapeHtml(slot.startTime)}</td><td>${escapeHtml(slot.endTime)}</td><td>1 & 2</td><td><button class="pill" data-delete-slot="${escapeHtml(slot.id)}">Remove</button></td></tr>`).join("") || "<tr><td colspan='6'>No weekly slots created yet.</td></tr>"}</tbody></table></section><section class="card"><h3>Add weekly flight slot</h3><div class="grid two"><div class="field"><label for="slotDay">Day</label><select id="slotDay"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div><div class="field"><label for="slotFlight">Flight</label><select id="slotFlight">${flights.map(flight => `<option value="${escapeHtml(flight.id)}">${escapeHtml(flight.name)}</option>`).join("")}</select></div><div class="field"><label for="slotStart">Start time</label><input id="slotStart" type="time" /></div><div class="field"><label for="slotEnd">End time</label><input id="slotEnd" type="time" /></div></div><button id="saveMasterSlot" class="primary">Save weekly slot</button></section>`;
}

export async function financeAdminView() {
  const isSuperAdmin = state.member?.role === "SUPER_ADMIN";
  const isFlightAdmin = state.member?.role === "LEVEL_ADMIN";
  if (!isSuperAdmin && !isFlightAdmin) throw new Error("Only Flight Admin or Super Admin can access finance.");

  const [activities, members] = await Promise.all([api("/activities"), isSuperAdmin ? api("/members") : Promise.resolve([])]);
  const flights = flattenFlights(activities);
  const filteredFlights = selectedFinanceActivityId ? flights.filter(flight => flight.activityId === selectedFinanceActivityId) : flights;
  if (selectedFinanceFlightId && !filteredFlights.some(flight => flight.id === selectedFinanceFlightId)) selectedFinanceFlightId = "";
  const query = new URLSearchParams();
  if (isSuperAdmin && selectedFinanceActivityId) query.set("activityId", selectedFinanceActivityId);
  if (isSuperAdmin && selectedFinanceFlightId) query.set("flightId", selectedFinanceFlightId);
  const data = await api(`/finance/overview${query.size ? `?${query.toString()}` : ""}`);
  const players = members.filter(member => member.active && member.role === "PLAYER" && (!selectedFinanceFlightId || member.flightId === selectedFinanceFlightId) && (!selectedFinanceActivityId || filteredFlights.some(flight => flight.id === member.flightId)));

  return `<div class="page-head"><div><span class="tag blue">${isSuperAdmin ? "SUPER ADMIN FINANCE" : "FLIGHT ADMIN FINANCE"}</span><h2>Finance & Arrears</h2><p>${isSuperAdmin ? "Review every level and add verified Player credit." : "Manage only your assigned flight."}</p></div></div><div class="grid metrics"><article class="card metric"><span>Verified credit</span><b>${bhd(data.totalCreditFils)}</b></article><article class="card metric"><span>Pending payment</span><b>${bhd(data.pendingPaymentFils)}</b></article><article class="card metric"><span>Unpaid arrears</span><b>${bhd(data.arrearsFils)}</b></article><article class="card metric"><span>Session costs</span><b>${bhd(data.monthCostFils)}</b></article></div>${isSuperAdmin ? `<section class="card"><h3>Review by activity and flight</h3><div class="grid two"><div class="field"><label for="financeActivityFilter">Activity</label><select id="financeActivityFilter"><option value="">All activities</option>${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedFinanceActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}</select></div><div class="field"><label for="financeFlightFilter">Flight / Level</label><select id="financeFlightFilter"><option value="">All flights</option>${filteredFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${flight.id === selectedFinanceFlightId ? "selected" : ""}>${escapeHtml(flight.activityName)} · ${escapeHtml(flight.name)}</option>`).join("")}</select></div></div></section><section class="card"><h3>Add verified Player credit</h3><div class="grid two"><div class="field"><label for="financeCreditMember">Player</label><select id="financeCreditMember"><option value="">Choose Player</option>${players.map(player => `<option value="${escapeHtml(player.uid)}">${escapeHtml(player.fullName)} · ${escapeHtml(player.flightName || "Assigned flight")}</option>`).join("")}</select></div><div class="field"><label for="financeCreditAmount">Amount in BHD</label><input id="financeCreditAmount" type="number" min="0.001" step="0.001" placeholder="1.000" /></div></div><div class="field"><label for="financeCreditNote">Verification note</label><input id="financeCreditNote" value="Verified club credit" /></div><button id="addFinanceCredit" class="primary">Add verified credit</button></section><section class="card"><h3>Credited Players</h3>${financeRows(data.credits, "No verified credit entries for this selection.")}</section>` : ""}<section class="card"><h3>Pending Cash / Benefit confirmations</h3>${(data.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>${escapeHtml(payment.flightName || "Flight")} · ${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")}</p></div><strong>${bhd(payment.amountFils)}</strong>${isFlightAdmin ? `<button class="primary" data-verify-payment="${escapeHtml(payment.id)}">Verify</button>` : "<span class='tag amber'>PENDING</span>"}</div>`).join("") || "<p class='note'>No settlement payment awaits confirmation.</p>"}</section><section class="card"><h3>Paid Players</h3>${financeRows(data.paid, "No paid charges for this selection.")}</section><section class="card"><h3>Unpaid Players</h3>${financeRows(data.unpaid, "No unpaid charges for this selection.", { showAmountDue: true, showReminder: isFlightAdmin })}</section><section class="card"><h3>Arrears Players</h3>${financeRows(data.arrears, "No overdue arrears for this selection.", { showAmountDue: true, showReminder: isFlightAdmin })}</section>`;
}

export function bindAdminViews() {
  const createActivity = document.getElementById("createActivity");
  if (createActivity) createActivity.onclick = async () => { try { await api("/activities", { method: "POST", body: { name: document.getElementById("newActivityName").value.trim() } }); notify("Activity created."); refresh(); } catch (error) { notify(error.message); } };

  document.querySelectorAll("[data-create-flight]").forEach(button => button.onclick = async () => { try { const activityId = button.dataset.createFlight; await api(`/activities/${encodeURIComponent(activityId)}/flights`, { method: "POST", body: { name: document.getElementById(`flightName-${activityId}`).value.trim(), sortOrder: Number(document.getElementById(`flightSort-${activityId}`).value) } }); notify("Flight created."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-activity]").forEach(button => button.onclick = async () => { try { await api(`/activities/${encodeURIComponent(button.dataset.toggleActivity)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-flight]").forEach(button => button.onclick = async () => { try { await api(`/activities/${encodeURIComponent(button.dataset.activityId)}/flights/${encodeURIComponent(button.dataset.toggleFlight)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); refresh(); } catch (error) { notify(error.message); } });

  const createMember = document.getElementById("createMember");
  if (createMember) createMember.onclick = async () => { try { const flightId = document.getElementById("memberFlight").value; if (!flightId) throw new Error("Choose an assigned flight."); latestInvitation = await api("/members/invitations", { method: "POST", body: { fullName: document.getElementById("memberFullName").value.trim(), role: document.getElementById("memberRole").value, flightId } }); notify(`Invitation created for ${latestInvitation.fullName}.`); refresh(); } catch (error) { notify(error.message); } };
  const hideLatestInvitation = document.getElementById("hideLatestInvitation");
  if (hideLatestInvitation) hideLatestInvitation.onclick = () => { latestInvitation = null; refresh(); };
  document.querySelectorAll("[data-regenerate-invitation]").forEach(button => button.onclick = async () => { try { latestInvitation = await api(`/members/invitations/${encodeURIComponent(button.dataset.regenerateInvitation)}/regenerate`, { method: "POST" }); notify(`New code created for ${latestInvitation.fullName}.`); refresh(); } catch (error) { notify(error.message); } });

  const rosterActivity = document.getElementById("rosterActivityFilter");
  if (rosterActivity) rosterActivity.onchange = () => { selectedRosterActivityId = rosterActivity.value; selectedRosterFlightId = ""; refresh(); };
  const rosterFlight = document.getElementById("rosterFlightFilter");
  if (rosterFlight) rosterFlight.onchange = () => { selectedRosterFlightId = rosterFlight.value; refresh(); };
  document.querySelectorAll("[data-save-member]").forEach(button => button.onclick = async () => { try { const uid = button.dataset.saveMember; const role = document.getElementById(`memberRole-${uid}`).value; const flightId = document.getElementById(`memberFlight-${uid}`).value; if (!flightId) throw new Error("Choose the member's assigned flight."); await api(`/members/${encodeURIComponent(uid)}`, { method: "PATCH", body: { role, flightId } }); notify(role === "LEVEL_ADMIN" ? "Member is now Flight Admin for the selected level only." : "Member is now a Player in the selected level."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-toggle-member]").forEach(button => button.onclick = async () => { try { await api(`/members/${encodeURIComponent(button.dataset.toggleMember)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } }); notify("Member access updated."); refresh(); } catch (error) { notify(error.message); } });

  const loadMonth = document.getElementById("loadMasterMonth");
  if (loadMonth) loadMonth.onclick = () => { selectedMasterMonth = document.getElementById("masterMonth").value; selectedMasterActivityId = document.getElementById("masterActivity").value; refresh(); };
  const saveSlot = document.getElementById("saveMasterSlot");
  if (saveSlot) saveSlot.onclick = async () => { try { await api("/timetable/master/slot", { method: "POST", body: { weekday: document.getElementById("slotDay").value, flightId: document.getElementById("slotFlight").value, startTime: document.getElementById("slotStart").value, endTime: document.getElementById("slotEnd").value } }); notify("Weekly timetable slot saved."); refresh(); } catch (error) { notify(error.message); } };
  const publish = document.getElementById("publishMasterMonth");
  if (publish) publish.onclick = async () => { try { await api("/timetable/master/publish-month", { method: "POST", body: { month: selectedMasterMonth, activityId: selectedMasterActivityId } }); notify("Monthly sessions published."); } catch (error) { notify(error.message); } };
  document.querySelectorAll("[data-delete-slot]").forEach(button => button.onclick = async () => { if (!confirm("Remove this weekly timetable slot?")) return; try { await api(`/timetable/master/slot/${encodeURIComponent(button.dataset.deleteSlot)}`, { method: "DELETE" }); refresh(); } catch (error) { notify(error.message); } });

  const financeActivity = document.getElementById("financeActivityFilter");
  if (financeActivity) financeActivity.onchange = () => { selectedFinanceActivityId = financeActivity.value; selectedFinanceFlightId = ""; refresh(); };
  const financeFlight = document.getElementById("financeFlightFilter");
  if (financeFlight) financeFlight.onchange = () => { selectedFinanceFlightId = financeFlight.value; refresh(); };
  const addCredit = document.getElementById("addFinanceCredit");
  if (addCredit) addCredit.onclick = async () => { try { const memberUid = document.getElementById("financeCreditMember").value; const amountFils = Math.round(Number(document.getElementById("financeCreditAmount").value) * 1000); const note = document.getElementById("financeCreditNote").value.trim(); if (!memberUid) throw new Error("Choose a Player."); if (!Number.isInteger(amountFils) || amountFils < 1) throw new Error("Enter a valid credit amount."); await api("/finance/admin/wallet-credit", { method: "POST", body: { memberUid, amountFils, note } }); notify("Verified wallet credit added."); refresh(); } catch (error) { notify(error.message); } };
  document.querySelectorAll("[data-verify-payment]").forEach(button => button.onclick = async () => { try { await api(`/finance/payments/${encodeURIComponent(button.dataset.verifyPayment)}/verify`, { method: "POST" }); notify("Cash / Benefit payment confirmed."); refresh(); } catch (error) { notify(error.message); } });
  document.querySelectorAll("[data-whatsapp-reminder]").forEach(button => button.onclick = () => { const phone = String(button.dataset.whatsappReminder || "").replace(/\D/g, ""); if (!phone) return notify("This Player has no phone number saved."); const message = encodeURIComponent(`Hello ${button.dataset.whatsappName}, a club shuttlecock amount of ${button.dataset.whatsappAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`); window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener" ); });
}
