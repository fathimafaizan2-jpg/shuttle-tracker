import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;
let selectedMasterMonth = new Date().toISOString().slice(0, 7);
let selectedMasterActivityId = "";

function requireSuperAdmin() {
  if (state.member?.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can access this module.");
  }
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

export async function activitiesAndFlightsView() {
  requireSuperAdmin();
  const activities = await api("/activities");

  return `
    <div class="page-head">
      <div>
        <span class="tag blue">SUPER ADMIN</span>
        <h2>Activities & Flights</h2>
        <p>Create Badminton now and future sports later. Flights stay fully dynamic.</p>
      </div>
    </div>

    <section class="card">
      <h3>Add sport / activity</h3>
      <p class="note">Examples: Badminton, Cricket, Football, Volleyball, Table Tennis, Other.</p>
      <div class="grid two">
        <div class="field"><label for="newActivityName">Activity name</label><input id="newActivityName" placeholder="Badminton" /></div>
        <div class="field"><label>&nbsp;</label><button id="createActivity" class="primary">Create activity</button></div>
      </div>
    </section>

    <section class="grid admin-activity-list">
      ${activities.map(activity => `
        <article class="card activity-card">
          <div class="page-head">
            <div>
              <span class="tag ${activity.active ? "blue" : "red"}">${activity.active ? "ACTIVE" : "INACTIVE"}</span>
              <h3>${escapeHtml(activity.name)}</h3>
              <p>${activity.flights?.length || 0} active flight(s). Every future timetable slot uses Courts 1 and 2.</p>
            </div>
            <button class="pill" data-toggle-activity="${escapeHtml(activity.id)}" data-active="${activity.active}">${activity.active ? "Deactivate" : "Activate"}</button>
          </div>

          <div class="flight-list">
            ${(activity.flights || []).map(flight => `
              <div class="session">
                <div class="datebox">2<small>courts</small></div>
                <div class="grow"><b>${escapeHtml(flight.name)}</b><p>Display order: ${Number(flight.sortOrder ?? 999)}</p></div>
                <span class="tag ${flight.active ? "blue" : "red"}">${flight.active ? "ACTIVE" : "INACTIVE"}</span>
                <button class="pill" data-toggle-flight="${escapeHtml(flight.id)}" data-activity-id="${escapeHtml(activity.id)}" data-active="${flight.active}">${flight.active ? "Deactivate" : "Activate"}</button>
              </div>
            `).join("") || "<p class='note'>No flights yet. Add the first flight below.</p>"}
          </div>

          <div class="add-flight-box">
            <div class="field"><label for="flightName-${escapeHtml(activity.id)}">New flight name</label><input id="flightName-${escapeHtml(activity.id)}" placeholder="Premier, Flight 1, Flight 5…" /></div>
            <div class="field"><label for="flightSort-${escapeHtml(activity.id)}">Display order</label><input id="flightSort-${escapeHtml(activity.id)}" type="number" min="0" value="${(activity.flights?.length || 0) + 1}" /></div>
            <button class="primary" data-create-flight="${escapeHtml(activity.id)}">Add flight</button>
          </div>
        </article>
      `).join("") || "<section class='card'><h3>No activity created yet</h3><p class='note'>Create Badminton first, then add Premier and your club flights.</p></section>"}
    </section>
  `;
}

export async function superAdminTimetableView() {
  requireSuperAdmin();
  const query = new URLSearchParams();
  query.set("month", selectedMasterMonth);
  if (selectedMasterActivityId) query.set("activityId", selectedMasterActivityId);

  const data = await api(`/timetable/master?${query.toString()}`);
  const activities = data.activities || [];
  const flights = data.flights || [];
  if (!selectedMasterActivityId && data.activityId) selectedMasterActivityId = data.activityId;

  return `
    <div class="page-head">
      <div>
        <span class="tag blue">SUPER ADMIN</span>
        <h2>Master Timetable</h2>
        <p>One weekly pattern repeats for the chosen month. Courts are always fixed at 1 and 2; no venue field is used.</p>
      </div>
    </div>

    <section class="card">
      <div class="grid two">
        <div class="field"><label for="masterMonth">Month</label><input id="masterMonth" type="month" value="${escapeHtml(selectedMasterMonth)}" /></div>
        <div class="field"><label for="masterActivity">Activity</label><select id="masterActivity">${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${activity.id === selectedMasterActivityId ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("") || "<option value=''>Create an activity first</option>"}</select></div>
      </div>
      <div class="master-actions">
        <button id="loadMasterMonth" class="pill">Load timetable</button>
        <button id="publishMasterMonth" class="primary" ${flights.length ? "" : "disabled"}>Publish this month</button>
      </div>
    </section>

    <section class="card table-wrap">
      <table class="schedule">
        <thead><tr><th>Day</th><th>Flight</th><th>Start</th><th>End</th><th>Courts</th><th>Action</th></tr></thead>
        <tbody>
          ${(data.weeklyPattern || []).map(slot => `<tr><td>${escapeHtml(slot.weekday)}</td><td>${escapeHtml(slot.flightName)}</td><td>${escapeHtml(slot.startTime)}</td><td>${escapeHtml(slot.endTime)}</td><td>1 & 2</td><td><button class="pill" data-delete-slot="${escapeHtml(slot.id)}">Remove</button></td></tr>`).join("") || "<tr><td colspan='6'>No weekly slots created yet.</td></tr>"}
        </tbody>
      </table>
    </section>

    <section class="card">
      <h3>Add weekly flight slot</h3>
      <div class="grid two">
        <div class="field"><label for="slotDay">Day</label><select id="slotDay"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div>
        <div class="field"><label for="slotFlight">Flight</label><select id="slotFlight">${flights.map(flight => `<option value="${escapeHtml(flight.id)}">${escapeHtml(flight.name)}</option>`).join("") || "<option value=''>Create a flight first</option>"}</select></div>
      </div>
      <div class="grid two">
        <div class="field"><label for="slotStart">Start time</label><input id="slotStart" type="time" /></div>
        <div class="field"><label for="slotEnd">End time</label><input id="slotEnd" type="time" /></div>
      </div>
      <p class="note">The server always stores exactly two courts. Court count cannot be changed in the browser.</p>
      <button id="saveMasterSlot" class="primary" ${flights.length ? "" : "disabled"}>Save weekly slot</button>
    </section>
  `;
}

export async function financeAdminView() {
  if (!["LEVEL_ADMIN", "SUPER_ADMIN"].includes(state.member?.role)) throw new Error("Only Flight Admin or Super Admin can access finance.");
  const data = await api("/finance/overview");

  return `
    <div class="page-head"><div><span class="tag blue">FINANCE</span><h2>Finance & Arrears</h2><p>Credits carry forward. Cash and Benefit remain pending until verified.</p></div></div>
    <div class="grid metrics">
      <article class="card metric"><span>Verified credit</span><b>${bhd(data.totalCreditFils)}</b><i>Member wallets</i></article>
      <article class="card metric"><span>Pending payment</span><b>${bhd(data.pendingPaymentFils)}</b><i>Awaiting verification</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(data.arrearsFils)}</b><i>Older than 24 hours</i></article>
      <article class="card metric"><span>Session costs</span><b>${bhd(data.monthCostFils)}</b><i>Current month</i></article>
    </div>
    <section class="card"><h3>Pending Cash / Benefit confirmations</h3>${(data.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-verify-payment="${escapeHtml(payment.id)}">Verify</button></div>`).join("") || "<p class='note'>No payments await verification.</p>"}</section>
  `;
}

export function bindAdminViews() {
  const createActivity = document.getElementById("createActivity");
  if (createActivity) createActivity.onclick = async () => {
    try {
      await api("/activities", { method: "POST", body: { name: document.getElementById("newActivityName").value.trim() } });
      notify("Activity created.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  document.querySelectorAll("[data-create-flight]").forEach(button => {
    button.onclick = async () => {
      const activityId = button.dataset.createFlight;
      try {
        await api(`/activities/${encodeURIComponent(activityId)}/flights`, {
          method: "POST",
          body: {
            name: document.getElementById(`flightName-${activityId}`).value.trim(),
            sortOrder: Number(document.getElementById(`flightSort-${activityId}`).value)
          }
        });
        notify("Flight created. Every timetable slot will use two courts.");
        refresh();
      } catch (error) { notify(error.message); }
    };
  });

  document.querySelectorAll("[data-toggle-activity]").forEach(button => {
    button.onclick = async () => {
      try {
        await api(`/activities/${encodeURIComponent(button.dataset.toggleActivity)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } });
        refresh();
      } catch (error) { notify(error.message); }
    };
  });

  document.querySelectorAll("[data-toggle-flight]").forEach(button => {
    button.onclick = async () => {
      try {
        await api(`/activities/${encodeURIComponent(button.dataset.activityId)}/flights/${encodeURIComponent(button.dataset.toggleFlight)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } });
        refresh();
      } catch (error) { notify(error.message); }
    };
  });

  const load = document.getElementById("loadMasterMonth");
  if (load) load.onclick = () => {
    selectedMasterMonth = document.getElementById("masterMonth").value;
    selectedMasterActivityId = document.getElementById("masterActivity").value;
    refresh();
  };

  const saveSlot = document.getElementById("saveMasterSlot");
  if (saveSlot) saveSlot.onclick = async () => {
    try {
      await api("/timetable/master/slot", {
        method: "POST",
        body: {
          weekday: document.getElementById("slotDay").value,
          flightId: document.getElementById("slotFlight").value,
          startTime: document.getElementById("slotStart").value,
          endTime: document.getElementById("slotEnd").value
        }
      });
      notify("Weekly timetable slot saved.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  const publish = document.getElementById("publishMasterMonth");
  if (publish) publish.onclick = async () => {
    try {
      await api("/timetable/master/publish-month", { method: "POST", body: { month: selectedMasterMonth, activityId: selectedMasterActivityId } });
      notify("Monthly sessions published from the weekly pattern.");
    } catch (error) { notify(error.message); }
  };

  document.querySelectorAll("[data-delete-slot]").forEach(button => {
    button.onclick = async () => {
      if (!confirm("Remove this weekly timetable slot?")) return;
      try {
        await api(`/timetable/master/slot/${encodeURIComponent(button.dataset.deleteSlot)}`, { method: "DELETE" });
        refresh();
      } catch (error) { notify(error.message); }
    };
  });

  document.querySelectorAll("[data-verify-payment]").forEach(button => {
    button.onclick = async () => {
      try {
        await api(`/finance/payments/${encodeURIComponent(button.dataset.verifyPayment)}/verify`, { method: "POST" });
        notify("Payment verified.");
        refresh();
      } catch (error) { notify(error.message); }
    };
  });
}
