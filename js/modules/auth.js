
// ============================================
// auth.js - AUTHENTICATION SYSTEM (FIXED)
// ============================================

// ===== CHECK AUTHENTICATION =====
export function checkAuth() {
  const token = sessionStorage.getItem('authToken');
  const memberData = sessionStorage.getItem('memberData');
  
  if (token && memberData) {
    try {
      const member = JSON.parse(memberData);
      window.appState = {
        ...window.appState,
        member: member,
        role: member.role,
        token: token,
        isAuthenticated: true,
        walletBalanceFils: member.walletBalanceFils || 0,
        sessionsAttended: member.sessionsAttended || 0,
        pendingAmount: member.pendingAmount || 0,
        arrears: member.arrears || 0
      };
      console.log('✅ Auth check passed:', member);
      return true;
    } catch (error) {
      console.error('❌ Error parsing member data:', error);
      return false;
    }
  }
  
  console.log('⚠️ No auth token found');
  return false;
}

// ===== HANDLE LOGIN =====
export async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value?.trim();
  const errorMsg = document.getElementById('errorMessage');

  console.log('🔐 Login attempt:', email);

  // Validation
  if (!email || !password) {
    errorMsg.textContent = '❌ Please enter email and password';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Signing in...';
    submitBtn.disabled = true;

    // Call API login
    console.log('📡 Calling API login...');
    const response = await window.api.login(email, password);

    console.log('📡 API response:', response);

    if (!response.success) {
      errorMsg.textContent = `❌ ${response.message || 'Login failed'}`;
      errorMsg.style.display = 'block';
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      console.error('❌ Login failed:', response.message);
      return;
    }

    // Store authentication data
    console.log('💾 Storing auth data...');
    sessionStorage.setItem('authToken', response.token);
    sessionStorage.setItem('memberData', JSON.stringify(response.member));

    // Update app state
    window.appState = {
      ...window.appState,
      member: response.member,
      role: response.member.role,
      token: response.token,
      isAuthenticated: true,
      walletBalanceFils: response.member.walletBalanceFils || 0,
      sessionsAttended: response.member.sessionsAttended || 0,
      pendingAmount: response.member.pendingAmount || 0,
      arrears: response.member.arrears || 0
    };

    console.log('✅ Login successful:', response.member);

    // Show success message
    errorMsg.style.background = '#d4edda';
    errorMsg.style.color = '#155724';
    errorMsg.style.border = '1px solid #c3e6cb';
    errorMsg.textContent = '✅ Login successful! Redirecting...';
    errorMsg.style.display = 'block';

    // Redirect to app
    setTimeout(() => {
      console.log('🔄 Switching to app view...');
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
      
      // Update UI
      window.updateUserUI();
      window.initializeRouter();
      
      // Reset form
      document.getElementById('loginForm').reset();
      errorMsg.textContent = '';
      errorMsg.style.background = '#f8d7da';
      errorMsg.style.color = '#721c24';
      errorMsg.style.border = '1px solid #f5c6cb';
      errorMsg.style.display = 'none';
      
      console.log('✅ App loaded successfully');
    }, 1000);

  } catch (error) {
    console.error('❌ Login error:', error);
    errorMsg.textContent = `❌ Login error: ${error.message}`;
    errorMsg.style.display = 'block';
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sign In';
    submitBtn.disabled = false;
  }
}

// ===== HANDLE ACCOUNT ACTIVATION =====
export async function handleActivate(event) {
  event.preventDefault();

  const fullName = document.getElementById('actFullName')?.value?.trim();
  const phone = document.getElementById('actPhone')?.value?.trim();
  const newPass = document.getElementById('actNewPass')?.value?.trim();
  const confirmPass = document.getElementById('actConfirmPass')?.value?.trim();
  const errorMsg = document.getElementById('errorMessage');

  console.log('📝 Activation attempt:', fullName);

  // Validation
  if (!fullName || !phone || !newPass || !confirmPass) {
    errorMsg.textContent = '❌ All fields are required';
    errorMsg.style.display = 'block';
    return;
  }

  if (newPass !== confirmPass) {
    errorMsg.textContent = '❌ Passwords do not match';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Activating...';
    submitBtn.disabled = true;

    // Call API
    console.log('📡 Calling API activate...');
    const response = await window.api.activateAccount({
      fullName: fullName,
      phone: phone,
      password: newPass
    });

    console.log('📡 API response:', response);

    if (!response.success) {
      errorMsg.textContent = `❌ ${response.message || 'Activation failed'}`;
      errorMsg.style.display = 'block';
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      console.error('❌ Activation failed:', response.message);
      return;
    }

    console.log('✅ Account activated:', response.member);

    // Show success message
    errorMsg.style.background = '#d4edda';
    errorMsg.style.color = '#155724';
    errorMsg.style.border = '1px solid #c3e6cb';
    errorMsg.textContent = '✅ Account activated! You can now login.';
    errorMsg.style.display = 'block';

    // Reset form and switch to login tab
    setTimeout(() => {
      document.getElementById('activateForm').reset();
      window.switchAuthTab('login');
      errorMsg.textContent = '';
      errorMsg.style.background = '#f8d7da';
      errorMsg.style.color = '#721c24';
      errorMsg.style.border = '1px solid #f5c6cb';
      errorMsg.style.display = 'none';
    }, 1500);

  } catch (error) {
    console.error('❌ Activation error:', error);
    errorMsg.textContent = `❌ Activation error: ${error.message}`;
    errorMsg.style.display = 'block';
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Activate Account';
    submitBtn.disabled = false;
  }
}

// ===== LOGOUT =====
export function logout() {
  if (confirm('Are you sure you want to logout?')) {
    console.log('🚪 Logging out...');
    
    // Clear session storage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('memberData');

    // Reset app state
    window.appState = {
      member: null,
      role: null,
      token: null,
      isAuthenticated: false,
      sessionsAttended: 0,
      pendingAmount: 0,
      arrears: 0,
      walletBalanceFils: 0,
      upcomingSession: null
    };

    // Show login page
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';

    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('activateForm').reset();
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('errorMessage').style.display = 'none';

    console.log('✅ Logged out successfully');
  }
}

// ===== UPDATE USER UI =====
window.updateUserUI = function() {
  console.log('🎨 Updating user UI...');
  
  const member = window.appState?.member;
  const role = window.appState?.role;
  
  if (!member) {
    console.warn('⚠️ No member data available');
    return;
  }

  // Update user name in header
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = member.fullName || 'User';
    console.log('✅ Updated user name:', member.fullName);
  }

  // Update role badge
  const roleEl = document.getElementById('userRole');
  if (roleEl) {
    const roleDisplay = role === 'LEVEL_ADMIN' ? 'Flight Admin' : role === 'SUPER_ADMIN' ? 'Super Admin' : 'Player';
    roleEl.textContent = roleDisplay;
    console.log('✅ Updated role:', roleDisplay);
  }

  // Show/hide navigation based on role
  updateNavigationVisibility(role);
};

// ===== UPDATE NAVIGATION VISIBILITY =====
function updateNavigationVisibility(role) {
  console.log('🔀 Updating navigation for role:', role);
  
  // Hide all nav sections first
  document.querySelectorAll('.nav-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show sections based on role
  const navSections = document.querySelectorAll('.nav-section');
  
  if (role === 'PLAYER') {
    if (navSections[0]) navSections[0].style.display = 'block';
    if (navSections[3]) navSections[3].style.display = 'block';
    console.log('✅ Showing PLAYER navigation');
  } else if (role === 'LEVEL_ADMIN') {
    if (navSections[0]) navSections[0].style.display = 'block';
    if (navSections[1]) navSections[1].style.display = 'block';
    if (navSections[3]) navSections[3].style.display = 'block';
    console.log('✅ Showing LEVEL_ADMIN navigation');
  } else if (role === 'SUPER_ADMIN') {
    navSections.forEach(section => {
      section.style.display = 'block';
    });
    console.log('✅ Showing SUPER_ADMIN navigation');
  }
}

console.log('✅ auth.js loaded successfully');

