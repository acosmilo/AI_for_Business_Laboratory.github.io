const HomePage = {
  init() {
    this.setCurrentYear();
  },

  setCurrentYear() {
    const yearTarget = document.querySelector("[data-current-year]");
    if (!yearTarget) return;
    yearTarget.textContent = new Date().getFullYear();
  }
};

document.addEventListener("DOMContentLoaded", () => HomePage.init());
