
// ============================================
// auth.js - SIMPLE AUTHENTICATION
// ============================================

export function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  console.log('Login attempt:', email);
  
  // Create test member
  const testMember = {
    uid: 'test_' + Date.now(),
    email: email,
    fullName: email.split('@')[0].toUpperCase(),
    phone: '+973-3366-1234',
    role: 'PLAYER',
    flightId: 'badminton_premier',
    flightName: 'Badminton - Premier',
    status: 'ACTIVE',
    walletBalanceFils: 0
  };
  
  // Save to session
  sessionStorage.setItem('authToken', 'token_' + Date.now());
  localStorage.setItem('currentMember', JSON.stringify(testMember));
  
  // Update app state
  window.appState.member = testMember;
  
  // Hide login, show app
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  
  // Update UI
  if (window.updateUserUI) {
    window.updateUserUI();
  }
  
  // Navigate to home
  if (window.navigateTo) {
    window.navigateTo('home');
  }
  
  console.log('✅ Login successful');
}

export function handleActivate(event) {
  event.preventDefault();
  
  const fullName = document.getElementById('actFullName').value;
  const phone = document.getElementById('actPhone').value;
  
  // Create member
  const member = {
    uid: 'user_' + Date.now(),
    email: fullName.toLowerCase().replace(' ', '') + '@club.com',
    fullName: fullName,
    phone: phone,
    role: 'PLAYER',
    flightId: 'badminton_premier',
    flightName: 'Badminton - Premier',
    status: 'ACTIVE',
    walletBalanceFils: 0
  };
  
  // Save
  sessionStorage.setItem('authToken', 'token_' + Date.now());
  localStorage.setItem('currentMember', JSON.stringify(member));
  
  // Update app state
  window.appState.member = member;
  
  // Hide login, show app
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  
  // Update UI
  if (window.updateUserUI) {
    window.updateUserUI();
  }
  
  // Navigate to home
  if (window.navigateTo) {
    window.navigateTo('home');
  }
  
  if (window.showToast) {
    window.showToast('Account activated! Welcome!', 'success');
  }
  
  console.log('✅ Account activated');
}

export function handleLogout() {
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('currentMember');
  window.appState.member = null;
  
  document.getElementById('login').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  
  if (window.showToast) {
    window.showToast('Logged out', 'success');
  }
}

console.log('✅ auth.js loaded successfully');

