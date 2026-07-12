document.addEventListener('DOMContentLoaded', () => {
  function closeAllMenus(except) {
    document.querySelectorAll('[data-comment-menu-dropdown]').forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.hidden = true;
      dropdown.closest('[data-comment-menu]')
        .querySelector('[data-comment-menu-toggle]')
        .setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', (event) => {
    const toggleBtn = event.target.closest('[data-comment-menu-toggle]');
    if (toggleBtn) {
      const menu = toggleBtn.closest('[data-comment-menu]');
      const dropdown = menu.querySelector('[data-comment-menu-dropdown]');
      const willOpen = dropdown.hidden;
      closeAllMenus();
      dropdown.hidden = !willOpen;
      toggleBtn.setAttribute('aria-expanded', String(willOpen));
      return;
    }

    const editToggle = event.target.closest('[data-comment-edit-toggle]');
    if (editToggle) {
      closeAllMenus();
      const reviewItem = editToggle.closest('.review-item');
      const editForm = reviewItem.querySelector('[data-comment-edit-form]');
      if (editForm) {
        editForm.hidden = false;
        editForm.querySelector('textarea').focus();
      }
      return;
    }

    const cancelBtn = event.target.closest('[data-comment-edit-cancel]');
    if (cancelBtn) {
      cancelBtn.closest('[data-comment-edit-form]').hidden = true;
      return;
    }

    if (!event.target.closest('[data-comment-menu]')) closeAllMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
});
