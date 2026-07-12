# ReviewBooks v2

Phiên bản 2 của website giới thiệu và đánh giá sách — Bài tập lớn môn Lập trình Web và Ứng dụng Di động.

Xây dựng bằng Node.js + Express + EJS + CSS/JS thuần (không dùng thư viện/framework ngoài). v2 dùng database MySQL **riêng** (`review_books_v2`), tách biệt hoàn toàn với v1 (`review_books`) — sửa/xóa dữ liệu ở bản này không ảnh hưởng bản kia.

## 1. Cài đặt và chạy

### Bước 1: Chuẩn bị môi trường
- Node.js >= 18 (khuyến nghị dùng bản LTS).
- MySQL Server đang chạy.

### Bước 2: Tạo database riêng cho v2
Chạy toàn bộ nội dung [sql/database.sql](sql/database.sql) — script này tự tạo database mới tên `review_books_v2` (có `DROP DATABASE IF EXISTS review_books_v2` ở đầu nên chỉ xoá/tạo lại đúng database này, không đụng tới `review_books` của v1).

### Bước 3: Cấu hình `.env`
Sao chép `.env.example` thành `.env` và điền thông tin kết nối MySQL của bạn:
```env
PORT=3001
SESSION_SECRET=chuoi_bi_mat_cua_rieng_ban_123
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=review_books_v2
```

### Bước 4: Cài đặt & chạy
```bash
npm install
npm start
```
Mở trình duyệt tại [http://localhost:3001](http://localhost:3001).

> v1 chạy ở cổng 3000, v2 chạy ở cổng 3001 — có thể bật đồng thời cả hai để so sánh mà không xung đột.

### Tài khoản mẫu (dữ liệu seed riêng của v2, độc lập với v1)
- Admin: `admin` / `admin123`
- User: `reader`, `linh_reader`, `minh_reader`, `hoa_reader` / `user123`

## 2. Kiến trúc dự án

```
app.js                  Khởi tạo Express, wiring middleware/routes
config/db.js            MySQL connection pool
services/                Tầng nghiệp vụ dùng chung cho web (EJS) và API (JSON)
utils/                   Hash mật khẩu, validate dữ liệu, phân trang, safe redirect
middleware/               auth, adminOnly, flash, view counter, user activity, api auth
routes/web/               Route render EJS (public, auth, admin)
routes/api/                Route JSON /api/* cho mobile app dùng sau này
views/                     Template EJS (partials, pages, admin)
public/                    CSS/JS/ảnh thuần, không dùng thư viện ngoài
```

Route EJS và route API đều gọi chung các hàm trong `services/`, không lặp lại logic truy vấn.

## 3. Đối chiếu yêu cầu BTL (Website)

| Yêu cầu | Trạng thái | Ghi chú |
| --- | --- | --- |
| Lưu trữ dữ liệu bằng database | ✅ | MySQL riêng (`review_books_v2`), tách biệt v1 |
| Đăng nhập/đăng xuất, phân quyền admin/user | ✅ | Session + PBKDF2-SHA512 |
| Trang chi tiết nội dung theo mã (`/books/:id`) | ✅ | |
| Form bình luận/đánh giá (tên, email, nội dung, điểm) | ✅ | Bắt buộc đăng nhập mới bình luận được (giống v1); tên/email lấy từ tài khoản |
| Bình luận hiển thị công khai sau khi gửi | ✅ | |
| Popup quảng cáo sau 1 phút ở trang chủ | ✅ | `<dialog>` + `public/js/popup.js` |
| Đóng popup thì không hiện lại (cookie) | ✅ | Cookie `book_popup_closed`, 30 ngày |
| Trang giới thiệu & liên hệ + form gửi ý kiến | ✅ | `/contact` |
| Trang quản trị: view count, CRUD nội dung, quản lý bình luận | ✅ | `/admin/*` |
| Responsive 3 ngưỡng 800px / 1200px | ✅ | Đã kiểm chứng bằng computed style tại 799/800/1199/1200px |
| Không dùng thư viện/framework ngoài | ✅ | Chỉ 5 dependency backend: express, express-session, ejs, dotenv, mysql2 |

## 4. API cho mobile app (`/api/*`)

Dùng session cookie (giống web), chưa cần JWT vì mobile app sẽ được xây dựng sau và có thể giữ cookie jar.

| Endpoint | Mô tả |
| --- | --- |
| `GET /api/books` | Danh sách sách (search, category, sort, page) |
| `GET /api/books/:id` | Chi tiết 1 sách + điểm đánh giá trung bình |
| `GET /api/books/:id/comments` | Danh sách bình luận của 1 sách |
| `POST /api/books/:id/comments` | Gửi bình luận (yêu cầu đã đăng nhập) |
| `GET /api/categories` | Danh sách thể loại |
| `GET /api/reviews` | Feed toàn bộ bình luận |
| `POST /api/contact` | Gửi ý kiến liên hệ |
| `POST /api/auth/register` / `/login` / `/logout` | Đăng ký / đăng nhập / đăng xuất |
| `GET /api/auth/me` | Thông tin phiên đăng nhập hiện tại |

Route quản trị (`/admin/*`) hiện chỉ có bản EJS, chưa mở API vì rubric hiện tại không yêu cầu — service layer đã sẵn sàng để mở rộng khi cần.

## 5. Khác biệt có chủ đích so với v1

- **Bình luận/đánh giá bắt buộc đăng nhập:** giống hệt v1 — khách chưa đăng nhập sẽ thấy lời nhắc "Vui lòng đăng nhập để bình luận và đánh giá" thay vì form; tên/email của bình luận lấy trực tiếp từ tài khoản đang đăng nhập.
- **Font tự host:** không dùng Google Fonts CDN để tránh phụ thuộc mạng ngoài; ưu tiên fallback font hệ thống nếu chưa có file font cục bộ trong `public/fonts`.
