// SUPER ADMIN & LEVEL ADMIN INTERACTIVE LOGIC
function renderAdminDashboard() {
  if (!isAdmin) return;
  const container = document.getElementById('adminFilteredPlayerList');
  if (!container) return;
  container.innerHTML = '';

  const filtered = playersList.filter(p => normalizeLevel(p.level) === normalizeLevel(adminLevel));

  if (filtered.length === 0) {
    container.innerHTML = `<small style="color:#64748b;">No members registered under ${adminLevel}.</small>`;
    return;
  }

  filtered.forEach((p) => {
    const waUrl = `https://wa.me/${p.phone}?text=Hi%20${encodeURIComponent(p.name)},%20your%20ShuttleTracker%20wallet%20has%20been%20updated.%20Current%20Balance:%20BHD%20${(p.wallet||0).toFixed(3)}.`;
    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'M';

    container.innerHTML += `
      <div class="attendee-item">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="member-avatar">${initial}</div>
          <div>
            <strong>${p.name}</strong> <small style="color:#64748b;">(${p.memberId||'No ID'})</small><br>
            <small style="color:#64748b;">Balance: BHD ${(p.wallet||0).toFixed(3)} | Dues: BHD ${(p.pendingDues||0).toFixed(3)}</small>
          </div>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <a href="${waUrl}" target="_blank" class="wa-sq-btn" title="Notify Member">💬</a>
          <button onclick="quickTopUpPrompt('${p.id}')" class="btn-primary" style="padding:6px 10px; font-size:11px;">+ Credit</button>
        </div>
      </div>`;
  });
}

function addPlayerByAdmin() {
  if (!isAdmin) return;
  const memberId = document.getElementById('newMemberID').value.trim();
  const name = document.getElementById('newPlayerName').value.trim();
  const phone = document.getElementById('newPlayerPhone').value.trim();
  const password = document.getElementById('newPlayerPassword').value.trim();

  if (!memberId || !name || !password) {
    alert("Please fill in Member ID, Name, and Temporary Password!");
    return;
  }

  let duplicate = playersList.find(p => p.memberId === memberId || p.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    alert(`⚠️ Error: Player with Member ID [${memberId}] or Name [${name}] already exists!`);
    return;
  }

  playersList.push({
    id: `p_${Date.now()}`,
    name, memberId, phone, password,
    level: adminLevel, coming: true, wallet: 0.000, locked: false, pendingDues: 0.000, logs: []
  });

  savePlayersData();
  renderAdminDashboard();
  addAuditLog(currentAdminObj ? currentAdminObj.name : "Admin", `Pre-registered new player ${name} (${memberId}).`);
  alert(`Registered ${name} (${memberId}) under ${adminLevel}!`);
}

function assignAdminBySuper() {
  if (!isSuperAdmin) return;
  const adminId = document.getElementById('superAdminID').value.trim();
  const name = document.getElementById('superAdminName').value.trim();
  const password = document.getElementById('superAdminPass').value.trim();
  const level = document.getElementById('superSelectLevel').value;

  if (adminId && name && password) {
    adminAccounts.push({ adminId, name, password, level });
    localStorage.setItem('shuttle_admin_accounts', JSON.stringify(adminAccounts));
    addAuditLog("Super Admin", `Assigned Level Admin ${name} (${adminId}) to ${level}.`);
    alert(`Assigned Level Admin ${name} (${adminId}) to ${level}!`);
  } else {
    alert("Please fill in Admin ID, Name, and Password!");
  }
}

function saveSponsorAd() {
  if (!isSuperAdmin) return;
  const title = document.getElementById('superAdTitle').value.trim();
  const fileInput = document.getElementById('superAdImage');

  if (title && document.getElementById('adTitleDisplay')) {
    document.getElementById('adTitleDisplay').innerText = title;
  }

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = document.getElementById('adImageWrapper');
      if (wrapper) wrapper.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:12px; margin-top:8px;">`;
    };
    reader.readAsDataURL(fileInput.files[0]);
  }

  addAuditLog("Super Admin", "Published new global sponsor banner & announcement.");
  alert("Global Sponsor Banner & Announcement updated across all levels!");
}

function quickTopUpPrompt(id) {
  const member = playersList.find(p => p.id === id);
  if (member) {
    const amtStr = prompt(`Add Wallet Credit for ${member.name} (BHD):`, "1.000");
    const amt = parseFloat(amtStr);
    if (!isNaN(amt) && amt > 0) {
      member.wallet = (member.wallet || 0) + amt;
      savePlayersData();
      renderAdminDashboard();
      addAuditLog(currentAdminObj ? currentAdminObj.name : "Admin", `Added BHD ${amt.toFixed(3)} wallet credit for ${member.name}.`);
    }
  }
}
