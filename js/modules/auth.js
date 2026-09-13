
// ============================================
// auth.js - AUTHENTICATION & LOGIN SYSTEM
// ============================================

// ===== HANDLE LOGIN =====
export async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value?.trim();
  const errorDiv = document.getElementById('errorMessage');

  // Validation
  if (!email || !password) {
    if (errorDiv) errorDiv.textContent = '❌ Email and password are required';
    return;
  }

  if (!window.validateEmail(email)) {
    if (errorDiv) errorDiv.textContent = '❌ Invalid email format';
    return;
  }

  try {
    // Show loading state
    if (errorDiv) errorDiv.textContent = '⏳ Logging in...';

    // Simulate Firebase Auth (replace with real Firebase)
    const response = await window.api.login(email, password);

    if (!response || !response.success) {
      if (errorDiv) errorDiv.textContent = '❌ Invalid email or password';
      return;
    }

    // Get member details from API
    const memberResponse = await window.api.getMemberDetails();
    
    if (!memberResponse || !memberResponse.member) {
      if (errorDiv) errorDiv.textContent = '❌ Failed to retrieve member details';
      return;
    }

    const member = memberResponse.member;

    // Check if member is active
    if (!member.active) {
      if (errorDiv) errorDiv.textContent = '❌ Your account is not yet activated. Please use the "Activate Account" tab.';
      return;
    }

    // Normalize role
    const normalizedRole = window.normalizeRole(member.role);

    // Save to session
    sessionStorage.setItem('authToken', response.token);
    sessionStorage.setItem('memberData', JSON.stringify(member));
    sessionStorage.setItem('userRole', normalizedRole);

    // Update app state
    if (window.setState) {
      window.setState({
        member: member,
        role: normalizedRole,
        token: response.token,
        isAuthenticated: true
      });
    }

    // Log activity
    if (window.logActivity) {
      window.logActivity('LOGIN', `User ${email} logged in successfully`, 'SUCCESS');
    }

    // Hide login, show app
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Update UI
    if (window.updateUserUI) {
      window.updateUserUI();
    }

    // Initialize router and navigate to home
    if (window.initializeRouter) {
      window.initializeRouter();
    }

    if (window.navigateTo) {
      window.navigateTo('home');
    }

    console.log('✅ Login successful for:', email);

  } catch (error) {
    console.error('❌ Login error:', error);
    if (errorDiv) errorDiv.textContent = '❌ Login failed. Please try again.';
  }
}

// ===== HANDLE ACCOUNT ACTIVATION =====
export async function handleActivate(event) {
  event.preventDefault();

  const fullName = document.getElementById('actFullName')?.value?.trim();
  const phone = document.getElementById('actPhone')?.value?.trim();
  const newPass = document.getElementById('actNewPass')?.value?.trim();
  const confirmPass = document.getElementById('actConfirmPass')?.value?.trim();
  const errorDiv = document.getElementById('errorMessage');

  // Validation
  if (!fullName || !phone || !newPass || !confirmPass) {
    if (errorDiv) errorDiv.textContent = '❌ All fields are required';
    return;
  }

  if (!window.validatePhone(phone)) {
    if (errorDiv) errorDiv.textContent = '❌ Invalid phone number format';
    return;
  }

  if (!window.validatePassword(newPass)) {
    if (errorDiv) errorDiv.textContent = '❌ Password must be at least 6 characters';
    return;
  }

  if (newPass !== confirmPass) {
    if (errorDiv) errorDiv.textContent = '❌ Passwords do not match';
    return;
  }

  try {
    // Show loading state
    if (errorDiv) errorDiv.textContent = '⏳ Activating account...';

    // Call activation API
    const response = await window.api.activateAccount({
      fullName: fullName,
      phone: phone,
      password: newPass
    });

    if (!response || !response.success) {
      if (errorDiv) errorDiv.textContent = response?.message || '❌ Activation failed. Name and phone do not match our records.';
      return;
    }

    // Log activity
    if (window.logActivity) {
      window.logActivity('ACCOUNT_ACTIVATION', `Account activated for ${fullName}`, 'SUCCESS');
    }

    // Show success message
    if (errorDiv) {
      errorDiv.style.color = '#155724';
      errorDiv.style.background = '#d4edda';
      errorDiv.textContent = '✅ Account activated successfully! Please login with your new password.';
    }

    // Clear form
    document.getElementById('activateForm').reset();

    // Switch back to login tab after 2 seconds
    setTimeout(() => {
      window.switchLoginTab('login');
      if (errorDiv) {
        errorDiv.style.color = '#721c24';
        errorDiv.style.background = '#f8d7da';
        errorDiv.textContent = '';
      }
    }, 2000);

    console.log('✅ Account activated for:', fullName);

  } catch (error) {
    console.error('❌ Activation error:', error);
    if (errorDiv) errorDiv.textContent = '❌ Activation failed. Please try again.';
  }
}

// ===== CHECK AUTHENTICATION =====
export function checkAuth() {
  const token = sessionStorage.getItem('authToken');
  const memberData = sessionStorage.getItem('memberData');

  if (!token || !memberData) {
    return false;
  }

  try {
    const member = JSON.parse(memberData);
    if (window.setState) {
      window.setState({
        member: member,
        role: window.normalizeRole(member.role),
        token: token,
        isAuthenticated: true
      });
    }
    return true;
  } catch (error) {
    console.error('❌ Auth check error:', error);
    return false;
  }
}

// ===== LOGOUT =====
export function logout() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('memberData');
  sessionStorage.removeItem('userRole');

  if (window.setState) {
    window.setState({
      member: null,
      role: null,
      token: null,
      isAuthenticated: false
    });
  }

  // Log activity
  if (window.logActivity) {
    window.logActivity('LOGOUT', 'User logged out', 'SUCCESS');
  }

  // Show login, hide app
  document.getElementById('login').style.display = 'flex';
  document.getElementById('app').style.display = 'none';

  // Clear forms
  document.getElementById('loginForm').reset();
  document.getElementById('activateForm').reset();

  console.log('✅ Logged out successfully');
}

console.log('✅ auth.js loaded successfully');

