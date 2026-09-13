
// ============================================
// auth.js - AUTHENTICATION & SESSION MANAGEMENT
// ============================================

// ===== LOGIN HANDLER =====
window.handleLogin = async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  const role = document.getElementById('loginRole')?.value;
  const errorEl = document.getElementById('errorMessage');
  
  try {
    if (!email || !password) {
      throw new Error('Please enter email and password');
    }
    
    setLoading(true);
    
    // Call API
    const result = await window.api.login(email, password);
    
    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }
    
    // Store session
    const token = result.token;
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userRole', result.member.role);
    sessionStorage.setItem('userEmail', result.member.email);
    
    // Update state
    setState({
      member: result.member,
      authToken: token
    });
    
    logActivity('LOGIN', `User logged in as ${result.member.role}`);
    
    // Hide login, show app
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Update UI
    updateUserUI();
    
    // Navigate to home
    setTimeout(() => {
      navigateTo('home');
    }, 100);
    
    showToast('Login successful!', 'success');
    
  } catch (error) {
    if (errorEl) errorEl.textContent = error.message;
    showToast(error.message, 'error');
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
};

// ===== ACTIVATE ACCOUNT HANDLER =====
window.handleActivate = async function(event) {
  event.preventDefault();
  
  const fullName = document.getElementById('actFullName')?.value;
  const phone = document.getElementById('actPhone')?.value;
  const newPass = document.getElementById('actNewPass')?.value;
  const confirmPass = document.getElementById('actConfirmPass')?.value;
  const errorEl = document.getElementById('errorMessage');
  
  try {
    if (!fullName || !phone || !newPass || !confirmPass) {
      throw new Error('Please fill all fields');
    }
    
    if (newPass.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (newPass !== confirmPass) {
      throw new Error('Passwords do not match');
    }
    
    setLoading(true);
    
    // Call API
    const result = await window.api.activateAccount(fullName, phone, newPass);
    
    if (!result.success) {
      throw new Error(result.error || 'Activation failed');
    }
    
    showToast('Account activated! Please login.', 'success');
    
    // Switch to login tab
    document.getElementById('loginTab').click();
    event.target.reset();
    
  } catch (error) {
    if (errorEl) errorEl.textContent = error.message;
    showToast(error.message, 'error');
    console.error('Activation error:', error);
  } finally {
    setLoading(false);
  }
};

// ===== LOGOUT HANDLER =====
window.handleLogout = function() {
  if (!showConfirm('Are you sure you want to logout?')) {
    return;
  }
  
  try {
    const email = window.appState.member?.email;
    
    logActivity('LOGOUT', `User logged out`);
    
    // Clear session
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    
    // Clear state
    setState({
      member: null,
      authToken: null,
      page: 'home'
    });
    
    // Reset UI
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    
    // Clear forms
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('errorMessage').textContent = '';
    
    showToast('Logged out successfully', 'success');
    
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Logout failed', 'error');
  }
};

// ===== UPDATE USER UI =====
window.updateUserUI = function() {
  const member = window.appState.member;
  
  if (!member) return;
  
  // Update header
  const memberNameEl = document.getElementById('memberName');
  const roleEl = document.getElementById('roleLabel');
  const sideRoleEl = document.getElementById('sideRole');
  
  if (memberNameEl) memberNameEl.textContent = member.fullName;
  if (roleEl) roleEl.textContent = member.role;
  if (sideRoleEl) sideRoleEl.textContent = member.flightName || 'All activities';
  
  // Update navigation visibility
  updateNavigation();
};

// ===== UPDATE NAVIGATION =====
window.updateNavigation = function() {
  const role = normalizeRole(window.appState.member?.role);
  
  // Hide all role-specific items
  document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.super-nav').forEach(el => el.classList.add('hidden'));
  
  // Show based on role
  if (role === 'LEVEL_ADMIN') {
    document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.remove('hidden'));
  }
  if (role === 'SUPER_ADMIN') {
    document.querySelectorAll('.super-nav').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.remove('hidden'));
  }
};

// ===== CHECK SESSION ON PAGE LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('authToken');
  const role = sessionStorage.getItem('userRole');
  const email = sessionStorage.getItem('userEmail');
  
  if (token && role && email) {
    // Restore session
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const member = members.find(m => m.email === email);
    
    if (member) {
      setState({
        member: {
          uid: member.uid,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          role: normalizeRole(member.role),
          flightId: member.flightId,
          flightName: member.flightName,
          walletBalanceFils: member.walletBalanceFils || 0,
          status: member.status
        },
        authToken: token
      });
      
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      
      updateUserUI();
      navigateTo('home');
    }
  }
});

// ===== LANGUAGE SWITCHER =====
window.switchLanguage = function(lang) {
  setState({ language: lang });
  localStorage.setItem('indian_club_language', lang);
  showToast(`Language switched to ${lang.toUpperCase()}`, 'info');
  // TODO: Implement actual language switching
};

console.log('✅ auth.js loaded successfully');

