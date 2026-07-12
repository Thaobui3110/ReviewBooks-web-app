// API gửi ý kiến liên hệ
const express = require('express');
const contactService = require('../../services/contactService');
const { validateContact } = require('../../utils/validation');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { errors, values } = validateContact(req.body, req.session.user);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    await contactService.create(values);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
