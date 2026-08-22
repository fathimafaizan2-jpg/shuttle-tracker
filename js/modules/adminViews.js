import { api } from "./auth.js";

export async function superAdminTimetableView() {
  const sessions = await api("/timetable/mine");
  return `<section class="page"><h2>Master Timetable</h2><p>Weekly pattern repeats for the whole month. Every slot is fixed at 2 courts.</p><table><thead><tr><th>Flight</th><th>Start</th><th>End</th><th>Courts</th></tr></thead><tbody>${sessions.map(s => `<tr><td>${s.flightId}</td><td>${new Date(s.startAtUtc).toLocaleString()}</td><td>${new Date(s.endAtUtc).toLocaleString()}</td><td>2</td></tr>`).join("")}</tbody></table></section>`;
}

export async function financeAdminView() {
  return `<section class="page"><h2>Finance & Arrears</h2><button id="refreshArrears">Refresh one-day arrears</button><p>Verify Cash/Benefit only after physical confirmation. Export CSV for club audit/Sheets review.</p></section>`;
}

export function bindFinanceAdmin() {
  document.getElementById("refreshArrears")?.addEventListener("click", () => api("/arrears/refresh", { method:"POST" }));
}
