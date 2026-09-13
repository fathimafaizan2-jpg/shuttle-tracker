
// ============================================
// auth.js - AUTHENTICATION SYSTEM
// ============================================

// ===== LOGIN HANDLER =====
export async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('errorMessage');
  
  try {
    errorDiv.textContent = '';
    
    // Get members from localStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    
    // Find member by email
    const member = members.find(m => m.email === email);
    
    if (!member) {
      throw new Error('Email not found. Please check your email or activate your account.');
    }
    
    // For testing: accept any password
    // In production, you would verify the password hash
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Login successful
    sessionStorage.setItem('authToken', `token_${member.uid}_${Date.now()}`);
    localStorage.setItem('currentMember', JSON.stringify(member));
    
    // Update app state
    if (window.appState) {
      window.appState.member = member;
    }
    
    // Log activity
    if (window.logActivity) {
      window.logActivity('LOGIN', `${member.fullName} logged in`);
    }
    
    // Show success message
    if (window.showToast) {
      window.showToast(`Welcome back, ${member.fullName}!`, 'success');
    }
    
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
    
    console.log('✅ Login successful:', member.fullName);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    errorDiv.textContent = error.message;
    if (window.showToast) {
      window.showToast(error.message, 'error');
    }
  }
}

// ===== ACTIVATE ACCOUNT HANDLER =====
export async function handleActivate(event) {
  event.preventDefault();
  
  const fullName = document.getElementById('actFullName').value;
  const phone = document.getElementById('actPhone').value;
  const newPass = document.getElementById('actNewPass').value;
  const confirmPass = document.getElementById('actConfirmPass').value;
  const errorDiv = document.getElementById('errorMessage');
  
  try {
    errorDiv.textContent = '';
    
    // Validate passwords match
    if (newPass !== confirmPass) {
      throw new Error('Passwords do not match');
    }
    
    if (newPass.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Get members from localStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    
    // Find member by name and phone
    const member = members.find(m => 
      m.fullName.toLowerCase() === fullName.toLowerCase() && 
      m.phone === phone
    );
    
    if (!member) {
      throw new Error('Member not found. Please check your name and phone number.');
    }
    
    if (member.status === 'ACTIVE') {
      throw new Error('This account is already activated. Please login instead.');
    }
    
    // Update member
    member.status = 'ACTIVE';
    member.password = newPass; // In production, hash this!
    member.activatedAt = new Date().toISOString();
    
    // Save updated members
    localStorage.setItem('members', JSON.stringify(members));
    
    // Log activity
    if (window.logActivity) {
      window.logActivity('ACCOUNT_ACTIVATION', `${member.fullName} activated their account`);
    }
    
    // Show success
    if (window.showToast) {
      window.showToast('Account activated successfully! Please login.', 'success');
    }
    
    // Switch to login tab
    if (window.switchLoginTab) {
      window.switchLoginTab('login');
    }
    
    // Clear form
    event.target.reset();
    
    console.log('✅ Account activated:', member.fullName);
    
  } catch (error) {
    console.error('❌ Activation error:', error);
    errorDiv.textContent = error.message;
    if (window.showToast) {
      window.showToast(error.message, 'error');
    }
  }
}

// ===== LOGOUT HANDLER =====
export function handleLogout() {
  if (!window.showConfirm('Are you sure you want to logout?')) return;
  
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('currentMember');
  
  if (window.appState) {
    window.appState.member = null;
  }
  
  document.getElementById('login').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  
  if (window.showToast) {
    window.showToast('Logged out successfully', 'success');
  }
  
  console.log('✅ Logout successful');
}

// ===== CHECK AUTHENTICATION =====
export function checkAuth() {
  const token = sessionStorage.getItem('authToken');
  const memberData = localStorage.getItem('currentMember');
  
  if (token && memberData) {
    try {
      const member = JSON.parse(memberData);
      if (window.appState) {
        window.appState.member = member;
      }
      return true;
    } catch (error) {
      console.error('Error parsing member data:', error);
      return false;
    }
  }
  
  return false;
}

// ===== INITIALIZE AUTH =====
export function initializeAuth() {
  // Check if already logged in
  if (checkAuth()) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    if (window.updateUserUI) {
      window.updateUserUI();
    }
  } else {
    document.getElementById('login').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
  
  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  
  console.log('✅ auth.js loaded successfully');
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  initializeAuth();
}

