# ReviewBooks — Hướng dẫn chạy project từ đầu

Project gồm 2 phần chạy độc lập nhưng liên kết với nhau:

- **`website_ReviewBooks/`** — website (Node.js + Express + EJS + MySQL). Đây cũng chính là **backend/API** mà app mobile sẽ gọi vào.
- **`mobile_ReviewBooks/`** — app di động (Expo + React Native + TypeScript), gọi API của website ở trên để lấy dữ liệu.

**Nguyên tắc quan trọng nhất: luôn bật Website trước, rồi mới chạy Mobile.** App mobile không tự chứa dữ liệu — mọi thứ (đăng nhập, danh sách sách, bình luận...) đều lấy từ website đang chạy.

---

## 0. Cài đặt trước khi bắt đầu (chỉ cần làm 1 lần)

- **Node.js** bản >= 18 (khuyến nghị bản LTS) — kèm sẵn `npm`. Kiểm tra đã cài chưa: `node -v`.
- **MySQL Server** đang chạy được trên máy (XAMPP, MySQL Workbench, hoặc cài MySQL riêng đều được).
- Muốn chạy thử app mobile thì cần thêm **1 trong 2** cách sau:
  - **Điện thoại thật** + cài app **Expo Go** (tải từ Play Store/App Store), điện thoại và máy tính phải **cùng mạng Wi-Fi**. *(đơn giản nhất, khuyên dùng nếu chỉ cần xem/test nhanh)*
  - Hoặc **Android Studio** đã cài sẵn + đã tạo 1 máy ảo (AVD) trong Device Manager.

---

## 1. Chạy Website (backend)

### Bước 1 — Tạo database
Mở MySQL Workbench (hoặc công cụ quản lý MySQL bất kỳ), kết nối vào MySQL Server của bạn, mở và **chạy toàn bộ nội dung** file:
```
website_ReviewBooks/sql/database.sql
```
File này tự tạo database `review_books` và chèn sẵn dữ liệu mẫu (sách, tác giả, tài khoản...). Không cần tạo database thủ công trước.

### Bước 2 — Cấu hình kết nối
```
cd website_ReviewBooks
copy .env.example .env
```
Mở file `.env` vừa tạo bằng bất kỳ trình soạn thảo nào, chỉ cần sửa đúng 1 dòng:
```
DB_PASSWORD=mật_khẩu_mysql_của_bạn
```
Các dòng còn lại (`PORT`, `DB_HOST`, `DB_USER`, `DB_NAME`) giữ nguyên là chạy được ngay.

### Bước 3 — Cài đặt & khởi động
```
npm install
npm start
```
Mở trình duyệt tại **http://localhost:3001** — thấy trang chủ ReviewBooks hiện lên là backend đã chạy đúng.

> **Giữ cửa sổ terminal này chạy suốt** trong lúc dùng/test — tắt đi là cả website lẫn app mobile đều mất kết nối.

### Tài khoản có sẵn để đăng nhập thử
| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Admin | `admin` | `admin123` |
| User | `reader` | `user123` |

(còn vài tài khoản user khác được seed sẵn, xem chi tiết trong `sql/database.sql`)

---

## 2. Chạy App Mobile

Mở **một terminal mới** (đừng đóng terminal đang chạy website ở bước 1).

### Bước 1 — Cài đặt
```
cd mobile_ReviewBooks
npm install
```

### Bước 2 — Trỏ đúng địa chỉ backend
Mở file `mobile_ReviewBooks/src/api/config.ts`, sửa dòng `NATIVE_HOST` theo đúng cách bạn định test:

| Cách test | Giá trị `NATIVE_HOST` | Ghi chú |
|---|---|---|
| Android Emulator | `'10.0.2.2'` | Địa chỉ cố định, luôn trỏ về `localhost` của máy tính |
| Điện thoại thật (Expo Go) | IP LAN của máy tính, vd `'192.168.1.5'` | Lấy bằng lệnh `ipconfig` trong PowerShell, dòng **"IPv4 Address"**; phải cùng Wi-Fi với điện thoại |

### Bước 3 — Chạy app

**Nếu dùng Android Emulator:** mở máy ảo lên trước (Android Studio → Device Manager → ▶), rồi:
```
npm run android
```

**Nếu dùng điện thoại thật:**
```
npx expo start
```
Quét mã QR hiện ra bằng app **Expo Go** trên điện thoại.

> Ứng dụng chỉ target di động (Android/iOS qua Expo Go), không hỗ trợ chạy trên trình duyệt — đúng phạm vi đề bài (chỉ cần demo qua Expo Go), không kéo thêm kỹ thuật/dependency ngoài phạm vi các slide môn học.

### Nếu test bằng điện thoại thật mà không gọi được API
Windows Firewall mặc định chặn thiết bị khác trong mạng LAN gọi vào cổng 3001. Mở PowerShell **với quyền Administrator**, chạy 1 lần duy nhất:
```powershell
New-NetFirewallRule -DisplayName 'ReviewBooks Dev API 3001' -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow -Profile Private
```

---

## 3. Tóm tắt — mỗi lần muốn chạy lại từ đầu

1. Đảm bảo MySQL Server đang chạy.
2. Terminal 1: `cd website_ReviewBooks` → `npm start`
3. Terminal 2: `cd mobile_ReviewBooks` → `npm run android` (hoặc `npx expo start` rồi quét mã QR bằng Expo Go)

---

## 4. Cấu trúc thư mục tổng quan

```
webmobile/
  website_ReviewBooks/     Website + backend (Node/Express/EJS/MySQL) — xem README riêng bên trong để biết chi tiết kiến trúc/API
  mobile_ReviewBooks/      App di động (Expo/React Native/TypeScript)
  slide_web/, slide_mobile/  Tài liệu bài giảng môn học (tham khảo, không phải code project)
  Yeu cau BTL.pdf            Đề bài BTL gốc
```

---

## 5. Một số sự cố thường gặp

- **App mobile mở lên trắng hoặc báo lỗi kết nối:** kiểm tra terminal chạy website (bước 1) còn đang mở không.
- **Đăng nhập/gửi bình luận/liên hệ báo lỗi mạng:** kiểm tra lại `NATIVE_HOST` trong `mobile_ReviewBooks/src/api/config.ts` có đúng với cách đang test (emulator hay điện thoại thật) không.
- **Đổi Wi-Fi hoặc khởi động lại máy tính:** nếu test bằng điện thoại thật, IP LAN có thể đổi — chạy lại `ipconfig` và cập nhật `NATIVE_HOST`.
- **Sửa code mobile xong muốn kiểm tra có lỗi kiểu dữ liệu không:** chạy `npx tsc --noEmit` trong thư mục `mobile_ReviewBooks`.
