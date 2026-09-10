
// views.js - Player Dashboard

const views = {
  home: () => {
    return `
      <div class="player-home">
        <h1>Home</h1>
        <div class="card upcoming-game-card">
          <h2>Next Game</h2>
          <div id="upcomingGameContent">
            <p class="loading">Loading...</p>
          </div>
        </div>
        <div class="card wallet-card">
          <h2>Wallet Balance</h2>
          <div class="balance-display">
            <span id="walletBalance" class="balance-amount">0.000 BHD</span>
          </div>
          <p id="walletStatus" class="wallet-status"></p>
        </div>
      </div>
    `;
  },

  timetable: () => {
    return `
      <div class="timetable-page">
        <h1>Timetable</h1>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="4" class="loading">No sessions yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  attendance: () => {
    return `
      <div class="attendance-page">
        <h1>Attendance Log</h1>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="3" class="loading">No attendance records yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  logs: () => {
    return `
      <div class="logs-page">
        <h1>Activity Logs</h1>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="3" class="loading">No logs yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  wallet: () => {
    return `
      <div class="wallet-page">
        <h1>Wallet & Payments</h1>
        <div class="card balance-card">
          <h2>Current Balance</h2>
          <span class="balance-amount">0.000 BHD</span>
        </div>
        <div class="card payment-options-card">
          <h2>Payment Options</h2>
          <div class="button-group">
            <button class="btn btn-primary">Use Credit</button>
            <button class="btn btn-secondary">Pay by Cash</button>
            <button class="btn btn-secondary">Pay by WhatsApp</button>
          </div>
        </div>
      </div>
    `;
  },

  bazaar: () => {
    return `
      <div class="bazaar-page">
        <h1>BaZaar - Community Directory</h1>
        <div id="bazaarContent" class="bazaar-grid">
          <p class="loading">No businesses yet</p>
        </div>
      </div>
    `;
  },

  profile: () => {
    return `
      <div class="profile-page">
        <h1>My Profile</h1>
        <div class="card profile-card">
          <h2>Account Details</h2>
          <p><strong>Name:</strong> <span id="profileName">Loading...</span></p>
          <p><strong>Email:</strong> <span id="profileEmail">Loading...</span></p>
          <p><strong>Phone:</strong> <span id="profilePhone">Loading...</span></p>
          <p><strong>Role:</strong> <span id="profileRole">Loading...</span></p>
        </div>
      </div>
    `;
  }
};

