(function () {
  const POPUP_DELAY_MS = 60000;
  const COOKIE_NAME = 'book_popup_closed';

  function getCookie(name) {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
      ?.split('=')[1];
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.querySelector('[data-popup]');
    if (!dialog) return;

    if (getCookie(COOKIE_NAME) === 'true') return;

    const timer = setTimeout(() => {
      if (typeof dialog.showModal === 'function') dialog.showModal();
    }, POPUP_DELAY_MS);

    const closeBtn = dialog.querySelector('[data-popup-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    dialog.addEventListener('close', () => {
      clearTimeout(timer);
      setCookie(COOKIE_NAME, 'true', 30);
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
})();
