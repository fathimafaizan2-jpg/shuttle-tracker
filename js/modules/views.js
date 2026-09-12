
  // PROFILE PAGE
  profile: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <!-- Profile Card -->
        <div class="profile-card" style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div class="profile-header" style="text-align: center; margin-bottom: 30px;">
            <div class="profile-avatar" style="font-size: 60px; margin-bottom: 15px;">
              <i class="fas fa-user-circle"></i>
            </div>
            <h2 style="margin: 0 0 8px 0;">John Player</h2>
            <p style="margin: 0 0 8px 0; color: #666;">player@club.com</p>
            <p class="profile-level" style="margin: 0;">Level: <strong>Intermediate</strong></p>
          </div>

          <div class="profile-details">
            <h3>Personal Information</h3>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Full Name:</span>
              <span class="detail-value">John Player</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Email:</span>
              <span class="detail-value">player@club.com</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Phone:</span>
              <span class="detail-value">+973 1234 5680</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Join Date:</span>
              <span class="detail-value">March 1, 2024</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Current Level:</span>
              <span class="detail-value">Intermediate</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0;">
              <span class="detail-label" style="font-weight: 600;">Membership Status:</span>
              <span class="detail-value"><span class="badge badge-success">Active</span></span>
            </div>
          </div>

          <div class="profile-actions" style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="btn btn-primary" onclick="appController.showNotification('Edit profile feature coming soon!', 'info')" style="flex: 1;">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Password changed successfully!', 'success')" style="flex: 1;">
              <i class="fas fa-lock"></i> Change Password
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// ✅ MAKE IT GLOBAL - BINDING
window.views = views;
console.log('✅ views.js loaded successfully');

