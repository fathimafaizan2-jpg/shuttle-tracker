// AUTHENTICATION AND EVENT INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  const languageSelector = document.getElementById("languageSelector");
  if (languageSelector) {
    languageSelector.value = localStorage.getItem("indianClubLanguage") || "en";
    languageSelector.onchange = e => applyLanguage(e.target.value);
  }

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
