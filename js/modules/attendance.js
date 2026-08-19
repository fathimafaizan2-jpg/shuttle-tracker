// MODULE D & E: ATTENDANCE CHECKLIST & SHUTTLE MATH ENGINE
let tubePacks = parseInt(localStorage.getItem('shuttle_tube_packs')) || 2;
let tubePriceBHD = parseFloat(localStorage.getItem('shuttle_tube_price')) || 6.000;
let currentCorkCount = 2;

function renderAttendees() {
  const container = document.getElementById('attendeeChecklist');
  if (!container) return;
  container.innerHTML = '';

  const levelMembers = playersList.filter(p => p.level === activeFlightLevel);

  if (levelMembers.length === 0) {
    container.innerHTML = `<small style="color:#adb5bd;">No members registered under ${activeFlightLevel} yet.</small>`;
    return;
  }

  levelMembers.forEach(p => {
    const isSelf = currentUser && p.id === currentUser.id;
    const isComing = p.coming !== false;
    const canEdit = (isSelf) || isAdmin;
    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'M';

    container.innerHTML += `
      <div class="member-item">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="member-avatar">${initial}</div>
          <div>
            <strong>${p.name}</strong> ${isSelf ? '<small style="color:var(--primary); font-weight:bold;">(You)</small>' : ''}<br>
            <small style="color:#64748b;">Credit: BHD ${(p.wallet || 0).toFixed(3)}</small>
          </div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="att-btn ${isComing ? 'yes active' : ''}" ${!canEdit ? 'disabled' : ''} onclick="setAttendance('${p.id}', true)">Yes</button>
          <button class="att-btn ${!isComing ? 'no active' : ''}" ${!canEdit ? 'disabled' : ''} onclick="setAttendance('${p.id}', false)">No</button>
        </div>
      </div>
    `;
  });
}

function setAttendance(id, status) {
  const player = playersList.find(p => p.id === id);
  if (!player) return;

  if (!isAdmin && currentUser.id !== id) {
    alert("⚠️ You can only mark attendance for yourself!");
    return;
  }

  player.coming = status;
  localStorage.setItem('shuttle_players', JSON.stringify(playersList));
  renderAttendees();
  recalculateSplit();
}

function updateCorkCount(val) {
  if (!isAdmin) return;
  currentCorkCount = Math.max(1, currentCorkCount + val);
  document.getElementById('corkDisplay').innerText = currentCorkCount;
  recalculateSplit();
}

function recalculateSplit() {
  const levelMembers = playersList.filter(p => p.level === activeFlightLevel);
  const activeCount = levelMembers.filter(p => p.coming !== false).length || 1;

  const totalShuttlesLoaded = tubePacks * 12;
  const availableShuttles = Math.max(0, totalShuttlesLoaded - currentCorkCount);
  const singleShuttlePrice = (tubePacks * tubePriceBHD) / totalShuttlesLoaded;
  const totalGameCost = currentCorkCount * singleShuttlePrice;
  const shareCost = totalGameCost / activeCount;

  if (document.getElementById('playerCurrentLevelDisplay')) {
    document.getElementById('playerCurrentLevelDisplay').innerText = activeFlightLevel;
    document.getElementById('tubeCountDisplay').innerText = tubePacks;
    document.getElementById('totalShuttlesLoadedDisplay').innerText = totalShuttlesLoaded;
    document.getElementById('tubePriceDisplay').innerText = tubePriceBHD.toFixed(3);
    document.getElementById('availableShuttlesDisplay').innerText = availableShuttles;
    document.getElementById('singleShuttlePriceDisplay').innerText = singleShuttlePrice.toFixed(3);
    
    document.getElementById('playerCountDisplay').innerText = activeCount;
    document.getElementById('totalCostDisplay').innerText = totalGameCost.toFixed(3);
    document.getElementById('splitDisplay').innerText = `BHD ${shareCost.toFixed(3)}`;
  }
}
