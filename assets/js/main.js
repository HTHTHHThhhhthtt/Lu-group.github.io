/* =========================================================
   Minimal vanilla JavaScript.
   No framework, no external dependency.
   Used only for equipment image enlargement and footer year.
   ========================================================= */

(function () {
  "use strict";

  // Automatically update footer year.
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Equipment image modal.
  var modal = document.getElementById("imageModal");
  if (!modal) return;

  var modalImage = modal.querySelector(".image-modal-content");
  var closeButton = modal.querySelector(".image-modal-close");

  function openModal(src, alt) {
    modalImage.src = src;
    modalImage.alt = alt || "放大图片";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-enlarge]").forEach(function (button) {
    button.addEventListener("click", function () {
      var image = button.querySelector("img");
      if (image) openModal(image.src, image.alt);
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
})();
