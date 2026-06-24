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



const imageModal = document.getElementById('imageModal');
const expandedImage = document.getElementById('expandedImage');
const imageModalTitle = document.getElementById('imageModalTitle');
const imageModalStage = document.getElementById('imageModalStage');

const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const closeImageModal = document.getElementById('closeImageModal');

let currentZoom = 1;

function applyZoom() {
  if (!expandedImage.naturalWidth) return;

  expandedImage.style.width = `${Math.round(
    expandedImage.naturalWidth * currentZoom
  )}px`;
}

function openImageModal(img) {
  currentZoom = 1;

  expandedImage.onload = applyZoom;
  expandedImage.src = img.src;
  expandedImage.alt = img.alt || 'Expanded screenshot';

  const caption = img
    .closest('figure')
    ?.querySelector('figcaption')
    ?.innerText || 'Expanded image';

  imageModalTitle.textContent = caption;

  imageModal.classList.add('open');
  imageModal.setAttribute('aria-hidden', 'false');

  imageModalStage.scrollTop = 0;
  imageModalStage.scrollLeft = 0;

  applyZoom();
}

function closeModal() {
  imageModal.classList.remove('open');
  imageModal.setAttribute('aria-hidden', 'true');

  expandedImage.removeAttribute('style');
  expandedImage.onload = null;
  expandedImage.src = '';
}

document.querySelectorAll('.figure-card img').forEach((img, index) => {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'image-action-btn';
  button.textContent = 'Expand';
  button.setAttribute('aria-label', `Expand screenshot ${index + 1}`);

  button.addEventListener('click', () => openImageModal(img));

  img.closest('.figure-card').appendChild(button);
  img.addEventListener('click', () => openImageModal(img));
});

zoomInBtn?.addEventListener('click', () => {
  currentZoom = Math.min(3, currentZoom + 0.25);
  applyZoom();
});

zoomOutBtn?.addEventListener('click', () => {
  currentZoom = Math.max(0.5, currentZoom - 0.25);
  applyZoom();
});

zoomResetBtn?.addEventListener('click', () => {
  currentZoom = 1;
  applyZoom();

  imageModalStage.scrollTop = 0;
  imageModalStage.scrollLeft = 0;
});

closeImageModal?.addEventListener('click', closeModal);

imageModal?.addEventListener('click', event => {
  if (event.target === imageModal) {
    closeModal();
  }
});

document.addEventListener('keydown', event => {
  if (!imageModal.classList.contains('open')) return;

  if (event.key === 'Escape') closeModal();

  if (event.key === '+') {
    currentZoom = Math.min(3, currentZoom + 0.25);
    applyZoom();
  }

  if (event.key === '-') {
    currentZoom = Math.max(0.5, currentZoom - 0.25);
    applyZoom();
  }

  if (event.key === '0') {
    currentZoom = 1;
    applyZoom();
  }
});
