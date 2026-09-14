
// ============================================
// adminViews.js - SUPER ADMIN ADS & NOTICES
// ============================================

export const adminViews = {
  // ===== ADS & NOTICES TAB =====
  ads: async function() {
    console.log('📄 Rendering: Super Admin - Ads & Notices');

    const html = `
      <div class="page-header">
        <h1>📢 Ads & Notices Management</h1>
        <p>Manage business advertisements, club announcements, and carousel settings</p>
      </div>

      <!-- Level Dropdown -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Filter by Level</h2>
          <select id="adLevelFilter" onchange="window.filterAdsByLevel(this.value)" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
            <option value="">All Levels</option>
            <option value="Premier">Premier</option>
            <option value="Flight 1">Flight 1</option>
            <option value="Flight 2">Flight 2</option>
            <option value="Flight 3">Flight 3</option>
            <option value="Flight 4">Flight 4</option>
            <option value="Flight 4A">Flight 4A</option>
            <option value="Flight 4B">Flight 4B</option>
          </select>
        </div>
      </div>

      <!-- Carousel Settings -->
      <div class="card">
        <h2>⚙️ Carousel Settings</h2>
        <div class="form-group">
          <label>Maximum Featured Ads (Carousel Limit)</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" id="carouselLimit" min="1" max="20" value="10" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            <button onclick="window.setCarouselLimit()" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Save Limit</button>
            <span style="font-size: 12px; color: #999;">Current: 10/10 ads</span>
          </div>
        </div>
      </div>

      <!-- Pending Ads for Approval -->
      <div class="card">
        <h2>⏳ Pending Ads for Approval</h2>
        <div id="pendingAdsContainer">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ad ID</th>
                <th>Business Name</th>
                <th>Contact</th>
                <th>Description</th>
                <th>Flyer</th>
                <th>Submitted</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="pendingAdsList">
              <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #999;">Loading pending ads...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Updates for Approval -->
      <div class="card">
        <h2>🔄 Pending Ad Updates</h2>
        <div id="pendingUpdatesContainer">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ad ID</th>
                <th>Business Name</th>
                <th>Updated Description</th>
                <th>New Flyer</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="pendingUpdatesList">
              <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #999;">Loading pending updates...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Active Ads -->
      <div class="card">
        <h2>✅ Active Ads</h2>
        <div id="activeAdsContainer">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ad ID</th>
                <th>Business Name</th>
                <th>Status</th>
                <th>Carousel End</th>
                <th>Directory End</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="activeAdsList">
              <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #999;">Loading active ads...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upload Notice Image -->
      <div class="card">
        <h2>📸 Upload Club Announcement Image</h2>
        <form onsubmit="window.handleUploadNotice(event)">
          <div class="form-group">
            <label>Announcement Title *</label>
            <input type="text" id="noticeTitle" placeholder="e.g., Grand Opening, Special Event" required>
          </div>

          <div class="form-group">
            <label>Announcement Description *</label>
            <textarea id="noticeDescription" placeholder="Describe the announcement..." required style="min-height: 80px;"></textarea>
          </div>

          <div class="form-group">
            <label>Upload Image (PNG, JPEG, WebP - Max 2MB) *</label>
            <div style="border: 2px dashed #ddd; padding: 20px; border-radius: 6px; text-align: center; cursor: pointer;" onclick="document.getElementById('noticeImage').click()">
              <input type="file" id="noticeImage" accept="image/png,image/jpeg,image/webp" style="display: none;" required onchange="window.updateNoticeFileName()">
              <p style="margin: 0; color: #666; font-size: 13px;">📁 Click to upload or drag & drop</p>
              <p id="noticeImageName" style="margin: 5px 0 0 0; color: #667eea; font-size: 12px; font-weight: 600;"></p>
            </div>
          </div>

          <button type="submit" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%;">Upload Announcement</button>
        </form>
      </div>

      <!-- Approval Modal (Hidden) -->
      <div id="approvalModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
          <h2 id="modalTitle" style="margin-bottom: 15px;">Approve Advertisement</h2>
          
          <div class="form-group">
            <label>Ad Duration (Days) *</label>
            <select id="adDuration" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
              <option value="">Select duration...</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          <div class="form-group">
            <label>Rejection Reason (if rejecting)</label>
            <textarea id="rejectionReason" placeholder="Explain why you're rejecting this ad..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px;"></textarea>
          </div>

          <div style="display: flex; gap: 10px;">
            <button onclick="window.approveAdAction()" style="flex: 1; padding: 10px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">✅ Approve</button>
            <button onclick="window.rejectAdAction()" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">❌ Reject</button>
            <button onclick="window.closeApprovalModal()" style="flex: 1; padding: 10px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // Load pending ads
    setTimeout(async () => {
      const pendingAds = await window.ads.getPendingAds();
      if (pendingAds.success) {
        let adHTML = '';
        pendingAds.ads.forEach(ad => {
          adHTML += `
            <tr>
              <td><strong>${ad.adId}</strong></td>
              <td>${ad.businessName}</td>
              <td>${ad.email}<br>${ad.phone}</td>
              <td>${ad.description}</td>
              <td><a href="${ad.flyerUrl}" target="_blank" style="color: #667eea; text-decoration: none;">View</a></td>
              <td>${ad.createdAt}</td>
              <td><input type="number" id="duration_${ad.adId}" min="7" max="90" value="30" style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;"></td>
              <td>
                <button onclick="window.openApprovalModal('${ad.adId}', 'approve')" style="padding: 5px 10px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 5px;">Approve</button>
                <button onclick="window.openApprovalModal('${ad.adId}', 'reject')" style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Reject</button>
              </td>
            </tr>
          `;
        });
        document.getElementById('pendingAdsList').innerHTML = adHTML || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">No pending ads</td></tr>';
      }
    }, 100);

    // Load pending updates
    setTimeout(async () => {
      const pendingUpdates = await window.ads.getPendingUpdates();
      if (pendingUpdates.success) {
        let updateHTML = '';
        pendingUpdates.updates.forEach(update => {
          updateHTML += `
            <tr>
              <td><strong>${update.adId}</strong></td>
              <td>${update.businessName}</td>
              <td>${update.description}</td>
              <td><a href="${update.flyerUrl}" target="_blank" style="color: #667eea; text-decoration: none;">View</a></td>
              <td>${update.updatedAt}</td>
              <td>
                <button onclick="window.approveAdUpdate('${update.adId}')" style="padding: 5px 10px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Approve Update</button>
              </td>
            </tr>
          `;
        });
        document.getElementById('pendingUpdatesList').innerHTML = updateHTML || '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No pending updates</td></tr>';
      }
    }, 100);

    // Load active ads
    setTimeout(async () => {
      const activeAds = await window.ads.getActiveAds('all');
      if (activeAds.success) {
        let adHTML = '';
        activeAds.ads.forEach(ad => {
          adHTML += `
            <tr>
              <td><strong>${ad.adId}</strong></td>
              <td>${ad.businessName}</td>
              <td><span class="badge badge-success">Active</span></td>
              <td>${ad.carouselEndDate}</td>
              <td>${ad.directoryEndDate}</td>
              <td>${Math.ceil((new Date(ad.directoryEndDate) - new Date()) / (1000 * 60 * 60 * 24))} days</td>
              <td>
                <button onclick="window.removeAd('${ad.adId}')" style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Remove</button>
              </td>
            </tr>
          `;
        });
        document.getElementById('activeAdsList').innerHTML = adHTML || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No active ads</td></tr>';
      }
    }, 100);

    return html;
  }
};

// ===== GLOBAL FUNCTIONS FOR AD MANAGEMENT =====

window.filterAdsByLevel = function(level) {
  console.log('🔍 Filtering ads by level:', level);
  // In real app, filter ads by level
};

window.setCarouselLimit = async function() {
  const limit = document.getElementById('carouselLimit').value;
  if (!limit || limit < 1 || limit > 20) {
    window.showNotification('❌ Carousel limit must be between 1 and 20', 'error');
    return;
  }

  const result = await window.ads.setCarouselLimit(parseInt(limit));
  if (result.success) {
    window.showNotification('✅ ' + result.message, 'success');
  } else {
    window.showNotification('❌ ' + result.message, 'error');
  }
};

window.openApprovalModal = function(adId, action) {
  console.log('📋 Opening approval modal for:', adId, action);
  window.currentAdId = adId;
  window.currentAdAction = action;
  
  const modal = document.getElementById('approvalModal');
  const title = document.getElementById('modalTitle');
  
  if (action === 'approve') {
    title.textContent = 'Approve Advertisement';
    document.getElementById('adDuration').style.display = 'block';
    document.getElementById('rejectionReason').style.display = 'none';
  } else {
    title.textContent = 'Reject Advertisement';
    document.getElementById('adDuration').style.display = 'none';
    document.getElementById('rejectionReason').style.display = 'block';
  }
  
  modal.style.display = 'flex';
};

window.closeApprovalModal = function() {
  document.getElementById('approvalModal').style.display = 'none';
  window.currentAdId = null;
  window.currentAdAction = null;
};

window.approveAdAction = async function() {
  const adId = window.currentAdId;
  const duration = document.getElementById('adDuration').value;

  if (!duration) {
    window.showNotification('❌ Please select a duration', 'error');
    return;
  }

  const result = await window.ads.approveAd(adId, parseInt(duration));
  if (result.success) {
    window.showNotification('✅ Ad approved for ' + duration + ' days', 'success');
    window.closeApprovalModal();
    // Reload ads
    window.navigateTo('ads');
  } else {
    window.showNotification('❌ ' + result.message, 'error');
  }
};

window.rejectAdAction = async function() {
  const adId = window.currentAdId;
  const reason = document.getElementById('rejectionReason').value;

  if (!reason) {
    window.showNotification('❌ Please provide a rejection reason', 'error');
    return;
  }

  const result = await window.ads.rejectAd(adId, reason);
  if (result.success) {
    window.showNotification('✅ Ad rejected', 'success');
    window.closeApprovalModal();
    // Reload ads
    window.navigateTo('ads');
  } else {
    window.showNotification('❌ ' + result.message, 'error');
  }
};

window.approveAdUpdate = async function(adId) {
  const result = await window.ads.approveAdUpdate(adId);
  if (result.success) {
    window.showNotification('✅ Ad update approved and published', 'success');
    // Reload ads
    window.navigateTo('ads');
  } else {
    window.showNotification('❌ ' + result.message, 'error');
  }
};

window.removeAd = function(adId) {
  if (confirm('Are you sure you want to remove this ad?')) {
    console.log('🗑️ Removing ad:', adId);
    window.showNotification('✅ Ad removed', 'success');
    // Reload ads
    window.navigateTo('ads');
  }
};

window.updateNoticeFileName = function() {
  const input = document.getElementById('noticeImage');
  const display = document.getElementById('noticeImageName');
  if (input.files && input.files[0]) {
    display.textContent = '✅ ' + input.files[0].name;
  }
};

window.handleUploadNotice = async function(event) {
  event.preventDefault();

  const title = document.getElementById('noticeTitle').value;
  const description = document.getElementById('noticeDescription').value;
  const file = document.getElementById('noticeImage').files[0];

  if (!file) {
    window.showNotification('❌ Please select an image', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);

  const result = await window.api.uploadNoticeImage(formData);
  if (result.success) {
    window.showNotification('✅ Notice image uploaded successfully', 'success');
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeDescription').value = '';
    document.getElementById('noticeImage').value = '';
    document.getElementById('noticeImageName').textContent = '';
  } else {
    window.showNotification('❌ ' + result.message, 'error');
  }
};

console.log('✅ adminViews.js - Ads & Notices loaded successfully');

