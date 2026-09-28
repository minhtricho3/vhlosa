# Osa — Portfolio

Site tĩnh (HTML/CSS/JS thuần, không build step). Mỗi trang là một folder riêng
(clean URL, không dùng `#anchor`), nội dung nạp từ một file JSON dùng chung,
kèm trang admin để chỉnh nội dung + bật/tắt chế độ bảo trì.

## Cấu trúc

```
osa-portfolio/
├── index.html            Trang chủ — hero + teaser của các trang khác
├── about/index.html      /about   — Giới thiệu
├── work/index.html       /work    — Dự án
├── blog/index.html       /blog    — Blog
├── contact/index.html    /contact — Liên hệ
├── assets/
│   ├── css/style.css     style dùng chung: layout, hiệu ứng glow/blur, maintenance screen
│   └── js/
│       ├── site.js         load content.json, active-nav theo path, kiểm tra bảo trì
│       ├── particles.js    canvas hạt + đường nối, nền toàn site
│       ├── page-home.js    render riêng cho trang chủ
│       ├── page-about.js
│       ├── page-work.js
│       ├── page-blog.js
│       └── page-contact.js
├── data/
│   └── content.json      toàn bộ nội dung: site (bảo trì), profile, projects, posts
├── admin/
│   ├── index.html        trang quản lý nội dung
│   ├── admin.css
│   └── admin.js
├── vercel.json            bật clean URL (/about thay vì /about.html hay /about/)
└── README.md
```

Mỗi trang con (`about/`, `work/`, `blog/`, `contact/`) là một folder độc lập với
`index.html` riêng — không phải section `#id` trong một trang duy nhất. Điều hướng
dùng URL thật (`/about`, `/work`...), không dùng hash (`#about`).

## Chạy thử ở máy
Các trang `fetch` file `data/content.json`, nên mở trực tiếp bằng `file://` sẽ bị
trình duyệt chặn (CORS). Chạy một server tĩnh đơn giản ở thư mục gốc:
```
npx serve .
```
rồi mở `http://localhost:3000`. Điều hướng bằng menu trên trang thay vì gõ tay URL,
để chắc route được phục vụ đúng.

## Hiệu ứng hình ảnh
- Nền có canvas hạt (particles.js) trôi nhẹ và nối đường khi ở gần nhau, cộng thêm
  2 quầng sáng mờ (blur) trôi chậm phía sau nội dung — tất cả tự tắt animation nếu
  hệ điều hành bật "reduce motion".
- Các thẻ dự án, tag kỹ năng, dòng blog dùng kính mờ (glass: nền trong suốt + blur)
  thay vì nền phẳng.
- Nút chính, node đánh dấu section, avatar, tiêu đề hero có glow màu cam/ngọc theo
  bảng màu chính.

Muốn giảm bớt: chỉnh biến `--glow-*` hoặc bỏ opacity trong `.ambient .blob` /
`#bg-particles` ở `assets/css/style.css`.

## Cách hoạt động của trang Admin

Vẫn là site tĩnh — không có database, không có server — nên admin không tự động
"live" cho mọi người xem ngay khi sửa. Quy trình:

1. Mở `/admin`, nhập mật khẩu (mặc định: `osa2026`, đổi trong `admin/admin.js`).
2. Sửa thông tin chung, avatar, dự án, bài blog. Thay đổi tự lưu tạm vào
   `localStorage` trình duyệt — refresh trang admin không mất dữ liệu.
3. Bấm một trong các nút **Xem trước** (Trang chủ / Giới thiệu / Dự án / Blog /
   Liên hệ) để mở đúng trang đó ở tab mới với nội dung vừa sửa — chỉ hiện ở trình
   duyệt này, chưa lưu vào file.
4. Ưng ý thì bấm **Tải content.json**.
5. Thay file đó vào `data/content.json` trong project, deploy lại (git push, hoặc
   kéo thả lại thư mục vào Vercel) để mọi người thấy thay đổi.

`Nhập JSON` nạp lại một file `content.json` đã có. `Khôi phục mặc định` nạp lại nội
dung gốc trong `data/content.json`. Avatar lưu thẳng vào JSON dạng base64 (không cần
upload ảnh lên đâu khác), nên chọn ảnh không quá nặng.

### Chế độ bảo trì
Mục **Chế độ bảo trì** ở đầu trang admin có công tắc bật/tắt + ô nhập thông báo.
Khi bật, tất cả các trang công khai sẽ thay toàn bộ nội dung bằng một màn hình
"Đang bảo trì" hiển thị thông báo đó. Đây cũng đi qua cùng quy trình
sửa → tải `content.json` → thay file → deploy lại như trên — bật công tắc trong
admin không lập tức ẩn site cho người khác cho tới khi bạn deploy bản `content.json`
mới.

### Về bảo mật của trang Admin
Mật khẩu trong `admin.js` chỉ là lớp chặn ở trình duyệt — ai đọc source cũng thấy,
không phải xác thực thật. Nếu không muốn người khác vào được `/admin`:
- Đơn giản nhất: đừng liên kết `/admin` từ trang chính, và có thể bỏ thư mục
  `admin/` khỏi bản deploy công khai, chỉ giữ nó ở máy bạn để sinh `content.json`.
- Chặt hơn: dùng Password Protection / Deployment Protection của Vercel (một số
  gói trả phí), hoặc thêm xác thực thật qua Vercel Serverless Function.

Nếu sau này muốn sửa xong là **hiện ngay** cho mọi người mà không cần tải file rồi
redeploy thủ công, cần thêm một backend thật (API + database, ví dụ Vercel KV,
Supabase...) — ngoài phạm vi bản tĩnh này.

## Deploy lên Vercel

**Cách 1 — Vercel Drop (nhanh nhất, không cần Git/CLI):**
1. Vào https://vercel.com/drop
2. Kéo thả thư mục project (hoặc file `.zip`) vào trang, chọn team + đặt tên project, bấm Deploy
3. `index.html` phải nằm ngay ở gốc thư mục/zip; `vercel.json` đã bật `cleanUrls`, không cần cấu hình thêm

Lưu ý: mỗi lần Drop tạo ra một project mới, không deploy đè lên project cũ. Vì quy trình
admin cần redeploy mỗi khi đổi `content.json`, nếu sửa thường xuyên nên dùng Cách 2 hoặc 3.

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
Có thể mở thẳng `data/content.json` bằng text editor — cấu trúc: `site` (bảo trì),
`profile` (thông tin, avatar, liên hệ), `projects` (mảng dự án), `posts` (mảng bài blog).
