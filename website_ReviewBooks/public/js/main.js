document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-main-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }

  const accountMenu = document.querySelector('[data-account-menu]');
  const accountTrigger = document.querySelector('[data-account-trigger]');

  if (accountMenu && accountTrigger) {
    const closeAccountMenu = () => {
      accountMenu.classList.remove('is-open');
      accountTrigger.setAttribute('aria-expanded', 'false');
    };

    accountTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = accountMenu.classList.toggle('is-open');
      accountTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!accountMenu.contains(event.target)) closeAccountMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAccountMenu();
    });
  }

  document.querySelectorAll('[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm') || 'Bạn có chắc chắn muốn thực hiện thao tác này?';
      if (!window.confirm(message)) event.preventDefault();
    });
  });
});
