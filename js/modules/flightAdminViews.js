import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

function dateLabel(value) {
  if (!value) return "—";
  const date = value?._seconds
    ? new Date(Number(value._seconds) * 1000)
    : new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-BH", { dateStyle: "medium" });
}

function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-BH", {
        dateStyle: "medium",
        timeStyle: "short"
      });
}

function notify(message) {
  window.dispatchEvent(
    new CustomEvent("indianclub:toast", { detail: message })
  );
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function onlyFlightAdmin(title) {
  return `
    <section class="card">
      <span class="tag amber">FLIGHT ADMIN OPERATION</span>
      <h2>${escapeHtml(title)}</h2>
      <p class="note">
        Only the Flight Admin delegated to a level can operate this page.
        Super Admin can view the menu only.
      </p>
    </section>
  `;
}

function rows(items, empty, options = {}) {
  if (!items?.length) {
    return `<p class="note">${escapeHtml(empty)}</p>`;
  }

  const due = Boolean(options.due);
  const reminder = Boolean(options.reminder);

  return `
    <div class="table-wrap">
      <table class="schedule">
        <thead>
          <tr>
            <th>Player</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            ${reminder ? "<th>Action</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>
                <b>${escapeHtml(item.memberName || item.memberId || item.memberUid)}</b>
                <br>
                <small>${escapeHtml(item.memberId || "")}</small>
              </td>
              <td>${escapeHtml(dateLabel(item.paidAt || item.createdAt || item.dueAt))}</td>
              <td>${bhd(due ? item.amountDueFils : (item.totalChargeFils || item.amountFils))}</td>
              <td>
                <span class="tag ${String(item.status || "").startsWith("PAID") ? "blue" : item.status === "DUE" ? "red" : "amber"}">
                  ${escapeHtml(item.status || "DUE")}
                </span>
              </td>
              ${reminder ? `
                <td>
                  <button
                    class="pill"
                    data-flight-reminder-phone="${escapeHtml(item.phone || "")}" 
                    data-flight-reminder-name="${escapeHtml(item.memberName || "Member")}" 
                    data-flight-reminder-amount="${escapeHtml(bhd(item.amountDueFils))}">
                    WhatsApp reminder
                  </button>
                </td>
              ` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export async function flightAdminSessionControlView() {
  if (state.member?.role !== "LEVEL_ADMIN") {
    return onlyFlightAdmin("Session Control");
  }

  const [sessions, finance] = await Promise.all([
    api("/timetable/mine"),
    api("/finance/overview")
  ]);

  const finished = sessions
    .filter(session => {
      return new Date(session.endAt || session.startAt).getTime() <= Date.now()
        && session.status !== "COMPLETED";
    })
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return `
    <div class="page-head">
      <div>
        <span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span>
        <h2>Session Control</h2>
        <p>Complete a finished game using actual shuttlecock use. Only final PRESENT attendees receive an equal charge.</p>
      </div>
    </div>

    <section class="card">
      <h3>Complete finished game</h3>
      <div class="grid two">
        <div class="field">
          <label for="completeSessionId">Finished session</label>
          <select id="completeSessionId">
            <option value="">Choose finished game</option>
            ${finished.map(session => `
              <option value="${escapeHtml(session.id)}">
                ${escapeHtml(session.flightName)} · ${escapeHtml(dateTime(session.startAt))}
              </option>
            `).join("")}
          </select>
        </div>
        <div class="field">
          <label for="actualShuttlesUsed">Actual shuttlecocks used</label>
          <input id="actualShuttlesUsed" type="number" min="0" step="1" placeholder="Example: 5" />
        </div>
      </div>
      <button id="completeFlightGame" class="primary">Complete game and create Player charges</button>
      <p class="note">Set Shuttle Stock before completion. A completed game cannot be charged twice.</p>
    </section>

    <section class="card">
      <h3>Pending Cash / Benefit confirmation</h3>
      ${(finance.pendingPayments || []).map(payment => `
        <div class="session">
          <div class="grow">
            <b>${escapeHtml(payment.memberName || payment.memberUid)}</b>
            <p>${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")} · ${escapeHtml(dateLabel(payment.submittedAt))}</p>
          </div>
          <strong>${bhd(payment.amountFils)}</strong>
          <button class="primary" data-flight-verify="${escapeHtml(payment.id)}">Verify</button>
        </div>
      `).join("") || "<p class='note'>No Cash or Benefit settlement is awaiting confirmation for your flight.</p>"}
    </section>

    <section class="card">
      <div class="page-head">
        <div>
          <h3>Paid Players</h3>
          <p class="note">Payment records for your assigned flight.</p>
        </div>
        <button class="pill" data-flight-print>Print paid list</button>
      </div>
      ${rows(finance.paid || [], "No paid Player records.")}
    </section>

    <section class="card">
      <div class="page-head">
        <div>
          <h3>Unpaid Players</h3>
          <p class="note">Send a controlled WhatsApp reminder when appropriate.</p>
        </div>
        <button class="pill" data-flight-print>Print unpaid list</button>
      </div>
      ${rows(finance.unpaid || [], "No unpaid Player records.", { due: true, reminder: true })}
    </section>
  `;
}

export async function flightAdminShuttleStockView() {
  if (state.member?.role !== "LEVEL_ADMIN") {
    return onlyFlightAdmin("Shuttle Stock");
  }

  const stockRows = await api("/inventory/mine");
  const stock = stockRows[0] || {};

  return `
    <div class="page-head">
      <div>
        <span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span>
        <h2>Shuttle Stock</h2>
        <p>Set physical tube price and stock only for your assigned level.</p>
      </div>
    </div>

    <div class="grid metrics">
      <article class="card metric"><span>Available tubes</span><b>${Number(stock.availableTubes || 0)}</b></article>
      <article class="card metric"><span>Loose shuttlecocks</span><b>${Number(stock.looseShuttles || 0)}</b></article>
      <article class="card metric"><span>Total available</span><b>${Number(stock.totalAvailableShuttles || 0)}</b></article>
      <article class="card metric"><span>Tube price</span><b>${bhd(stock.tubePriceFils)}</b></article>
    </div>

    <section class="card">
      <h3>Stock configuration</h3>
      <div class="grid two">
        <div class="field"><label for="stockTubePrice">Tube price in BHD</label><input id="stockTubePrice" type="number" min="0.001" step="0.001" value="${Number(stock.tubePriceFils || 0) ? (Number(stock.tubePriceFils) / 1000).toFixed(3) : ""}" /></div>
        <div class="field"><label for="stockPerTube">Shuttlecocks per tube</label><input id="stockPerTube" type="number" min="1" step="1" value="${escapeHtml(stock.shuttlesPerTube || "")}" placeholder="12 or 15" /></div>
        <div class="field"><label for="stockTubes">Available tubes</label><input id="stockTubes" type="number" min="0" step="1" value="${escapeHtml(stock.availableTubes || 0)}" /></div>
        <div class="field"><label for="stockLoose">Loose shuttlecocks</label><input id="stockLoose" type="number" min="0" step="1" value="${escapeHtml(stock.looseShuttles || 0)}" /></div>
      </div>
      <button id="saveFlightStock" class="primary">Save stock configuration</button>
    </section>

    <section class="card">
      <h3>Physical stock adjustment</h3>
      <div class="grid two">
        <div class="field"><label for="stockDirection">Change</label><select id="stockDirection"><option value="ADD">Add stock</option><option value="REMOVE">Remove stock</option></select></div>
        <div class="field"><label for="stockReason">Reason</label><input id="stockReason" placeholder="New purchase, damaged shuttlecocks" /></div>
        <div class="field"><label for="stockTubeChange">Tube change</label><input id="stockTubeChange" type="number" min="0" step="1" value="0" /></div>
        <div class="field"><label for="stockLooseChange">Loose shuttlecock change</label><input id="stockLooseChange" type="number" min="0" step="1" value="0" /></div>
      </div>
      <button id="adjustFlightStock" class="pill">Save stock adjustment</button>
    </section>
  `;
}

export async function flightAdminReportsView() {
  if (state.member?.role !== "LEVEL_ADMIN") {
    return onlyFlightAdmin("Reports & Sheets Export");
  }

  const finance = await api("/finance/overview");
  window.__indianClubFlightReportRows = [...(finance.paid || []), ...(finance.unpaid || [])];

  return `
    <div class="page-head">
      <div>
        <span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span>
        <h2>Reports & Sheets Export</h2>
        <p>Print or download only your assigned flight’s records.</p>
      </div>
    </div>
    <section class="card">
      <div class="actions">
        <button class="primary" data-flight-print>Print report</button>
        <button id="exportFlightCsv" class="pill">Download CSV</button>
      </div>
    </section>
    <section class="card"><h3>Paid Players</h3>${rows(finance.paid || [], "No paid Player records.")}</section>
    <section class="card"><h3>Unpaid Players</h3>${rows(finance.unpaid || [], "No unpaid Player records.", { due: true })}</section>
  `;
}

export function bindFlightAdminViews() {
  const complete = document.getElementById("completeFlightGame");
  if (complete) complete.onclick = async () => {
    try {
      const sessionId = document.getElementById("completeSessionId").value;
      const actualShuttlesUsed = Number(document.getElementById("actualShuttlesUsed").value);
      if (!sessionId) throw new Error("Choose a finished game.");
      if (!Number.isInteger(actualShuttlesUsed) || actualShuttlesUsed < 0) throw new Error("Enter a whole number of shuttlecocks used.");
      await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { method: "POST", body: { actualShuttlesUsed } });
      notify("Game completed. Stock and Player charges were created.");
      refresh();
    } catch (error) {
      notify(error.message);
    }
  };

  document.querySelectorAll("[data-flight-verify]").forEach(button => button.onclick = async () => {
    try {
      await api(`/finance/payments/${encodeURIComponent(button.dataset.flightVerify)}/verify`, { method: "POST" });
      notify("Cash / Benefit payment confirmed.");
      refresh();
    } catch (error) {
      notify(error.message);
    }
  });

  document.querySelectorAll("[data-flight-reminder-phone]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.flightReminderPhone || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.flightReminderName}, your Indian Club Bahrain shuttlecock charge of ${button.dataset.flightReminderAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  document.querySelectorAll("[data-flight-print]").forEach(button => button.onclick = () => window.print());

  const saveStock = document.getElementById("saveFlightStock");
  if (saveStock) saveStock.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      if (!flightId) throw new Error("Your account has no assigned flight.");
      await api(`/inventory/${encodeURIComponent(flightId)}/config`, {
        method: "PUT",
        body: {
          tubePriceFils: Math.round(Number(document.getElementById("stockTubePrice").value) * 1000),
          shuttlesPerTube: Number(document.getElementById("stockPerTube").value),
          availableTubes: Number(document.getElementById("stockTubes").value),
          looseShuttles: Number(document.getElementById("stockLoose").value)
        }
      });
      notify("Shuttle stock configuration saved.");
      refresh();
    } catch (error) {
      notify(error.message);
    }
  };

  const adjustStock = document.getElementById("adjustFlightStock");
  if (adjustStock) adjustStock.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      const reason = document.getElementById("stockReason").value.trim();
      if (!flightId) throw new Error("Your account has no assigned flight.");
      if (!reason) throw new Error("Enter the adjustment reason.");
      await api(`/inventory/${encodeURIComponent(flightId)}/adjust`, {
        method: "POST",
        body: {
          direction: document.getElementById("stockDirection").value,
          reason,
          tubeChange: Number(document.getElementById("stockTubeChange").value),
          looseChange: Number(document.getElementById("stockLooseChange").value)
        }
      });
      notify("Stock adjustment saved.");
      refresh();
    } catch (error) {
      notify(error.message);
    }
  };

  const exportCsv = document.getElementById("exportFlightCsv");
  if (exportCsv) exportCsv.onclick = () => {
    const reportRows = window.__indianClubFlightReportRows || [];
    const header = ["Player", "Member ID", "Flight", "Date", "Amount BHD", "Status"];
    const values = reportRows.map(row => [
      row.memberName || row.memberUid,
      row.memberId || "",
      row.flightName || "",
      dateLabel(row.paidAt || row.createdAt || row.dueAt),
      (Number(row.amountDueFils || row.totalChargeFils || 0) / 1000).toFixed(3),
      row.status || ""
    ]);
    const csv = [header, ...values]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "indian-club-flight-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
}
