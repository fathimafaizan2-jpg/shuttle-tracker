// MODULE B: DYNAMIC LEVELS & ROSTER MANAGEMENT
const levelsList = ["Premier", "Level 1", "Level 2", "Level 3", "Level 4A", "Level 4B"];

let playersList = JSON.parse(localStorage.getItem('shuttle_players')) || [
  { id: "p1", name: "Alex", memberId: "IC-101", phone: "97339123456", password: "123", level: "Level 4A", wallet: 1.000 },
  { id: "p2", name: "Syed", memberId: "IC-102", phone: "97339000000", password: "123", level: "Level 4A", wallet: 0.000 }
];

function changeActiveFlightLevel(newLevel) {
  activeFlightLevel = newLevel;
  document.querySelectorAll('.adminLevelLabel').forEach(e => e.innerText = activeFlightLevel);
  renderLevelRoster();
}

function renderLevelRoster() {
  const container = document.getElementById('adminFilteredPlayerList');
  if (!container) return;
  container.innerHTML = '';

  const filtered = playersList.filter(p => p.level === activeFlightLevel);

  if (filtered.length === 0) {
    container.innerHTML = `<small style="color:#64748b;">No members registered under ${activeFlightLevel}.</small>`;
    return;
  }

  filtered.forEach((p) => {
    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'M';
    container.innerHTML += `
      <div class="member-item">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="member-avatar">${initial}</div>
          <div>
            <strong>${p.name}</strong> <small>(${p.memberId})</small><br>
            <small style="color:#64748b;">Wallet: BHD ${(p.wallet || 0).toFixed(3)}</small>
          </div>
        </div>
      </div>
    `;
  });
}

function registerPlayerByAdmin() {
  if (!isAdmin) return;
  const memberId = document.getElementById('newMemberID').value.trim();
  const name = document.getElementById('newPlayerName').value.trim();
  const phone = document.getElementById('newPlayerPhone').value.trim();
  const password = document.getElementById('newPlayerPassword').value.trim();

  if (!memberId || !name || !password) {
    alert("Fill in Member ID, Name, and Password!");
    return;
  }

  playersList.push({
    id: `p_${Date.now()}`,
    name, memberId, phone, password,
    level: activeFlightLevel, wallet: 0.000
  });

  localStorage.setItem('shuttle_players', JSON.stringify(playersList));
  renderLevelRoster();
  alert(`Registered ${name} under ${activeFlightLevel}!`);
}
