
// views.js - Player Dashboard (Updated)

const views = {
  // Main Player Home
  home: () => {
    return `
      <div class="player-home">
        <h1>Home</h1>
        
        <!-- Upcoming Game Card -->
        <div class="card upcoming-game-card">
          <h2>Next Game</h2>
          <div id="upcomingGameContent">
            <p class="loading">Loading...</p>
          </div>
        </div>

        <!-- I'm Coming / Not Coming Toggle -->
        <div class="card attendance-toggle-card" id="attendanceToggleCard" style="display: none;">
          <h2>Will you attend?</h2>
          <div class="button-group">
            <button class="btn btn-success" id="imComingBtn" onclick="views.toggleAttendance('present')">
              ✓ I'm Coming
            </button>
            <button class="btn btn-danger" id="notComingBtn" onclick="views.toggleAttendance('absent')">
              ✗ Not Coming
            </button>
          </div>
          <p id="attendanceStatus" class="status-text"></p>
        </div>

        <!-- Wallet Balance Card -->
        <div class="card wallet-card">
          <h2>Wallet Balance</h2>
          <div class="balance-display">
            <span id="walletBalance" class="balance-amount">0.000 BHD</span>
          </div>
          <p id="walletStatus" class="wallet-status"></p>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="btn btn-primary" onclick="views.navigateTo('timetable')">View Timetable</button>
          <button class="btn btn-
