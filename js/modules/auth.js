// AUTHENTICATION AND ROLE CONTROLLER
function switchAuthTab(tab) {
  document.getElementById('authPlayerForm').style.display = tab === 'player' ? 'block' : 'none';
  document.getElementById('authAdminForm').style.display = tab === 'admin' ? 'block' : 'none';
  document.getElementById('authSuperForm').style.display = tab === 'super' ? 'block' : 'none';

  document.getElementById('authTabPlayer').classList.toggle('active', tab === 'player');
  document.getElementById('authTabAdmin').classList.toggle('active', tab === 'admin');
  document.getElementById('authTabSuper').classList.toggle('active', tab === 'super');
}

function togglePasswordVisibility(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (input.type === "password") {
    input.type = "text";
    btn.innerText = "🙈";
  } else {
    input.type = "password";
    btn.innerText = "👁️";
  }
}

function loginPlayer() {
  const memberId = document.getElementById('loginMemberID').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!memberId || !password) {
    alert("Please enter your Member ID and Password!");
    return;
  }

  let existing = playersList.find(p => p.memberId === memberId);
  if (existing) {
    if (existing.password && existing.password !== password) {
      alert("Incorrect Password!");
      return;
    }
    currentUser = existing;
    savePlayersData();
    localStorage.setItem('shuttle_user', JSON.stringify(currentUser));
    addAuditLog(currentUser.name, "Player logged in.");
    checkUserSession();
  } else {
    alert("Member ID not found! Please ask your Level Admin to pre-register your account.");
  }
}

function loginAdmin() {
  const adminId = document.getElementById('adminAuthID').value.trim();
  const password = document.getElementById('adminAuthPass').value.trim();

  if (!adminId || !password) {
    alert("Please enter Admin ID and Password!");
    return;
  }

  let found = adminAccounts.find(a => a.adminId === adminId);
  if (found) {
    if (found.password !== password) {
      alert("Incorrect Admin Password!");
      return;
    }
    currentAdminObj = found;
    adminLevel = found.level;
    isAdmin = true;
    isSuperAdmin = false;
    addAuditLog(currentAdminObj.name, `Level Admin logged in for ${adminLevel}.`);
    activateAdminMode();
  } else {
    alert("Admin ID not found!");
  }
}

function loginSuperAdmin() {
  const superId = document.getElementById('superAuthID').value.trim();
  const superPass = document.getElementById('superAuthPass').value.trim();

  if (superId === "SUPER-ADMIN" && superPass === "123456") {
    isAdmin = true;
    isSuperAdmin = true;
    adminLevel = document.getElementById('superLoginInitialLevel').value;
    addAuditLog("Super Admin", `Master Super Admin logged in (Initial Level: ${adminLevel}).`);
    activateAdminMode();
    document.getElementById('superLevelSwitcher').style.display = 'inline-block';
    document.querySelectorAll('.is-super-only').forEach(e => e.style.display = 'block');
  } else {
    alert("Incorrect Super Admin Credentials!");
  }
}

function activateAdminMode() {
  document.querySelectorAll('.admin-only-tab').forEach(e => e.style.display = 'flex');
  document.querySelectorAll('.admin-only-inline').forEach(e => e.style.display = 'inline-block');
  document.querySelectorAll('.adminLevelLabel').forEach(e => e.innerText = adminLevel);
  
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('userDrawerBadge').innerText = isSuperAdmin ? 'Super Admin' : `Admin (${adminLevel})`;

  renderAttendees();
  renderAdminDashboard();
  renderCoAdmins();
  renderAuditLogs();
  showSection('dashboard');
}

function checkUserSession() {
  if (!currentUser && !isAdmin) {
    document.getElementById('auth-screen').style.display = 'flex';
  } else {
    document.getElementById('auth-screen').style.display = 'none';
    if (currentUser) {
      document.getElementById('playerCurrentLevelDisplay').innerText = currentUser.level;
      document.getElementById('userDrawerBadge').innerText = `${currentUser.name} (${currentUser.memberId})`;

      const wallet = currentUser.wallet || 0;
      document.getElementById('userWalletDisplay').innerText = `BHD ${wallet.toFixed(3)}`;
    }

    renderTimetableCarousel();
    renderAttendees();
    recalculateSplit();
    renderPersonalLogs();
  }
}

function switchUserAccount() {
  toggleSideDrawer(false);
  localStorage.removeItem('shuttle_user');
  currentUser = null;
  isAdmin = false;
  isSuperAdmin = false;
  adminLevel = null;
  currentAdminObj = null;
  document.getElementById('superLevelSwitcher').style.display = 'none';
  document.querySelectorAll('.admin-only-tab').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.admin-only-inline').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.is-super-only').forEach(e => e.style.display = 'none');
  checkUserSession();
}
