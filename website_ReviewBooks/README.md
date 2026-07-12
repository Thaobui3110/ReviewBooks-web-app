# ReviewBooks — Website

Website giới thiệu và đánh giá sách — Bài tập lớn môn Lập trình Web và Ứng dụng Di động. Đây vừa là **website** (render HTML bằng EJS) vừa là **backend/API** mà app mobile (`mobile_ReviewBooks/`) gọi vào.

File này giải thích tổ chức thư mục, luồng chạy và các công cụ đã dùng — mục đích để đồng đội đọc hiểu code nhanh và chuẩn bị bảo vệ đồ án. Hướng dẫn cài đặt/chạy chi tiết xem ở [README gốc](../README.md).

---

## 1. Công nghệ sử dụng

| Công cụ | Vai trò | Vì sao dùng được (không tính là "thư viện sẵn") |
|---|---|---|
| **Node.js + Express** | Nền web server, định tuyến (routing) | Là nền tảng chạy JS phía server + framework định tuyến tối thiểu, không có UI/hành vi tương tác dựng sẵn — giống việc dùng trình biên dịch, không phải "code hộ" |
| **EJS** | View engine render HTML từ template | Chỉ nội suy biến vào HTML (`<%= %>`), không có component/logic dựng sẵn nào |
| **MySQL + mysql2** | Lưu trữ dữ liệu | Driver kết nối database thuần, không sinh logic nghiệp vụ |
| **express-session** | Quản lý session cookie cho web | Middleware quản lý cookie ở tầng hạ tầng, không phải tính năng nghiệp vụ của bài |
| **jsonwebtoken** | Ký/xác minh JWT cho mobile | Dùng đúng kỹ thuật được dạy trong slide "11. Networking" (Token-based Session Management/JWT) |
| **dotenv** | Đọc file `.env` | Tiện ích đọc biến môi trường, không liên quan logic web |
| CSS/JS thuần (`public/`) | Giao diện, tương tác (star rating, popup, validate, infinite scroll, dropdown admin...) | **Tự viết 100%**, không dùng jQuery/Bootstrap hay bất kỳ plugin UI nào — đây là phần bị chấm điểm nặng nhất ở mục "Copy hoặc dùng thư viện sẵn (-10)" |

`package.json` chỉ có đúng 6 dependency kể trên — không có gì khác. Đây là điểm quan trọng cần nhớ khi bảo vệ đồ án.

---

## 2. Tổ chức thư mục

```
website_ReviewBooks/
├── app.js                  Điểm khởi động: tạo Express app, gắn middleware theo đúng thứ tự, mount route
├── config/
│   └── db.js                 Tạo connection pool tới MySQL (dùng chung cho toàn bộ services/)
├── middleware/
│   ├── auth.js                requireLogin — chặn trang web cần đăng nhập, redirect về /login nếu chưa
│   ├── adminOnly.js            Chặn khu vực /admin/*, redirect nếu chưa đăng nhập, báo lỗi 403 nếu không phải admin
│   ├── apiAuth.js               requireLoginApi/adminOnlyApi — bản JSON của 2 middleware trên, dùng cho routes/api
│   ├── flash.js                 Cơ chế "flash message" (thông báo 1 lần) qua session, dùng sau redirect
│   ├── userActivity.js           Cập nhật last_seen_at của user đang đăng nhập trên mỗi request
│   └── viewCounter.js             Tăng bộ đếm view toàn site (bỏ qua request tải css/js/ảnh)
├── routes/
│   ├── web/                    Route render EJS (trả về HTML)
│   │   ├── publicRoutes.js        Trang chủ, danh sách/chi tiết sách, bình luận, tài khoản, liên hệ
│   │   ├── authRoutes.js           Đăng nhập / đăng ký / đăng xuất
│   │   └── adminRoutes.js          Toàn bộ /admin/* — dashboard, CRUD sách/tác giả/thể loại/người dùng, quản lý bình luận/liên hệ
│   └── api/                    Route trả JSON cho mobile app gọi
│       ├── index.js               Mount tất cả route con + middleware đọc Bearer token (xem mục 4)
│       ├── authApi.js              Đăng ký/đăng nhập/đăng xuất, xem/sửa tài khoản, đổi mật khẩu
│       ├── booksApi.js             Danh sách/chi tiết sách, bình luận (tạo/sửa/xoá)
│       ├── categoriesApi.js        Danh sách thể loại
│       ├── commentsApi.js          Feed toàn bộ bình luận (trang "Tất cả bình luận"), hỗ trợ tìm kiếm + sắp xếp
│       └── contactApi.js           Gửi ý kiến liên hệ
├── services/                 Tầng nghiệp vụ DÙNG CHUNG cho cả routes/web (EJS) và routes/api (JSON)
│   ├── authService.js              Đăng nhập (verify password), đăng ký, cập nhật last_seen_at
│   ├── userService.js               CRUD người dùng, đổi tên/đổi mật khẩu
│   ├── bookService.js                CRUD sách, tìm kiếm/lọc/sắp xếp/phân trang, sách liên quan
│   ├── authorService.js              CRUD tác giả
│   ├── categoryService.js             CRUD thể loại
│   ├── commentService.js              CRUD bình luận, tính điểm đánh giá trung bình, feed toàn site (tìm kiếm + sắp xếp)
│   ├── contactService.js              Lưu/liệt kê liên hệ
│   └── statsService.js                Đếm view, thống kê cho dashboard admin
├── utils/
│   ├── validation.js            TOÀN BỘ luật validate (đăng ký, sách, tác giả, bình luận, liên hệ...) — routes chỉ gọi, không tự viết luật
│   ├── password.js                Hash/so khớp mật khẩu bằng PBKDF2-SHA512 (Node `crypto`, không dùng bcrypt)
│   ├── token.js                    Ký/xác minh JWT cho mobile (dùng package `jsonwebtoken`)
│   ├── pagination.js               Tính toán phân trang (offset, hasNext...) dùng chung mọi danh sách
│   └── safeUrl.js                   Chặn open-redirect khi dùng tham số ?next=/?back=
├── views/                   Template EJS
│   ├── partials/                Phần dùng lại: header, footer, flash, popup, star-rating, pagination
│   ├── pages/                    Trang người dùng: trang chủ, danh sách/chi tiết sách, đăng nhập/đăng ký, tài khoản, liên hệ, bình luận
│   └── admin/                    Trang quản trị: dashboard, các trang CRUD + partials render dòng bảng (dùng cho infinite scroll)
├── public/
│   ├── css/                     base (biến màu/spacing), layout (khung trang, responsive), components, pages, admin
│   ├── js/                       main (menu/dropdown), star-rating, popup, validation, comments (sửa/xoá), infinite-scroll, admin
│   └── images/                   Ảnh bìa sách/tác giả (.jpg) — không dùng ảnh .svg (React Native không tự render được SVG)
└── sql/database.sql          Script DUY NHẤT tạo database `review_books` từ đầu + seed dữ liệu mẫu (sách, tác giả, tài khoản, bình luận)
```

**Nguyên tắc tổ chức:** route (`routes/web`, `routes/api`) không chứa logic nghiệp vụ — chỉ nhận request, gọi `services/`, trả response. Validate luôn tập trung ở `utils/validation.js`. Đây là điều nên nêu khi giảng viên hỏi về "tổ chức project".

---

## 3. Luồng chạy (request lifecycle)

### 3.1. Thứ tự middleware (`app.js`, chạy cho MỌI request)

```
express.static (phục vụ file tĩnh public/)
  → express.urlencoded + express.json (đọc dữ liệu form/JSON gửi lên)
  → session (đọc/tạo cookie session)
  → flash (đọc thông báo 1 lần từ session)
  → userActivity (cập nhật last_seen_at nếu đã đăng nhập)
  → gán res.locals.currentUser / currentPath (để mọi view EJS dùng được)
  → viewCounter (tăng đếm view nếu là GET trang, không tính css/js/ảnh)
  → routes/api/*  (JSON)
  → routes/web/*  (HTML)
  → routes/web/adminRoutes (JSON… không, vẫn HTML, chỉ thêm adminOnly)
  → 404 handler → 500 error handler
```

### 3.2. Ví dụ luồng — xem chi tiết 1 cuốn sách (`GET /books/:id`)
```
Trình duyệt → routes/web/publicRoutes.js
  → bookService.getBookById(id)      lấy thông tin sách + tác giả
  → commentService.listForBook(id)    lấy danh sách bình luận
  → commentService.getRatingStats(id)  tính điểm trung bình
  → res.render('pages/book-detail', {...})   EJS render ra HTML trả về
```

### 3.3. Ví dụ luồng — gửi bình luận từ web (`POST /books/:id/comments`)
```
Form submit → requireLogin middleware (chặn nếu chưa đăng nhập)
  → utils/validation.js::validateComment()   kiểm tra độ dài nội dung, điểm 1-5
  → commentService.createComment()            lưu vào DB
  → setFlash('success', ...) + redirect lại trang chi tiết sách
```

### 3.4. Ví dụ luồng — mobile app gọi API (`POST /api/books/:id/comments`)
```
App mobile gửi kèm header Authorization: Bearer <JWT>
  → routes/api/index.js: middleware đọc token, verify, gán req.session.user
  → middleware/apiAuth.js::requireLoginApi (giờ thấy req.session.user đã có, cho qua)
  → utils/validation.js::validateComment()   (Y HỆT logic web, không viết lại)
  → commentService.createComment()            (Y HỆT hàm web dùng)
  → res.json({ success: true })
```
→ Điểm mấu chốt: **route web và route API dùng chung `services/` và `utils/validation.js`**, không có 2 bộ logic khác nhau cho cùng 1 nghiệp vụ.

---

## 4. Cơ chế xác thực (2 kiểu song song)

| | Website (trình duyệt) | Mobile app |
|---|---|---|
| Cách xác thực | Session cookie (`express-session`) | JWT (`jsonwebtoken`), gửi qua header `Authorization: Bearer <token>` |
| Lưu ở đâu | Cookie trình duyệt tự quản | `AsyncStorage` trên điện thoại (`mobile_ReviewBooks/src/utils/storage.ts`) |
| Ai xác nhận | `express-session` tự đọc cookie, gán `req.session.user` | Middleware riêng trong `routes/api/index.js` đọc header, verify bằng `utils/token.js`, rồi **cũng gán vào `req.session.user`** |

Nhờ bước "cũng gán vào `req.session.user`", toàn bộ middleware (`requireLoginApi`, `adminOnlyApi`) và route handler phía sau **không cần biết** request tới từ web hay mobile — chỉ cần đọc `req.session.user` như bình thường. Đây là điểm thiết kế quan trọng nên nhớ khi bảo vệ.

`POST /api/auth/login` và `PATCH /api/auth/me` trả thêm `token` trong response — vì JWT không lưu trạng thái ở server (stateless), khi đổi username phải **ký lại token mới** để app cập nhật, nếu không token cũ vẫn mang username cũ tới khi hết hạn (7 ngày).

---

## 5. Cấu trúc dữ liệu chính (`sql/database.sql`)

```
users(id, username, email, password[hash], role[admin/user], last_seen_at)
authors(id, name, avatar, bio)
categories(id, name)
books(id, title, author_id→authors, cover_image, description, review_content,
      language, publish_year, page_count, publisher, translator)
book_categories(book_id, category_id)      -- quan hệ nhiều-nhiều sách↔thể loại
comments(id, book_id→books, user_id→users, name, email, content, rating, created_at)
contacts(id, name, email, subject, message, created_at)
site_stats(total_views)                     -- 1 dòng duy nhất, đếm view toàn site
```

---

## 6. API cho mobile (`/api/*`)

Mọi response đều theo format `{ success: boolean, data?, message? }`.

| Endpoint | Method | Yêu cầu đăng nhập | Mô tả |
|---|---|---|---|
| `/api/auth/register` | POST | Không | Đăng ký tài khoản mới |
| `/api/auth/login` | POST | Không | Đăng nhập, trả `{ user, token }` |
| `/api/auth/logout` | POST | Không | Huỷ session (web) |
| `/api/auth/me` | GET | Có | Thông tin tài khoản hiện tại |
| `/api/auth/me` | PATCH | Có | Đổi tên hiển thị, trả token mới |
| `/api/auth/password` | POST | Có | Đổi mật khẩu |
| `/api/books` | GET | Không | Danh sách sách (search/category/sort/page) |
| `/api/books/:id` | GET | Không | Chi tiết sách + điểm đánh giá |
| `/api/books/:id/comments` | GET | Không | Danh sách bình luận của sách |
| `/api/books/:id/comments` | POST | Có | Gửi bình luận/đánh giá |
| `/api/books/:id/comments/:commentId` | PUT | Có (chủ bình luận) | Sửa bình luận của chính mình |
| `/api/books/:id/comments/:commentId` | DELETE | Có (chủ bình luận) | Xoá bình luận của chính mình |
| `/api/categories` | GET | Không | Danh sách thể loại |
| `/api/reviews` | GET | Không | Feed toàn bộ bình luận (mọi sách); hỗ trợ `?search=` (tên người/tên sách/nội dung) và `?sort=` (`newest`/`oldest`/`rating_high`/`rating_low`) |
| `/api/contact` | POST | Không | Gửi ý kiến liên hệ |

Khu vực `/admin/*` **không có bản API** — chỉ tồn tại ở web, vì rubric mobile không yêu cầu và app mobile chủ động không làm phần quản trị.

---

## 7. Đối chiếu yêu cầu BTL (Website)

| Yêu cầu | Trạng thái | Ghi chú |
| --- | --- | --- |
| Lưu trữ dữ liệu bằng database | ✅ | MySQL (`review_books`) |
| Đăng nhập/đăng xuất, phân quyền admin/user | ✅ | Session (web) + JWT (mobile), cùng 1 cơ chế phân quyền |
| Trang chi tiết nội dung theo mã (`/books/:id`) | ✅ | |
| Form bình luận/đánh giá (tên, email, nội dung, điểm) | ✅ | Bắt buộc đăng nhập; tên/email lấy từ tài khoản |
| Bình luận hiển thị công khai sau khi gửi | ✅ | |
| Popup quảng cáo sau 1 phút ở trang chủ | ✅ | `<dialog>` + `public/js/popup.js` |
| Đóng popup thì không hiện lại (cookie) | ✅ | Cookie `book_popup_closed`, 30 ngày |
| Trang giới thiệu & liên hệ + form gửi ý kiến | ✅ | `/contact` |
| Trang quản trị: view count, CRUD nội dung, quản lý bình luận | ✅ | `/admin/*` |
| Responsive 3 ngưỡng 800px / 1200px | ✅ | |
| Không dùng thư viện/framework ngoài | ✅ | Đúng 6 dependency backend, UI/JS tự viết 100% |

---

## 8. Ghi chú chuẩn bị bảo vệ đồ án

Những câu hỏi hay gặp và ý chính để trả lời:

- **"Vì sao dùng JWT mà không phải chỉ session cookie?"** — Session cookie hoạt động tốt cho trình duyệt, nhưng app mobile (React Native) không quản lý cookie tin cậy như trình duyệt. JWT là kỹ thuật được dạy trong slide Networking, cho phép mobile tự lưu token và gửi kèm mỗi request mà không cần cookie.
- **"Web và mobile có 2 bộ logic khác nhau không?"** — Không. `routes/web` và `routes/api` chỉ khác ở tầng nhận/trả dữ liệu (HTML vs JSON), cùng gọi chung `services/` và `utils/validation.js`.
- **"Vì sao không dùng bcrypt/jsonwebtoken có sẵn để đơn giản hơn?"** — Mật khẩu dùng PBKDF2 tự viết qua `crypto` có sẵn của Node (không phải thư viện ngoài) để tránh phạt -10; riêng JWT thì **có** dùng package `jsonwebtoken` vì đây là kỹ thuật được dạy trực tiếp trong slide môn học, không phải "thư viện tắt" cho một tính năng UI.
- **"Ảnh bìa sách lưu ở đâu, vì sao đều là .jpg?"** — Lưu tĩnh trong `public/images/`, chuẩn hoá về `.jpg` (đã nén nhẹ) vì React Native không tự render được SVG; sách chưa có ảnh riêng thì dùng `placeholder.jpg`.
- **"Responsive làm thế nào?"** — CSS thuần trong `public/css/layout.css`, dùng media query ở 2 ngưỡng 800px/1200px, không dùng Bootstrap grid.
