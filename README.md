# Osa — Portfolio

Static site (HTML/CSS/JS thuần, không cần build step), nội dung nạp từ một file JSON,
kèm trang admin để chỉnh nội dung mà không phải sửa code.

## Cấu trúc

```
osa-portfolio/
├── index.html            trang chính (đọc nội dung từ data/content.json)
├── assets/
│   ├── css/style.css     style dùng chung cho trang chính + admin
│   └── js/main.js        render nội dung + menu/scroll-spy
├── data/
│   └── content.json      toàn bộ nội dung: profile, dự án, bài blog
├── admin/
│   ├── index.html        trang quản lý nội dung
│   ├── admin.css
│   └── admin.js
└── README.md
```

## Chạy thử ở máy
Vì trang chính `fetch` file `data/content.json`, mở trực tiếp bằng `file://` sẽ bị chặn
bởi trình duyệt (CORS). Chạy một server tĩnh đơn giản:
```
npx serve .
```
rồi mở `http://localhost:3000` (trang chính) và `http://localhost:3000/admin` (trang quản lý).

## Cách hoạt động của trang Admin

Đây vẫn là site tĩnh — **không có database, không có server** — nên admin không tự động
"live" cho mọi người xem ngay khi bạn sửa. Quy trình là:

1. Mở `/admin`, nhập mật khẩu (mặc định: `osa2026`, đổi trong `admin/admin.js`).
2. Sửa thông tin chung, avatar, dự án, bài blog. Mọi thay đổi tự lưu tạm vào
   `localStorage` của trình duyệt — refresh trang admin không mất dữ liệu.
3. Bấm **Xem trước** để mở trang chính ở tab mới với nội dung vừa sửa (chỉ hiện ở
   trình duyệt này, chưa lưu vào file).
4. Ưng ý thì bấm **Tải content.json** để tải file JSON mới.
5. Thay file đó vào `data/content.json` trong project, rồi deploy lại (git push, hoặc
   kéo thả lại thư mục vào Vercel) để mọi người thấy thay đổi.

`Nhập JSON` cho phép nạp lại một file `content.json` đã có (ví dụ để sửa tiếp trên máy khác).
`Khôi phục mặc định` nạp lại nội dung gốc trong `data/content.json`.

Avatar được lưu thẳng vào `content.json` dưới dạng base64 (không cần upload file ảnh
riêng lên server), nên chọn ảnh không quá nặng.

### Về bảo mật của trang Admin
Mật khẩu trong `admin.js` chỉ là lớp chặn ở trình duyệt — ai đọc source cũng thấy được,
không phải xác thực thật. Nếu không muốn người khác vào được `/admin`:
- Đơn giản nhất: đừng liên kết `/admin` từ trang chính, và có thể xoá thư mục `admin/`
  khỏi bản deploy công khai, chỉ giữ nó ở máy bạn để sinh file `content.json`.
- Chặt hơn: dùng tính năng Password Protection / Deployment Protection của Vercel (một
  số gói trả phí), hoặc thêm xác thực thật qua Vercel Serverless Function.

Nếu sau này muốn admin sửa xong là **hiện ngay cho mọi người** mà không cần tải file
rồi redeploy thủ công, cần thêm một backend thật (API + database, ví dụ Vercel KV,
Supabase...) — lúc đó có thể nâng cấp thêm, ngoài phạm vi bản tĩnh này.

## Deploy lên Vercel

**Cách 1 — kéo thả (nhanh nhất):**
1. Vào https://vercel.com/new
2. Kéo cả thư mục `osa-portfolio` vào ô upload
3. Deploy — static site, không cần cấu hình gì thêm

**Cách 2 — qua GitHub (khuyên dùng nếu cập nhật thường xuyên):**
1. Tạo repo mới, push nội dung thư mục này lên
2. Vào https://vercel.com/new → Import Git Repository → chọn repo → Deploy

**Cách 3 — Vercel CLI:**
```
npm i -g vercel
cd osa-portfolio
vercel
```

## Chỉnh sửa nhanh không qua Admin
Nếu chỉ sửa vài chữ, có thể mở thẳng `data/content.json` bằng text editor — cấu trúc
đơn giản: `profile` (thông tin, avatar, liên hệ), `projects` (mảng dự án), `posts` (mảng bài blog).
