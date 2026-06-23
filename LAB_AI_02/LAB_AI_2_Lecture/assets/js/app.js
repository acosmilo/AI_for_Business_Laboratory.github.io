/*
  MVC-lite organization:
  - Model: small configuration objects and DOM selectors.
  - View: UI updates such as copied-button feedback.
  - Controller: event listeners connecting user actions to view updates.
*/

const WorkshopModel = {
  selectors: {
    copyButton: "[data-copy-target]",
    printButton: "[data-print]"
  },
  copiedClass: "is-copied",
  copiedText: "Copied",
  copyResetDelay: 1200
};

const WorkshopView = {
  setCopiedState(button) {
    const originalText = button.textContent;
    button.textContent = WorkshopModel.copiedText;
    button.classList.add(WorkshopModel.copiedClass);

    window.setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove(WorkshopModel.copiedClass);
    }, WorkshopModel.copyResetDelay);
  }
};

const WorkshopController = {
  init() {
    this.bindCopyButtons();
    this.bindPrintButton();
  },

  bindCopyButtons() {
    document.querySelectorAll(WorkshopModel.selectors.copyButton).forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.getAttribute("data-copy-target");
        const target = document.getElementById(targetId);

        if (!target) return;

        await navigator.clipboard.writeText(target.innerText);
        WorkshopView.setCopiedState(button);
      });
    });
  },

  bindPrintButton() {
    const button = document.querySelector(WorkshopModel.selectors.printButton);
    if (!button) return;
    button.addEventListener("click", () => window.print());
  }
};

document.addEventListener("DOMContentLoaded", () => {
  WorkshopController.init();
});
