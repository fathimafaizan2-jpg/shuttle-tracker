// AUTHENTICATION, AUTO-LOCK TIMER & CREDENTIALS MANAGEMENT
window.addEventListener("DOMContentLoaded", () => {
  initLanguageSwitcher();
  initAutoLockCheck();

  document.querySelectorAll("#rolePills .pill").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#rolePills .pill").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      state.role = button.dataset.role;
    });
  });

  document.getElementById("openApp")?.addEventListener("click", () => {
    document.getElementById("login")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    render();
  });

  document.getElementById("menu")?.addEventListener("click", () => {
    document.getElementById("side")?.classList.toggle("open");
  });

  document.querySelectorAll(".nav[data-page]").forEach(button => {
    button.addEventListener("click", () => go(button.dataset.page));
  });

  setTimeout(() => {
    document.getElementById("splash")?.classList.add("hidden");
    document.getElementById("login")?.classList.remove("hidden");
  }, 850);
});

function initLanguageSwitcher() {
  const container = document.getElementById("langSwitcher");
  if (!container) return;
  container.innerHTML = `
    <select onchange="changeLanguage(this.value)" style="padding:4px 8px; border-radius:8px; font-weight:bold; font-size:11px;">
      <option value="EN" ${state.lang==='EN'?'selected':''}>English</option>
      <option value="ML" ${state.lang==='ML'?'selected':''}>മലയാളം</option>
      <option value="HI" ${state.lang==='HI'?'selected':''}>हिंदी</option>
      <option value="TA" ${state.lang==='TA'?'selected':''}>தமிழ்</option>
    </select>
  `;
}

function changeLanguage(langCode) {
  state.lang = langCode;
  toast("Language changed to " + langCode);
  render();
}

// AUTO-LOCK SESSION TIMER (Locks session 15 mins after match start)
function initAutoLockCheck() {
  const checkInterval = 60000; // Check every 60 seconds
  setInterval(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Default match threshold: 8:15 PM (1215 mins from midnight)
    if (currentMinutes >= 1215 && !state.sessionAutoLocked) {
      state.sessionAutoLocked = true;
      toast("⚠️ Match start time passed (+15m). Attendance session auto-locked!");
      if (typeof render === "function") render();
    }
  }, checkInterval);
}

function promptUpdateCredentials() {
  const newPhone = prompt("Enter New Mobile Phone Number:", state.currentUser?.phone || "");
  const newPass = prompt("Enter New Password:", state.currentUser?.password || "");
  
  if (newPhone && state.currentUser) state.currentUser.phone = newPhone;
  if (newPass && state.currentUser) state.currentUser.password = newPass;
  
  localStorage.setItem('shuttle_user', JSON.stringify(state.currentUser));
  toast("Credentials updated successfully!");
}
