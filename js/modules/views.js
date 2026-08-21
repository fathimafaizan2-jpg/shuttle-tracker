// PLAYER VIEWS, ATTENDANCE & COST CALCULATOR
function renderAttendees() {
  if (!currentUser && !isAdmin) return;
  const container = document.getElementById('attendeeChecklist');
  if (!container) return;
  container.innerHTML = '';

  const targetLevel = isAdmin ? adminLevel : (currentUser ? currentUser.level : "Level 4A");
  const levelMembers = playersList.filter(p => normalizeLevel(p.level) === normalizeLevel(targetLevel));

  if (levelMembers.length === 0) {
    container.innerHTML = `<small style="color:#adb5bd;">No members registered under ${targetLevel} yet.</small>`;
    return;
  }

  levelMembers.forEach(p => {
    const isSelf = currentUser && p.id === currentUser.id;
    const isComing = p.coming !== false;
    const isLocked = p.locked === true && !isAdmin;
    const canEdit = (isSelf && !isLocked) || isAdmin;

    let walletText = '';
    if (isSelf || isAdmin) {
      walletText = `<br><small style="color:${(p.wallet||0)<=0?'var(--red)':'var(--text-muted)'};">
        Credit: BHD ${(p.wallet||0).toFixed(3)} ${(p.wallet||0)<=0?'(OUT)':''}
      </small>`;
    }

    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'M';

    container.innerHTML += `
      <div class="attendee-item">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="member-avatar">${initial}</div>
          <div>
            <strong>${p.name}</strong> ${isSelf ? '<small style="color:var(--primary); font-weight:bold;">(You)</small>' : ''}
            ${walletText}
          </div>
        </div>
        <div class="att-btn-group">
          <button class="att-btn yes ${isComing ? 'active' : ''}" ${!canEdit ? 'disabled' : ''} onclick="setAttendance('${p.id}', true)">Yes</button>
          <button class="att-btn no ${!isComing ? 'active' : ''}" ${!canEdit ? 'disabled' : ''} onclick="setAttendance('${p.id}', false)">No</button>
        </div>
      </div>`;
  });
}

function setAttendance(id, status) {
  const player = playersList.find(p => p.id === id);
  if (!player) return;

  if (!isAdmin && currentUser.id !== id) {
    alert("⚠️ You can only mark attendance for yourself!");
    return;
  }

  if (!isAdmin && player.coming === true && status === false) {
    alert("⚠️ Session is locked! If you cannot attend, ask the Admin to mark you as 'No'.");
    return;
  }

  player.coming = status;
  if (status === true) player.locked = true;

  savePlayersData();
  renderAttendees();
  recalculateSplit();
  addAuditLog(currentUser ? currentUser.name : (currentAdminObj ? currentAdminObj.name : "Admin"), `Set attendance for ${player.name} to ${status ? 'Yes' : 'No'}.`);
}

function recalculateSplit() {
  if (!currentUser && !isAdmin) return;
  const targetLevel = isAdmin ? adminLevel : (currentUser ? currentUser.level : "Level 4A");
  const levelMembers = playersList.filter(p => normalizeLevel(p.level) === normalizeLevel(targetLevel));
  const activeCount = levelMembers.filter(p => p.coming !== false).length || 1;

  const totalShuttlesLoaded = tubePacks * 12;
  const availableShuttles = Math.max(0, totalShuttlesLoaded - currentCorkCount);
  const singleShuttlePrice = (tubePacks * tubePriceBHD) / totalShuttlesLoaded;
  const totalGameCost = currentCorkCount * singleShuttlePrice;
  const shareCost = totalGameCost / activeCount;

  if (document.getElementById('playerCurrentLevelDisplay')) document.getElementById('playerCurrentLevelDisplay').innerText = targetLevel;
  if (document.getElementById('tubeCountDisplay')) document.getElementById('tubeCountDisplay').innerText = tubePacks;
  if (document.getElementById('totalShuttlesLoadedDisplay')) document.getElementById('totalShuttlesLoadedDisplay').innerText = totalShuttlesLoaded;
  if (document.getElementById('tubePriceDisplay')) document.getElementById('tubePriceDisplay').innerText = tubePriceBHD.toFixed(3);
  if (document.getElementById('availableShuttlesDisplay')) document.getElementById('availableShuttlesDisplay').innerText = availableShuttles;
  if (document.getElementById('singleShuttlePriceDisplay')) document.getElementById('singleShuttlePriceDisplay').innerText = singleShuttlePrice.toFixed(3);
  
  if (document.getElementById('playerCountDisplay')) document.getElementById('playerCountDisplay').innerText = activeCount;
  if (document.getElementById('totalCostDisplay')) document.getElementById('totalCostDisplay').innerText = totalGameCost.toFixed(3);
  if (document.getElementById('splitDisplay')) document.getElementById('splitDisplay').innerText = `BHD ${shareCost.toFixed(3)}`;

  if (document.getElementById('dashActivePlayers')) document.getElementById('dashActivePlayers').innerText = levelMembers.length;
  if (document.getElementById('dashTubesStocked')) document.getElementById('dashTubesStocked').innerText = tubePacks;
  if (document.getElementById('dashShuttlesUsed')) document.getElementById('dashShuttlesUsed').innerText = currentCorkCount;
  if (document.getElementById('dashAvailableShuttles')) document.getElementById('dashAvailableShuttles').innerText = availableShuttles;

  const stockBox = document.getElementById('stockAlertBox');
  if (stockBox) stockBox.style.display = availableShuttles < 12 ? 'block' : 'none';
}

function payViaWallet() {
  if (!currentUser) return;
  const levelMembers = playersList.filter(p => normalizeLevel(p.level) === normalizeLevel(currentUser.level) && p.coming !== false);
  const activeCount = levelMembers.length || 1;
  const singleShuttlePrice = (tubePacks * tubePriceBHD) / (tubePacks * 12);
  const shareCost = (currentCorkCount * singleShuttlePrice) / activeCount;

  if ((currentUser.wallet || 0) < shareCost) {
    alert(`⚠️ Insufficient Wallet Credit! Share is BHD ${shareCost.toFixed(3)}, balance is BHD ${(currentUser.wallet||0).toFixed(3)}. Deficit added to pending dues.`);
    currentUser.pendingDues = (currentUser.pendingDues || 0) + shareCost;
  } else {
    currentUser.wallet = (currentUser.wallet || 0) - shareCost;
  }

  currentUser.paidCurrent = true;
  if (!currentUser.logs) currentUser.logs = [];
  currentUser.logs.push({ date: new Date().toLocaleDateString('en-GB'), attended: true, amount: shareCost, method: "Wallet Credit" });

  savePlayersData();
  addAuditLog(currentUser.name, `Paid BHD ${shareCost.toFixed(3)} via Wallet Credit.`);

  const waMsg = `Hi Admin, ${currentUser.name} paid BHD ${shareCost.toFixed(3)} using Wallet Credit (${currentUser.level}). Remaining Balance: BHD ${currentUser.wallet.toFixed(3)}.`;
  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
  showSection('dashboard');
}
