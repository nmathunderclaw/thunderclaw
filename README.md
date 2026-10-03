<div align="center">

<img src="assets/logo.png" alt="NMA Thunder Claw logo" width="180">

<img src="assets/thunder-claw.svg" alt="THUNDER CLAW" width="100%">

**Website chính thức của đội robot NMA Thunderclaw · FTC 32807**

![HTML](https://img.shields.io/badge/HTML-5-26a4e6?style=flat-square)
![CSS](https://img.shields.io/badge/CSS-3-1e6fc2?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-6fdcff?style=flat-square&labelColor=0a2447)
![Supabase](https://img.shields.io/badge/Database-Supabase-0a2447?style=flat-square)
![Vercel](https://img.shields.io/badge/Hosting-Vercel-0a2447?style=flat-square)

</div>

---

## 📁 Cấu trúc

```
├── index.html          # Khung trang
├── style.css           # Giao diện
├── script.js           # Xử lý + kết nối Supabase + đăng nhập admin
├── supabase-setup.sql  # Tạo bảng, phân quyền, storage (chạy 1 lần)
└── assets/             # Ảnh dùng cho README
```

## 🚀 Chạy web

Web chỉ gồm file tĩnh, không cần cài đặt hay build gì.

- **Vercel:** đưa cả repo lên, Vercel tự deploy mỗi khi có commit mới.
- **Chạy thử trên máy:** mở `index.html` bằng trình duyệt.

## ⚙️ Cấu hình Supabase

1. Tạo project trên [Supabase](https://supabase.com).
2. Vào **Authentication → Users → Add user**, tạo tài khoản admin (tick *Auto Confirm User*).
3. Mở `supabase-setup.sql`, đổi `admin@example.com` thành email admin rồi chạy trong **SQL Editor**.
4. Mở `script.js`, điền 3 giá trị ở đầu phần cấu hình Supabase:

```js
const SB_URL = 'https://<project-id>.supabase.co';
const SB_ANON_KEY = '<anon public key>';
const SB_ADMIN_EMAIL = '<email admin>';
```

`SB_URL` và `SB_ANON_KEY` lấy ở **Project Settings → API**.

---

## ⚠️ Lưu ý

- **Chỉ dùng `anon public key`** trong `script.js`. **Tuyệt đối không** đưa `service_role key` lên GitHub hay vào code web, vì key đó có toàn quyền với database.
- **Chỉ 1 email có quyền admin.** Khách vào web chỉ xem được. Quyền ghi được chặn ở phía server (RLS), nên không thể mở quyền chỉnh sửa bằng cách sửa code trên trình duyệt.
- **Email admin phải khớp ở 2 nơi:** `SB_ADMIN_EMAIL` trong `script.js` và email trong `supabase-setup.sql`. Lệch nhau thì đăng nhập được nhưng không lưu được dữ liệu.
- **Tắt đăng ký tự do:** vào *Authentication → Sign In / Providers*, tắt **Allow new users to sign up**.
- **Mật khẩu admin** là mật khẩu của user trong Supabase, không phải mật khẩu Gmail. Không ghi mật khẩu vào code hay commit lên GitHub.
- **Dữ liệu và ảnh nằm trên Supabase** (bảng `docs` và bucket `site-assets`), không lưu trong trình duyệt. Xoá cache hay đổi máy không làm mất dữ liệu.
- **Giữ `index.html`, `style.css`, `script.js` cùng một thư mục** và đừng đổi tên `index.html`, nếu không Vercel báo `404 NOT_FOUND`.
- **Sau khi cập nhật code** mà web chưa đổi, bấm `Ctrl + Shift + R` để tải lại cứng, vì trình duyệt hay giữ bản cũ của CSS/JS và icon trên tab.
- **Gặp lỗi đăng nhập hoặc không có dữ liệu:** mở `F12 → Console` để xem thông báo lỗi.

---

<div align="center">

**NMA THUNDERCLAW · FTC 32807**

</div>
