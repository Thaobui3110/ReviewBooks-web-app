# Kế hoạch: ReviewBooks Mobile App (Expo + TypeScript)

**Trạng thái: ĐÃ DUYỆT — đang triển khai.** Xem `.claude` task list trong phiên làm việc để theo dõi tiến độ từng bước.

Nguồn tham chiếu:
- `D:/webmobile/Yeu cau BTL.pdf` — rubric chấm điểm gốc.
- `D:/webmobile/website_ReviewBooks/` — website đã hoàn thành, dùng làm chuẩn đối chiếu chức năng.
- `D:/webmobile/slide_mobile/*.pdf` — 14 slide môn học, đã đọc toàn bộ để xác định phạm vi kiến thức được phép dùng (xem mục "Vì sao JWT không vi phạm mục phạt -10" bên dưới).

---

## Context

Website `website_ReviewBooks` (trước đây `ReviewBooks_website_v2`) đã hoàn thành, đáp ứng đầy đủ rubric phần Website. Bước tiếp theo là xây phần Mobile app của cùng BTL.

**Quá trình đi tới bản plan này:** Sau khi thảo luận nhiều vòng, phát hiện một file `CLAUDE của Mão.md` (tạo ở phiên làm việc khác) đưa ra nhiều quyết định riêng cho mobile (auth không token, đúng 5 màn hình, chỉ 1 Stack Navigator, AsyncStorage). Theo chỉ đạo của người dùng, chỉ áp dụng **nguyên tắc "phạm vi kiến thức"** của file đó (chỉ dùng kỹ thuật có trong slide), không áp dụng các quyết định cụ thể khác — thay vào đó đã cho đọc trực tiếp toàn bộ 14 file slide `slide_mobile/*.pdf` để xác định chính xác cái gì thực sự được dạy, rồi đề xuất lại từ đầu.

## Quyết định đã chốt

| Vấn đề | Quyết định | Căn cứ |
|---|---|---|
| Ngôn ngữ | TypeScript | Bắt buộc do dùng template `blank-typescript` |
| Cách khởi tạo | `npx create-expo-app@latest <tên> --template blank-typescript`, chạy `npm run web/android`, `npm start` | Slide "03. React Native" trang khởi tạo |
| **Auth API** | **JWT thật**: backend thêm `jsonwebtoken`, ký token lúc login (`jwt.sign`), xác minh qua header `Authorization` (`jwt.verify`) | Slide "11. Networking" dạy nguyên phần "Token-based Session Management" + "JSON Web Token (JWT)" với code mẫu `npm install jsonwebtoken`, `jwt.sign(data, SECRET, {expiresIn})`, đọc `req.get('Authorization')`, `jwt.verify(token, SECRET, cb)` |
| **Lưu token ở mobile** | `AsyncStorage` (`@react-native-async-storage/async-storage`) | Slide "10. Data Storage" dạy đầy đủ `setItem/getItem/multiSet/multiGet/removeItem`, ví dụ mẫu của chính slide dùng đúng key `"user-token"` |
| Navigation | React Navigation: 1 Tab Navigator (bottom tabs) ở ngoài, mỗi tab chứa 1 Stack Navigator riêng khi cần (vd. tab "Sách" = Stack BookList→BookDetail); Auth (Login/Register) là 1 Stack riêng hiện khi chưa đăng nhập | Slide "08. Navigation" dạy đủ Stack/Drawer/Tab + ví dụ lồng Tab-trong-Stack, bài tập cuối slide yêu cầu làm 3 tab |
| State | `useState` + `useContext`/`createContext` | Slide "05. Hooks" dạy đầy đủ 2 hook này với ví dụ Context hoàn chỉnh |
| Networking | `fetch` (GET/POST, header, JSON body) | Slide "11. Networking" trang 6-8 |
| Phạm vi màn hình | **8 màn hình — đầy đủ như web**: Home, Login, Register, BookList, BookDetail (+bình luận/đánh giá + sửa/xoá bình luận của mình), Contact, Account (đổi tên/mật khẩu), ReviewsFeed | Quyết định của người dùng — ưu tiên bám sát 100% chức năng web |
| Phạm vi Admin | Không làm | Rubric mobile không yêu cầu |
| Vị trí project | `D:/webmobile/mobile_ReviewBooks/`, song song `website_ReviewBooks/` | Khớp cấu trúc thư mục hiện tại |

### Vì sao JWT không vi phạm mục phạt -10

Slide "11. Networking" dạy **cả 2 phía** của JWT trong cùng 1 bài — phía client (gửi/lưu token) và phía server (`jsonwebtoken`, `jwt.sign`, `jwt.verify`, đọc header `Authorization`) — vì bài học là về giao tiếp mobile↔server. Việc thêm `jsonwebtoken` vào `package.json` của `website_ReviewBooks` (server mà mobile gọi tới) chính là implement đúng nửa "server" của bài học đó, không phải một thư viện ngoài phạm vi.

---

## Phần 0 — Vá backend (làm trước tiên)

Toàn bộ thay đổi là **thêm mới**, tái dùng service layer sẵn có. Website hiện đã chuẩn hoá response dạng `{ success, data, message }` — mọi endpoint mới phải theo đúng format này.

### 0.1. Cài đặt
```
npm install jsonwebtoken
```

### 0.2. File mới `utils/token.js`
```js
const jwt = require('jsonwebtoken');
const SECRET = process.env.SESSION_SECRET;
const EXPIRES_IN = '7d';

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
```

### 0.3. `routes/api/index.js` — middleware toàn cục
Thêm 1 `router.use(...)` chạy trước khi mount sub-router: đọc token từ header `Authorization`, verify, gán `req.session.user` nếu hợp lệ và session cookie chưa có sẵn. `middleware/apiAuth.js`, `booksApi.js`, `commentsApi.js`, `contactApi.js` giữ nguyên không đổi.

### 0.4. `routes/api/authApi.js`
- `POST /login`: trả thêm `token: signToken(user)` trong field `data`.
- Thêm `PATCH /me`: tái dùng `validateProfileUpdate` + `userService.updateUsername(id, username, sessionUser)`. Response trả **token mới** (username đổi thì phải ký lại token).
- Thêm `POST /password`: tái dùng `validatePasswordChange` + `userService.changePassword(id, currentPassword, newPassword)`.

### 0.5. `routes/api/booksApi.js`
Thêm `PUT /:id/comments/:commentId` và `DELETE /:id/comments/:commentId`, mô phỏng logic kiểm tra quyền sở hữu ở `routes/web/publicRoutes.js`, tái dùng `commentService.getCommentById/updateComment/deleteComment`.

### 0.6. CORS tối giản cho `/api/*`
Set header CORS thủ công trong `app.js` (không cài package `cors`) để `npm run web` của mobile gọi được API.

### 0.7. Kiểm thử bằng curl trước khi đụng vào mobile
```
curl -X POST http://localhost:3001/api/auth/login -d "username=reader&password=user123"
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer <token>"
curl -X PUT .../api/books/1/comments/5 -H "Authorization: Bearer <token>" -d "content=...&rating=4"
curl -X PATCH .../api/auth/me -H "Authorization: Bearer <token>" -d "username=new_name"
```
Sau đó regression-check trên web thật (cookie): đăng nhập, sửa/xoá bình luận, đổi tên/mật khẩu, gửi contact — phải hoạt động y hệt trước khi vá.

---

## Phần 1 — Khởi tạo project Expo + TypeScript

1. `cd D:/webmobile`
2. `npx create-expo-app@latest mobile_ReviewBooks --template blank-typescript` (mặc định lấy SDK mới nhất)
3. `cd D:/webmobile/mobile_ReviewBooks`
4. **Hạ về đúng SDK 54 (yêu cầu của người dùng):**
   ```
   npx expo install expo@54.0.0
   npx expo install --fix
   ```
   Lệnh đầu ghim `expo` về `54.0.0`; lệnh sau tự đồng bộ lại toàn bộ package liên quan (`react`, `react-native`, `react-native-screens`, `react-native-safe-area-context`, `@types/react`, `typescript`...) về đúng version tương thích SDK 54. Kết quả cuối: `expo ~54.0.35`, `react-native 0.81.5`, `react/react-dom 19.1.0`, `typescript ~5.9.2`.
5. `npm run web` → chạy thử trong trình duyệt trước (đồng ý cài `react-native-web`/`@expo/metro-runtime` khi được hỏi).
6. `npx expo start` (hoặc `npm start`) → Metro bundler + QR code.
7. `npm run android` → cần emulator/điện thoại bật debug.
8. Cài package đã có căn cứ:
   ```
   npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
   ```
   (nếu làm sau bước 4, `expo install` sẽ tự chọn đúng version tương thích SDK 54, không cần làm lại bước hạ SDK)

**Kết nối backend:** Android Emulator `http://10.0.2.2:3001`; điện thoại thật qua Expo Go dùng LAN IP máy tính; `npm run web` dùng `http://localhost:3001`. Gom vào `src/api/config.ts`.

---

## Phần 2 — Cấu trúc project

```
mobile_ReviewBooks/
  App.tsx
  app.json / tsconfig.json / babel.config.js / package.json
  assets/

  src/
    types/
      Book.ts / Comment.ts / Review.ts / Category.ts / User.ts
      Contact.ts / Pagination.ts / ApiResponse.ts / Auth.ts / index.ts

    api/
      config.ts / client.ts / authApi.ts / booksApi.ts
      categoriesApi.ts / reviewsApi.ts / contactApi.ts

    context/
      AuthContext.tsx / AppMessageContext.tsx

    navigation/
      types.ts / RootNavigator.tsx / AuthStack.tsx / MainTabs.tsx / BookStack.tsx

    screens/
      HomeScreen.tsx / LoginScreen.tsx / RegisterScreen.tsx
      BookListScreen.tsx / BookDetailScreen.tsx / ContactScreen.tsx
      AccountScreen.tsx / ReviewsFeedScreen.tsx

    components/
      BookCoverImage.tsx / StarRatingDisplay.tsx / StarRatingInput.tsx
      BookCard.tsx / CommentItem.tsx / CommentForm.tsx
      TextField.tsx / PrimaryButton.tsx / Banner.tsx
      LoadingSpinner.tsx / EmptyState.tsx / InfiniteScrollFooter.tsx

    theme/
      colors.ts / spacing.ts / typography.ts

    utils/
      validation.ts / formatDate.ts / storage.ts
```

---

## Phần 3 — Trình tự công việc

**Giai đoạn 0 — Backend:** vá + test curl + regression-check web.

**Giai đoạn 1 — Scaffold:** khởi tạo Expo, `theme/colors.ts`, `api/config.ts`, `api/client.ts`, test kết nối `GET /api/categories`.

**Giai đoạn 2 — Điều hướng & xác thực:** `utils/storage.ts` + `AuthContext.tsx` (hydrate token), `RootNavigator.tsx` + `AuthStack.tsx`, `LoginScreen.tsx` + `RegisterScreen.tsx`.

**Giai đoạn 3 — Nội dung chính:** `BookCoverImage.tsx`, `BookStack.tsx` + `BookListScreen.tsx`, `BookDetailScreen.tsx` (info + bình luận + form + sửa/xoá), `HomeScreen.tsx`, `MainTabs.tsx`.

**Giai đoạn 4 — Màn hình còn lại:** `ContactScreen.tsx`, `AccountScreen.tsx` (đổi tên/mật khẩu/đăng xuất, test token mới lưu đúng), `ReviewsFeedScreen.tsx`.

**Giai đoạn 5 — Hoàn thiện:** rà đồng bộ theme/component, kiểm tra `package.json`.

---

## Phần 4 — Kiểm thử/đối chiếu rubric

- **API/xác thực (2đ):** web (cookie) vẫn hoạt động sau khi vá; JWT login/me qua curl; mobile giữ đăng nhập sau khi tắt mở lại app; test cả role `user` và `admin`.
- **Nội dung theo mã (0.5đ):** mở nhiều sách khác nhau, cả ảnh `.svg` và `.png` thật.
- **Bình luận/đánh giá (0.5đ):** gửi từ app, thấy ngay trên app và web; chưa đăng nhập không thấy form; sửa/xoá bình luận người khác bị từ chối.
- **Liên hệ (1đ):** gửi thành công cả khi đăng nhập và khi là khách.
- **Trang chủ/Đăng nhập (1đ/1đ):** đăng ký → đăng nhập trên app từ đầu đến cuối.
- **Giao diện & tổ chức project (1đ/1đ):** rà theme đồng bộ; cấu trúc thư mục đúng Phần 2.
- **Không thư viện thừa (-10):**
  - Website: `package.json` chỉ thêm đúng `jsonwebtoken` so với 5 dependency gốc.
  - Mobile: `npm ls --depth=0` chỉ thấy core Expo/React/React Native + đúng 6 package đã liệt kê ở Phần 1 bước 7.

---

## File quan trọng cần sửa/tạo

- `D:/webmobile/website_ReviewBooks/routes/api/index.js` — middleware đọc JWT từ header `Authorization`
- `D:/webmobile/website_ReviewBooks/routes/api/authApi.js` — login trả token; thêm `PATCH /me`, `POST /password`
- `D:/webmobile/website_ReviewBooks/routes/api/booksApi.js` — thêm `PUT`/`DELETE` cho comment
- `D:/webmobile/website_ReviewBooks/utils/token.js` (tạo mới)
- `D:/webmobile/website_ReviewBooks/services/userService.js:69-84` — tái dùng nguyên trạng
- `D:/webmobile/website_ReviewBooks/routes/web/publicRoutes.js` — mẫu logic quyền sở hữu bình luận
- `D:/webmobile/mobile_ReviewBooks/src/api/client.ts` (tạo mới)
- `D:/webmobile/mobile_ReviewBooks/src/navigation/RootNavigator.tsx` (tạo mới)
