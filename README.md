# Osa — Portfolio

Trang cá nhân dạng one-page, HTML/CSS/JS thuần (không cần build step).

## Cấu trúc
- `index.html` — nội dung: Trang chủ, Giới thiệu, Dự án, Blog, Liên hệ
- `style.css` — toàn bộ style
- `script.js` — menu mobile + highlight mục nav đang xem

## Chạy thử ở máy
Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy:
```
npx serve .
```

## Deploy lên Vercel

**Cách 1 — kéo thả (nhanh nhất):**
1. Vào https://vercel.com/new
2. Kéo cả thư mục `osa-portfolio` vào ô upload
3. Deploy — không cần cấu hình gì thêm, vì đây là static site thuần

**Cách 2 — qua GitHub (khuyên dùng nếu sẽ cập nhật thường xuyên):**
1. Tạo repo mới trên GitHub, push nội dung thư mục này lên
2. Vào https://vercel.com/new, chọn "Import Git Repository"
3. Chọn repo vừa tạo → Deploy (Vercel tự nhận đây là static site)

**Cách 3 — Vercel CLI:**
```
npm i -g vercel
cd osa-portfolio
vercel
```

## Những chỗ nên sửa trước khi public
- Email và link GitHub/LinkedIn trong phần Liên hệ (`index.html`, section `#contact`)
- Nội dung Giới thiệu + danh sách kỹ năng
- 3 dự án mẫu trong phần Dự án (tên, mô tả, tag công nghệ, link)
- 3 bài viết mẫu trong phần Blog — hiện link đang là `#` placeholder
