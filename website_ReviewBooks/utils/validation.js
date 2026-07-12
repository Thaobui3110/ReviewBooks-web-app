const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value) {
  return EMAIL_RE.test(clean(value));
}

function validateRequiredText(value, label, min = 1, max = 1000) {
  const text = clean(value);
  if (text.length < min) return `${label} phải có ít nhất ${min} ký tự.`;
  if (text.length > max) return `${label} không được vượt quá ${max} ký tự.`;
  return '';
}

function validateBook(data, validCategories, validAuthors) {
  // validCategories, validAuthors: mảng { id, name } lấy từ categoryService/authorService.listAll()
  const errors = [];
  const title = clean(data.title);
  const cover_image = clean(data.cover_image) || '/images/books/default-book.svg';
  const description = clean(data.description);
  const review_content = clean(data.review_content);
  const language = clean(data.language) || null;
  const publisher = clean(data.publisher) || null;
  const translator = clean(data.translator) || null;

  const currentYear = new Date().getFullYear();
  const publishYearRaw = clean(data.publish_year);
  const publish_year = publishYearRaw ? Number(publishYearRaw) : null;
  const pageCountRaw = clean(data.page_count);
  const page_count = pageCountRaw ? Number(pageCountRaw) : null;

  const rawIds = Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []);
  const validCategoryIds = new Set(validCategories.map((c) => String(c.id)));
  const categoryIds = rawIds
    .map((value) => String(value))
    .filter((value) => validCategoryIds.has(value))
    .map((value) => Number(value));

  const validAuthorIds = new Set(validAuthors.map((a) => String(a.id)));
  const authorIdRaw = clean(data.author_id);
  const authorId = validAuthorIds.has(authorIdRaw) ? Number(authorIdRaw) : null;

  const titleError = validateRequiredText(title, 'Tên sách', 2, 200);
  if (titleError) errors.push(titleError);
  if (!authorId) errors.push('Phải chọn tác giả từ danh sách có sẵn.');
  if (categoryIds.length === 0) errors.push('Phải chọn ít nhất 1 thể loại.');
  if (description.length > 3000) errors.push('Mô tả không được vượt quá 3000 ký tự.');
  if (review_content.length > 6000) errors.push('Nội dung đánh giá không được vượt quá 6000 ký tự.');
  if (publishYearRaw && (!Number.isInteger(publish_year) || publish_year < 1000 || publish_year > currentYear)) {
    errors.push(`Năm xuất bản phải là số nguyên từ 1000 đến ${currentYear}.`);
  }
  if (pageCountRaw && (!Number.isInteger(page_count) || page_count < 1 || page_count > 20000)) {
    errors.push('Số trang phải là số nguyên dương hợp lệ.');
  }

  return {
    errors,
    values: {
      title, authorId, categoryIds, cover_image, description, review_content,
      language, publish_year, page_count, publisher, translator
    }
  };
}

function validateAuthor(data) {
  const errors = [];
  const name = clean(data.name);
  const avatar = clean(data.avatar) || '/images/authors/default-author.svg';
  const bio = clean(data.bio);

  const nameError = validateRequiredText(name, 'Tên tác giả', 2, 150);
  if (nameError) errors.push(nameError);
  if (bio.length > 3000) errors.push('Tiểu sử không được vượt quá 3000 ký tự.');

  return { errors, values: { name, avatar, bio } };
}

function validateUser(data, mode = 'create') {
  const errors = [];
  const username = clean(data.username);
  const email = clean(data.email);
  const password = clean(data.password);
  const role = data.role === 'admin' ? 'admin' : 'user';

  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    errors.push('Tên đăng nhập phải dài 3-50 ký tự và chỉ gồm chữ, số hoặc dấu gạch dưới.');
  }
  if (!isEmail(email) || email.length > 120) {
    errors.push('Email không hợp lệ.');
  }
  if (mode === 'create' && password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự.');
  }
  if (mode === 'edit' && password && password.length < 6) {
    errors.push('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }

  return { errors, values: { username, email, password, role } };
}

function validateProfileUpdate(data) {
  const errors = [];
  const username = clean(data.username);

  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    errors.push('Tên đăng nhập phải dài 3-50 ký tự và chỉ gồm chữ, số hoặc dấu gạch dưới.');
  }

  return { errors, values: { username } };
}

function validatePasswordChange(data) {
  const errors = [];
  const currentPassword = clean(data.currentPassword);
  const newPassword = clean(data.newPassword);
  const confirmPassword = clean(data.confirmPassword);

  if (!currentPassword) errors.push('Vui lòng nhập mật khẩu hiện tại.');
  if (newPassword.length < 6) errors.push('Mật khẩu mới phải có ít nhất 6 ký tự.');
  if (newPassword !== confirmPassword) errors.push('Xác nhận mật khẩu mới không khớp.');

  return { errors, values: { currentPassword, newPassword } };
}

function validateCategoryName(value) {
  const name = clean(value);
  const errors = [];
  if (name.length < 2) errors.push('Tên thể loại phải có ít nhất 2 ký tự.');
  if (name.length > 80) errors.push('Tên thể loại không được vượt quá 80 ký tự.');
  return { errors, name };
}

function validateContact(data, sessionUser) {
  const errors = [];
  const name = clean(data.name) || (sessionUser ? sessionUser.username : '');
  const email = sessionUser ? sessionUser.email : clean(data.email);
  const subject = clean(data.subject) || 'Góp ý website';
  const message = clean(data.message);

  if (name.length < 2 || name.length > 100) errors.push('Họ tên phải có từ 2 đến 100 ký tự.');
  if (!isEmail(email)) errors.push('Email không hợp lệ.');
  if (subject.length > 200) errors.push('Tiêu đề không được vượt quá 200 ký tự.');
  if (message.length < 5 || message.length > 3000) errors.push('Nội dung phải có từ 5 đến 3000 ký tự.');

  return { errors, values: { name, email, subject, message } };
}

function validateComment(data) {
  const errors = [];
  const content = clean(data.content);
  const numericRating = Number(data.rating);

  if (content.length < 5 || content.length > 2000) errors.push('Bình luận phải có từ 5 đến 2000 ký tự.');
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) errors.push('Điểm đánh giá phải nằm trong khoảng 1 đến 5.');

  return { errors, values: { content, rating: numericRating } };
}

module.exports = {
  validateBook,
  validateAuthor,
  validateUser,
  validateProfileUpdate,
  validatePasswordChange,
  validateCategoryName,
  validateContact,
  validateComment
};
