# ReviewBooks — Mobile App

App di động của cùng đồ án ReviewBooks — gọi API của `website_ReviewBooks/` để lấy toàn bộ dữ liệu (không có dữ liệu mẫu/tĩnh nào trong app). Xây bằng **Expo + React Native + TypeScript**.

File này giải thích tổ chức thư mục, luồng chạy và công cụ đã dùng — để đồng đội đọc hiểu code nhanh và chuẩn bị bảo vệ đồ án. Hướng dẫn cài đặt/chạy chi tiết xem ở [README gốc](../README.md). Bối cảnh quyết định kiến trúc (vì sao chọn Expo/JWT/React Navigation...) xem [PLAN.md](PLAN.md).

---

## 1. Công nghệ sử dụng

| Công cụ | Vai trò | Vì sao dùng được (không tính là "thư viện sẵn") |
|---|---|---|
| **Expo + React Native** | Nền tảng dựng app di động | Framework nền tảng bắt buộc phải có để viết RN, giống việc dùng Node.js/Express bên web |
| **TypeScript** | Ngôn ngữ | Bắt buộc do dùng template `blank-typescript`, chỉ là ngôn ngữ, không phải thư viện hành vi |
| **React Navigation** (`@react-navigation/native`, `native-stack`, `bottom-tabs`) | Điều hướng giữa các màn hình | Được dạy chính thức trong giáo trình môn học (slide "08. Navigation") — coi là kiến thức nền tảng, không phải "thư viện làm tắt" 1 tính năng cụ thể |
| **`@react-native-async-storage/async-storage`** | Lưu JWT token trên máy | Được dạy trong slide "10. Data Storage", ví dụ mẫu của slide dùng đúng key `"user-token"` |
| `fetch` (có sẵn của React Native) | Gọi API | Không dùng axios — đúng kỹ thuật dạy ở slide "11. Networking" |
| `useState`/`useEffect`/`useContext` (React core) | Quản lý state, thay Redux | Dạy ở slide "05. Hooks" |

**Mọi hành vi giao diện/tương tác đều tự viết**, không dùng UI kit hay thư viện làm tắt tính năng nào: sao đánh giá (`StarRatingDisplay`/`StarRatingInput`), dropdown lọc/sắp xếp (`Dropdown`), banner thông báo (`Banner`), loading/rỗng (`LoadingSpinner`/`EmptyState`), cuộn vô hạn (`InfiniteScrollFooter`)... `package.json` chỉ có đúng các dependency kể trên — không có gì khác (không axios, không UI kit, không thư viện star-rating có sẵn).

---

## 2. Tổ chức thư mục

```
mobile_ReviewBooks/
├── App.tsx                 Điểm khởi động: bọc các Provider theo đúng thứ tự + render RootNavigator
├── index.ts                 Entry point chuẩn của Expo (registerRootComponent)
├── app.json                  Cấu hình Expo (tên app, icon, splash...)
└── src/
    ├── types/                  Định nghĩa kiểu dữ liệu TypeScript khớp đúng field API trả về
    │   ├── Book.ts, Comment.ts, Review.ts, Category.ts, User.ts, Contact.ts, Pagination.ts, Auth.ts, ApiResponse.ts
    │   └── index.ts               Barrel — nơi duy nhất các file khác import type (`from '../types'`)
    │
    ├── api/                     Tầng gọi backend (tương đương services/ bên web)
    │   ├── config.ts               API_BASE_URL — 1 chỗ duy nhất chỉnh địa chỉ backend (emulator/điện thoại thật/web)
    │   ├── client.ts                 apiRequest() — fetch wrapper trung tâm: gắn header Authorization, parse JSON, ném lỗi có message
    │   ├── authApi.ts, booksApi.ts, categoriesApi.ts, reviewsApi.ts, contactApi.ts
    │   │                              Mỗi file 1 nhóm endpoint, chỉ gọi apiRequest() — không tự fetch() trực tiếp ở đây
    │
    ├── context/                 State dùng chung toàn app (thay Redux)
    │   ├── AuthContext.tsx           user, token, login/register/logout/updateUsername; tự khôi phục phiên đăng nhập lúc mở app
    │   └── AppMessageContext.tsx      State cho banner thông báo thành công/lỗi toàn cục
    │
    ├── navigation/              Điều hướng (React Navigation)
    │   ├── RootNavigator.tsx         Rẽ nhánh: chưa đăng nhập → AuthStack, đã đăng nhập → MainTabs
    │   ├── AuthStack.tsx               Login → Register
    │   ├── MainTabs.tsx                 5 tab dưới: Trang chủ / Sách / Đánh giá / Liên hệ / Tài khoản
    │   ├── CustomTabBar.tsx              Giao diện thanh tab tự vẽ (không dùng thanh tab dựng sẵn của React Navigation) — mô phỏng đúng thanh nav của website
    │   ├── BookStack.tsx                 Stack con trong tab "Sách": BookList → BookDetail
    │   └── types.ts                       Khai báo kiểu tham số cho từng route (typed navigation)
    │
    ├── screens/                 8 màn hình nghiệp vụ (xem mục 5)
    │   ├── HomeScreen.tsx, LoginScreen.tsx, RegisterScreen.tsx
    │   ├── BookListScreen.tsx, BookDetailScreen.tsx
    │   ├── ContactScreen.tsx, AccountScreen.tsx, ReviewsFeedScreen.tsx
    │
    ├── components/              Khối giao diện tái sử dụng, tự viết hoàn toàn
    │   ├── BookCard.tsx                Thẻ sách (ảnh bìa + tên + tác giả + sao) dùng ở Trang chủ và Book List
    │   ├── StarRatingDisplay.tsx        Hiển thị sao (chỉ đọc); prop `showValue` để ẩn số điểm (dùng khi hiện đánh giá của từng người — chỉ điểm trung bình của cả sách mới hiện số)
    │   ├── StarRatingInput.tsx           Chọn sao 1-5 (chạm để chọn), chỉ dùng trong CommentForm
    │   ├── CommentForm.tsx                Form gửi/sửa bình luận + đánh giá
    │   ├── CommentItem.tsx                 1 dòng bình luận, hiện nút sửa/xoá nếu là bình luận của mình
    │   ├── Dropdown.tsx                     Dropdown tự viết (Modal + FlatList) — dùng cho lọc thể loại/sắp xếp (Book List) và sắp xếp (Reviews Feed)
    │   ├── SearchInput.tsx                   Ô tìm kiếm có nút "✕" tự hiện khi có chữ để xoá nhanh
    │   ├── TextField.tsx                      Input có nhãn, dùng ở mọi form
    │   ├── PrimaryButton.tsx                   Nút chính, có trạng thái loading
    │   ├── Banner.tsx                           Banner thông báo thành công/lỗi toàn cục
    │   ├── LoadingSpinner.tsx, EmptyState.tsx     Trạng thái đang tải / không có dữ liệu
    │   └── InfiniteScrollFooter.tsx                Footer "đang tải thêm" cho cuộn vô hạn
    │
    ├── theme/                   Token thiết kế, đồng bộ với public/css/base.css bên web
    │   └── colors.ts, spacing.ts, typography.ts
    │
    └── utils/
        ├── validation.ts           Mirror luật validate của utils/validation.js bên web (báo lỗi ngay trên app, không cần chờ API)
        ├── storage.ts                Lưu/đọc/xoá JWT token qua AsyncStorage
        └── formatDate.ts              Định dạng ngày giờ tiếng Việt
```

---

## 3. Luồng chạy app

### 3.1. Khởi động (`App.tsx`)

```
App.tsx
 └─ SafeAreaProvider
     └─ AppMessageProvider        (banner toàn cục)
         └─ AuthProvider          (useEffect đọc token đã lưu trong AsyncStorage)
             │                       → có token: gọi GET /api/auth/me để xác nhận còn hợp lệ
             │                       → token hỏng/hết hạn: tự xoá, coi như chưa đăng nhập
             ├─ Banner
             ├─ RootNavigator     (đang kiểm tra phiên → LoadingSpinner
             │                     user != null → MainTabs
             │                     user == null → AuthStack)
             └─ StatusBar
```

### 3.2. Điều hướng

```
Chưa đăng nhập:  AuthStack → Login ⇄ Register
Đã đăng nhập:    MainTabs (Trang chủ | Sách | Đánh giá | Liên hệ | Tài khoản)
                            Sách = BookStack → BookList → BookDetail
```
`RootNavigator` tự chuyển qua lại giữa `AuthStack`/`MainTabs` ngay khi `AuthContext.user` đổi giá trị (đăng nhập/đăng xuất) — không cần gọi `navigate()` thủ công để "sang màn login".

Thanh tab dưới cùng chỉ hiện **chữ** (không dùng icon) để giữ giao diện tối giản, dễ đọc — tab đang chọn có thêm 1 tam giác nhỏ (`TabActiveIndicator.tsx`) phía trên chữ để phân biệt.

### 3.3. Luồng dữ liệu (mọi màn hình đều theo mẫu này)

```
Screen (vd. BookDetailScreen)
  useEffect → gọi hàm trong api/*.ts (vd. booksApi.getBook(id))
    → api/client.ts::apiRequest()      gắn header Authorization: Bearer <token>, gọi fetch tới API_BASE_URL + path
      → Backend (website_ReviewBooks) xử lý, trả { success, data, message }
    → apiRequest() bóc data ra, hoặc ném lỗi bằng message nếu success=false
  useState cập nhật → re-render giao diện
```
Không màn hình nào tự chứa dữ liệu mẫu — toàn bộ nội dung (sách, tác giả, bình luận, đánh giá, tài khoản) đều lấy qua API kể trên; phần tĩnh duy nhất là câu chữ giao diện (tiêu đề, mô tả app, thông tin liên hệ tĩnh) — giống hệt cách website cũng hardcode các đoạn này trong EJS.

---

## 4. Cơ chế xác thực trên mobile

1. `LoginScreen` gọi `authApi.login()` → nhận `{ user, token }` từ backend.
2. `AuthContext.login()` lưu `token` vào `AsyncStorage` (`utils/storage.ts`) và gọi `setAuthToken()` (`api/client.ts`) để mọi request sau đó tự gắn header `Authorization: Bearer <token>`.
3. Mỗi lần mở app (`AuthContext` mount), tự đọc token đã lưu, gọi `GET /api/auth/me` để xác nhận còn hợp lệ và khôi phục `user` — nên **không cần đăng nhập lại mỗi lần mở app**.
4. Khi đổi tên hiển thị (`AccountScreen` → `PATCH /api/auth/me`), backend ký lại token mới (vì JWT không lưu trạng thái ở server) — app phải lưu đè token mới, nếu không token cũ vẫn mang tên cũ tới khi hết hạn (7 ngày).
5. Đăng xuất: gọi `authApi.logout()`, xoá token khỏi `AsyncStorage` và bộ nhớ, `AuthContext.user` về `null` → `RootNavigator` tự chuyển về `AuthStack`.

---

## 5. Danh sách màn hình & chức năng

| Màn hình | Chức năng | API dùng |
|---|---|---|
| **HomeScreen** | Banner giới thiệu + 6 sách được ưa thích nhất (theo đánh giá) | `GET /api/books?sort=rating` |
| **LoginScreen** | Đăng nhập | `POST /api/auth/login` |
| **RegisterScreen** | Đăng ký tài khoản mới | `POST /api/auth/register` |
| **BookListScreen** | Tìm kiếm, lọc thể loại, sắp xếp, cuộn vô hạn | `GET /api/books`, `GET /api/categories` |
| **BookDetailScreen** | Thông tin chi tiết, bình luận công khai, gửi/sửa/xoá bình luận + đánh giá (bắt buộc đăng nhập) | `GET /api/books/:id`, `.../comments`, `POST`/`PUT`/`DELETE .../comments` |
| **ContactScreen** | Thông tin liên hệ tĩnh + form gửi ý kiến (tự điền tên/email nếu đã đăng nhập) | `POST /api/contact` |
| **AccountScreen** | Đổi tên hiển thị, đổi mật khẩu, đăng xuất | `PATCH /api/auth/me`, `POST /api/auth/password` |
| **ReviewsFeedScreen** ("Tất cả đánh giá") | Feed toàn bộ bình luận của mọi sách, tìm kiếm (tên người/tên sách/nội dung) + sắp xếp (mới/cũ nhất, đánh giá cao/thấp) | `GET /api/reviews` |

---

## 6. Đối chiếu yêu cầu BTL (Mobile app)

| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Giao tiếp với website bằng API | ✅ | Toàn bộ qua `/api/*`, xác thực bằng JWT |
| Màn hình chính | ✅ | HomeScreen |
| Màn hình đăng nhập | ✅ | LoginScreen (+ RegisterScreen) |
| Màn hình hiển thị nội dung | ✅ | BookListScreen + BookDetailScreen |
| Cho phép bình luận, đánh giá | ✅ | Form trong BookDetailScreen, yêu cầu đăng nhập |
| Màn hình ý kiến và liên hệ | ✅ | ContactScreen |
| Thiết kế và trình bày giao diện | ✅ | Theme đồng bộ với website (`theme/colors.ts` lấy từ `public/css/base.css`) |
| Tổ chức project | ✅ | Tách lớp `screens/api/components/context/navigation` rõ ràng |
| Copy hoặc dùng thư viện sẵn (-10) | ✅ tránh được | Chỉ dùng đúng các công cụ ở mục 1, có căn cứ từ slide môn học |
| Admin | Không làm | Rubric mobile không yêu cầu — quyết định chủ động, xem PLAN.md |

Ngoài rubric tối thiểu, app còn làm thêm **Đăng ký, Tài khoản (đổi tên/mật khẩu), Tất cả bình luận** để bám sát đầy đủ chức năng của website.

---

## 7. Ghi chú chuẩn bị bảo vệ đồ án

- **"Vì sao dùng React Navigation mà không tự viết điều hướng?"** — Vì giáo trình môn học dạy chính thức React Navigation (slide "08. Navigation") với ví dụ Tab-lồng-Stack giống hệt cách app này tổ chức (`MainTabs` chứa `BookStack`) — coi là kiến thức nền tảng được học, không phải thư viện "làm tắt" một tính năng cụ thể.
- **"Vì sao dùng JWT + AsyncStorage mà không dùng cookie như web?"** — App di động không quản lý cookie tin cậy như trình duyệt. JWT + AsyncStorage là đúng kỹ thuật dạy ở slide "11. Networking" và "10. Data Storage".
- **"App lấy dữ liệu từ đâu, có hardcode gì không?"** — Không có dữ liệu mẫu nào trong code; mọi màn hình đều gọi qua tầng `api/*.ts` → backend thật (xem mục 3.3).
- **"Vì sao ảnh bìa sách trong app không bị vỡ/crop?"** — Dùng `resizeMode="contain"` cho mọi `<Image>` hiển thị bìa sách, hiển thị đủ ảnh gốc thay vì crop cho đầy khung.
- **"Không có màn hình Admin thì có thiếu yêu cầu không?"** — Không, rubric Mobile app trong đề bài không yêu cầu Admin (khác với Website) — đây là quyết định phạm vi chủ động, không phải thiếu sót.
