document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-validate-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (form.checkValidity()) return;
      event.preventDefault();

      form.querySelectorAll('.field-error').forEach((el) => el.remove());

      let firstInvalid = null;
      const handledRadioGroups = new Set();

      Array.from(form.elements).forEach((el) => {
        if (typeof el.checkValidity !== 'function' || el.checkValidity()) return;

        if (el.type === 'radio') {
          if (handledRadioGroups.has(el.name)) return;
          handledRadioGroups.add(el.name);
          if (!firstInvalid) firstInvalid = el;

          const message = document.createElement('div');
          message.className = 'field-error';
          message.textContent = el.name === 'rating' ? 'Please select your rating stars' : el.validationMessage;
          (el.closest('fieldset') || el).insertAdjacentElement('afterend', message);
          return;
        }

        if (!firstInvalid) firstInvalid = el;

        const message = document.createElement('div');
        message.className = 'field-error';
        message.textContent = el.validationMessage;
        el.insertAdjacentElement('afterend', message);
      });

      if (firstInvalid) firstInvalid.focus();
    });
  });
});
