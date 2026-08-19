// MODULE A: ROLE-BASED ACCESS CONTROL (RBAC) & SESSION ENGINE
let currentUser = JSON.parse(localStorage.getItem('shuttle_user')) || null;
let isAdmin = false;
let isSuperAdmin = false;
let currentAdminObj = null;
let activeFlightLevel = "Level 4A";

// Default System Account Pre-sets
let adminAccounts = JSON.parse(localStorage.getItem('shuttle_admin_accounts')) || [
  { adminId: "ADM-4A", name: "Admin Level 4A", password: "123", level: "Level 4A" }
];

function switchAuthTab(tab) {
  document.getElementById('authPlayerForm').style.display = tab === 'player' ? 'block' : 'none';
  document.getElementById('authAdminForm').style.display = tab === 'admin' ? 'block' : 'none';
  document.getElementById('authSuperForm').style.display = tab === 'super' ? 'block' : 'none';

  document.getElementById('authTabPlayer').classList.toggle('active', tab === 'player');
  document.getElementById('authTabAdmin').classList.toggle('active', tab === 'admin');
  document.getElementById('authTabSuper').classList.toggle('active', tab === 'super');
}

function loginPlayer() {
  const memberId = document.getElementById('loginMemberID').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!memberId || !password) {
    alert("Please enter Member ID and Password!");
    return;
  }

  let existing = playersList.find(p => p.memberId === memberId);

  if (existing && existing.password === password) {
    currentUser = existing;
    localStorage.setItem('shuttle_user', JSON.stringify(currentUser));
    checkUserSession();
  } else {
    alert("Invalid Credentials or Account Not Pre-registered!");
  }
}

function loginAdmin() {
  const adminId = document.getElementById('adminAuthID').value.trim();
  const password = document.getElementById('adminAuthPass').value.trim();

  let found = adminAccounts.find(a => a.adminId === adminId && a.password === password);

  if (found) {
    currentAdminObj = found;
    activeFlightLevel = found.level;
    isAdmin = true;
    isSuperAdmin = false;
    activateAdminMode();
  } else {
    alert("Invalid Admin ID or Password!");
  }
}

function loginSuperAdmin() {
  const superId = document.getElementById('superAuthID').value.trim();
  const superPass = document.getElementById('superAuthPass').value.trim();

  if (superId === "SUPER-ADMIN" && superPass === "123456") {
    isAdmin = true;
    isSuperAdmin = true;
    activeFlightLevel = document.getElementById('superLoginInitialLevel').value;
    activateAdminMode();
    document.getElementById('superLevelSwitcher').style.display = 'inline-block';
  } else {
    alert("Incorrect Super Admin Credentials!");
  }
}

function activateAdminMode() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('userDrawerBadge').innerText = isSuperAdmin ? 'Super Admin' : `Admin (${activeFlightLevel})`;
  document.querySelectorAll('.admin-only-tab').forEach(e => e.style.display = 'flex');
  showSection('dashboard');
  if (window.renderLevelRoster) renderLevelRoster();
}

function checkUserSession() {
  if (!currentUser && !isAdmin) {
    document.getElementById('auth-screen').style.display = 'flex';
  } else {
    document.getElementById('auth-screen').style.display = 'none';
    if (currentUser) {
      document.getElementById('userDrawerBadge').innerText = `${currentUser.name} (${currentUser.memberId})`;
    }
  }
}

function logout() {
  localStorage.removeItem('shuttle_user');
  currentUser = null;
  isAdmin = false;
  isSuperAdmin = false;
  location.reload();
}
