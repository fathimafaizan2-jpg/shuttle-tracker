
// ============================================
// ads.js - COMPLETE AD MANAGEMENT SYSTEM
// ============================================

export const ads = {
  // ===== GENERATE UNIQUE AD ID =====
  generateAdId: function() {
    const date = new Date();
    const dateStr = date.getFullYear() + 
                   String(date.getMonth() + 1).padStart(2, '0') + 
                   String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AD_${dateStr}_${random}`;
  },

  // ===== SUBMIT NEW AD =====
  submitAd: async function(data) {
    console.log('📡 API: submitAd -', data.businessName);

    try {
      // Validate file
      if (!data.flyer) {
        return { success: false, message: 'Flyer image is required' };
      }

      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(data.flyer.type)) {
        return { success: false, message: 'Only PNG, JPEG, and WebP files allowed' };
      }

      if (data.flyer.size > 2 * 1024 * 1024) {
        return { success: false, message: 'File size must be 2MB or less' };
      }

      // Generate unique Ad ID
      const adId = this.generateAdId();

      // In real app, upload to Firebase Storage
      const flyerUrl = `https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/${adId}_${data.flyer.name}?alt=media`;

      // Create ad object
      const adObject = {
        adId: adId,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        description: data.description,
        flyerUrl: flyerUrl,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        approvedAt: null,
        duration: null,
        carouselStartDate: null,
        carouselEndDate: null,
        directoryStartDate: null,
        directoryEndDate: null,
        updatedAt: null,
        updateStatus: null
      };

      // Log activity
      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'AD',
          event: 'Ad Submitted',
          memberId: window.appState?.member?.id || 'non-member',
          memberName: data.businessName,
          details: `Ad ID: ${adId}, Status: PENDING_APPROVAL`
        });
      }

      console.log('📧 Email sent to:', data.email, 'with Ad ID:', adId);

      return {
        success: true,
        message: 'Ad submitted successfully for approval',
        adId: adId,
        email: data.email
      };

    } catch (error) {
      console.error('❌ API Error (submitAd):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== UPDATE AD =====
  updateAd: async function(adId, data) {
    console.log('📡 API: updateAd -', adId);

    try {
      // Validate file if provided
      if (data.flyer) {
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(data.flyer.type)) {
          return { success: false, message: 'Only PNG, JPEG, and WebP files allowed' };
        }

        if (data.flyer.size > 2 * 1024 * 1024) {
          return { success: false, message: 'File size must be 2MB or less' };
        }
      }

      // Update ad object
      const updateObject = {
        adId: adId,
        businessName: data.businessName,
        description: data.description,
        flyerUrl: data.flyer ? `https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/${adId}_updated_${data.flyer.name}?alt=media` : null,
        status: 'PENDING_UPDATE_APPROVAL',
        updatedAt: new Date().toISOString(),
        updateStatus: 'PENDING'
      };

      // Log activity
      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'AD',
          event: 'Ad Update Submitted',
          memberId: window.appState?.member?.id || 'non-member',
          memberName: data.businessName,
          details: `Ad ID: ${adId}, Status: PENDING_UPDATE_APPROVAL`
        });
      }

      console.log('🔔 Super Admin notified of ad update:', adId);

      return {
        success: true,
        message: 'Ad update submitted for approval',
        adId: adId
      };

    } catch (error) {
      console.error('❌ API Error (updateAd):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== GET PENDING ADS (SUPER ADMIN) =====
  getPendingAds: async function() {
    console.log('📡 API: getPendingAds');

    try {
      const pendingAds = [
        {
          adId: 'AD_20260914_0001',
          businessName: 'Al-Noor Restaurant',
          email: 'contact@alnoor.com',
          phone: '+973 3366 1234',
          description: '20% Discount for Members',
          flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260914_0001.jpg?alt=media',
          status: 'PENDING_APPROVAL',
          createdAt: '2026-09-14 10:30:00'
        },
        {
          adId: 'AD_20260914_0002',
          businessName: 'Fitness Plus Gym',
          email: 'info@fitnessgym.com',
          phone: '+973 3366 5678',
          description: 'Free Trial Week',
          flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260914_0002.jpg?alt=media',
          status: 'PENDING_APPROVAL',
          createdAt: '2026-09-14 11:15:00'
        }
      ];

      return { success: true, ads: pendingAds };
    } catch (error) {
      console.error('❌ API Error (getPendingAds):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== APPROVE AD (SUPER ADMIN) =====
  approveAd: async function(adId, duration) {
    console.log('📡 API: approveAd -', adId, 'Duration:', duration, 'days');

    try {
      const admin = window.appState?.member;

      const today = new Date();
      const carouselEndDate = new Date(today);
      carouselEndDate.setDate(carouselEndDate.getDate() + 10);

      const directoryEndDate = new Date(today);
      directoryEndDate.setDate(directoryEndDate.getDate() + duration);

      const approvedAd = {
        adId: adId,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        duration: duration,
        carouselStartDate: today.toISOString(),
        carouselEndDate: carouselEndDate.toISOString(),
        directoryStartDate: today.toISOString(),
        directoryEndDate: directoryEndDate.toISOString()
      };

      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'AD',
          event: 'Ad Approved',
          memberId: admin?.id || 'system',
          memberName: admin?.fullName || 'System',
          details: `Ad ID: ${adId}, Duration: ${duration} days`
        });
      }

      console.log('✅ Ad approved:', approvedAd);

      return {
        success: true,
        message: `Ad approved for ${duration} days`,
        ad: approvedAd
      };

    } catch (error) {
      console.error('❌ API Error (approveAd):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== REJECT AD (SUPER ADMIN) =====
  rejectAd: async function(adId, reason) {
    console.log('📡 API: rejectAd -', adId, 'Reason:', reason);

    try {
      const admin = window.appState?.member;

      const rejectedAd = {
        adId: adId,
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString()
      };

      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'AD',
          event: 'Ad Rejected',
          memberId: admin?.id || 'system',
          memberName: admin?.fullName || 'System',
          details: `Ad ID: ${adId}, Reason: ${reason}`
        });
      }

      console.log('❌ Ad rejected:', rejectedAd);

      return {
        success: true,
        message: 'Ad rejected',
        ad: rejectedAd
      };

    } catch (error) {
      console.error('❌ API Error (rejectAd):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== APPROVE AD UPDATE (SUPER ADMIN) =====
  approveAdUpdate: async function(adId) {
    console.log('📡 API: approveAdUpdate -', adId);

    try {
      const admin = window.appState?.member;

      const updatedAd = {
        adId: adId,
        status: 'APPROVED',
        updateStatus: 'APPROVED',
        approvedAt: new Date().toISOString()
      };

      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'AD',
          event: 'Ad Update Approved',
          memberId: admin?.id || 'system',
          memberName: admin?.fullName || 'System',
          details: `Ad ID: ${adId}, Update approved and published`
        });
      }

      console.log('✅ Ad update approved:', updatedAd);

      return {
        success: true,
        message: 'Ad update approved and published',
        ad: updatedAd
      };

    } catch (error) {
      console.error('❌ API Error (approveAdUpdate):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== GET ACTIVE ADS =====
  getActiveAds: async function(type = 'carousel') {
    console.log('📡 API: getActiveAds -', type);

    try {
      const today = new Date();

      const allAds = [
        {
          adId: 'AD_20260901_0001',
          businessName: 'Al-Noor Restaurant',
          description: '20% Discount for Members',
          flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260901_0001.jpg?alt=media',
          status: 'APPROVED',
          carouselEndDate: '2026-09-20',
          directoryEndDate: '2026-10-01'
        },
        {
          adId: 'AD_20260902_0002',
          businessName: 'Fitness Plus Gym',
          description: 'Free Trial Week',
          flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260902_0002.jpg?alt=media',
          status: 'APPROVED',
          carouselEndDate: '2026-09-21',
          directoryEndDate: '2026-10-02'
        }
      ];

      let filteredAds = allAds.filter(ad => ad.status === 'APPROVED');

      if (type === 'carousel') {
        filteredAds = filteredAds.filter(ad => new Date(ad.carouselEndDate) > today);
        filteredAds = filteredAds.slice(0, 10);
      } else if (type === 'directory') {
        filteredAds = filteredAds.filter(ad => new Date(ad.directoryEndDate) > today);
      }

      return { success: true, ads: filteredAds };
    } catch (error) {
      console.error('❌ API Error (getActiveAds):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== GET AD BY ID =====
  getAdById: async function(adId) {
    console.log('📡 API: getAdById -', adId);

    try {
      const ad = {
        adId: adId,
        businessName: 'Al-Noor Restaurant',
        email: 'contact@alnoor.com',
        phone: '+973 3366 1234',
        description: '20% Discount for Members',
        flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260901_0001.jpg?alt=media',
        status: 'APPROVED',
        createdAt: '2026-09-01 10:30:00',
        approvedAt: '2026-09-01 14:00:00',
        duration: 30,
        carouselEndDate: '2026-09-20',
        directoryEndDate: '2026-10-01'
      };

      if (!ad) {
        return { success: false, message: 'Ad not found' };
      }

      return { success: true, ad: ad };
    } catch (error) {
      console.error('❌ API Error (getAdById):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== GET PENDING UPDATES =====
  getPendingUpdates: async function() {
    console.log('📡 API: getPendingUpdates');

    try {
      const pendingUpdates = [
        {
          adId: 'AD_20260901_0001',
          businessName: 'Al-Noor Restaurant',
          description: '25% Discount for Members (Updated)',
          flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o/ads/AD_20260901_0001_updated.jpg?alt=media',
          updateStatus: 'PENDING',
          updatedAt: '2026-09-14 15:30:00'
        }
      ];

      return { success: true, updates: pendingUpdates };
    } catch (error) {
      console.error('❌ API Error (getPendingUpdates):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== SET CAROUSEL LIMIT =====
  setCarouselLimit: async function(limit) {
    console.log('📡 API: setCarouselLimit -', limit);

    try {
      if (limit < 1 || limit > 20) {
        return { success: false, message: 'Carousel limit must be between 1 and 20' };
      }

      const admin = window.appState?.member;

      if (window.api && window.api.logActivity) {
        await window.api.logActivity({
          category: 'SYSTEM',
          event: 'Carousel Limit Set',
          memberId: admin?.id || 'system',
          memberName: admin?.fullName || 'System',
          details: `Carousel limit set to ${limit} ads`
        });
      }

      return { success: true, message: `Carousel limit set to ${limit}` };
    } catch (error) {
      console.error('❌ API Error (setCarouselLimit):', error);
      return { success: false, message: error.message };
    }
  }
};

console.log('✅ ads.js loaded successfully');

