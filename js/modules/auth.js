
// ============================================
// auth.js - Authentication Module
// ============================================

export const auth = {
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    const loginDiv = document.getElementById('login');
    const appDiv = document.getElementById('app');

    if (!token) {
      if (loginDiv) loginDiv.style.display = 'block';
      if (appDiv) appDiv.style.display = 'none';
      auth.setupLoginForm();
    } else {
      if (loginDiv) loginDiv.style.display = 'none';
      if (appDiv) appDiv.style.display = 'block';
    }
  },

  setupLoginForm: () => {
    const loginDiv = document.getElementById('login');
    if (!loginDiv) return;

    loginDiv.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
        <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 400px;">
          <h1 style="text-align: center; color: #667eea; margin-bottom: 30px;">Indian Club Bahrain</h1>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label>
            <input type="email" id="email" placeholder="Enter your email" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Password</label>
            <input type="password" id="password" placeholder="Enter your password" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Role</label>
            <select id="role" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px; box-sizing: border-box;">
              <option value="player">Player</option>
              <option value="flightadmin">Flight Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <button onclick="auth.login()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Login</button>
        </div>
      </div>
    `;
  },

  login: () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!email || !password) {
      appController.showNotification('Please enter email and password', 'error');
      return;
    }

    localStorage.setItem('authToken', 'token_' + Date.now());
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);

    appController.showNotification(`Welcome ${email}!`, 'success');

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

console.log('✅ auth.js loaded successfully');
