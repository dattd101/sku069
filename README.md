# Movie Blog - Next.js 15

Blog danh sách phim/tập phim từ Facebook, YouTube và TikTok.

## Stack

- Next.js 15.5.21 / App Router
- React 19
- TypeScript
- SheetJS 0.20.3 để đọc Excel
- GitHub + Vercel
- Ảnh local: `public/uploads/`
- Light theme
- Redirect phiên truy cập sau 180 phút
- Vercel WAF Rate Limit để giảm bot/request bất thường

## Dữ liệu Excel

File: `data/movies.xlsx`

### Sheet `movies`

- `id`: ID cố định của phim, ví dụ `phim-001`
- `slug`: URL đẹp, ví dụ `chuyen-tinh-mua-ha`
- `title`: tiêu đề phim
- `image`: ví dụ `/uploads/youtube-demo.webp`
- `description`: mô tả ngắn
- `category`: thể loại

### Sheet `episodes`

- `id`: ID tập
- `movie_id`: liên kết tới cột `id` trong sheet `movies`
- `episode`: số tập
- `title`: tên tập
- `url`: link Facebook / YouTube / TikTok
- `platform`: `facebook`, `youtube`, hoặc `tiktok`

## Chạy trên Mac

Nếu bạn đã chạy bản ZIP cũ, nên xoá cache/dependency cũ:

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

## Redirect sau 180 phút

Component: `components/SessionRedirect.tsx`

Mặc định:

```text
180 phút -> https://www.youtube.com/@trannguyenanhduong0803
```

Thời gian bắt đầu được lưu trong `sessionStorage`, vì vậy reload và chuyển giữa các trang phim trong cùng tab không reset bộ đếm. Khi hết thời gian, website dùng `window.location.replace()` để chuyển sang YouTube.

Nếu muốn đổi mà không sửa component, copy `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

Sau đó chỉnh:

```env
NEXT_PUBLIC_SESSION_REDIRECT_MINUTES=180
NEXT_PUBLIC_SESSION_REDIRECT_URL=https://www.youtube.com/@trannguyenanhduong0803
```

## Giới hạn traffic: 200 request/phút/IP trên Vercel

Không cần Redis và không cần viết rate limiter trong Next.js. Nên chặn ở Vercel Firewall để request vượt giới hạn bị xử lý trước khi vào application.

Sau khi deploy project lên Vercel:

1. Mở project trên Vercel.
2. Vào **Firewall** -> **Configure**.
3. Chọn **New Rule** / tạo Custom Rule.
4. Đặt tên ví dụ: `Rate limit web traffic`.
5. Điều kiện nên áp dụng cho request trang của website. Nếu giao diện Vercel cho phép lọc theo path, ưu tiên `/` và `/phim/*`; không cần giới hạn riêng ảnh trong `/uploads/*` hoặc asset `/_next/*`.
6. Bật **Rate Limit** theo source/client với ngưỡng **200 requests trong 1 minute**.
7. Action khi vượt giới hạn: **Rate Limit / 429 Too Many Requests**.
8. Save / Publish rule.

Lưu ý: Rate limit là giới hạn số request từ cùng một nguồn trong khoảng thời gian, không phải chính xác 200 người đang online. Cách này phù hợp hơn với mục tiêu chống refresh/bot tạo tải bất thường.

## Thêm phim

1. Thêm thumbnail vào `public/uploads/`.
2. Thêm 1 dòng vào sheet `movies`.
3. Dùng `id` của phim đó làm `movie_id` cho các dòng trong sheet `episodes`.
4. Commit + push GitHub.
5. Vercel tự build/deploy lại.

## Deploy Vercel

Import repository GitHub vào Vercel. Project không cần database để hiển thị phim/tập phim.

Nếu dùng biến môi trường redirect trên Vercel, khai báo hai biến `NEXT_PUBLIC_SESSION_REDIRECT_MINUTES` và `NEXT_PUBLIC_SESSION_REDIRECT_URL`, sau đó redeploy.


## Phân trang

Trang Home hiển thị tối đa **30 phim / trang**. Search và filter được áp dụng trước khi phân trang.

## Hydration warning do browser extension

Nếu DevTools/Next.js báo hydration mismatch với thuộc tính như `cz-shortcut-listen="true"`, đây thường là thuộc tính được browser extension chèn vào HTML trước khi React hydrate. `app/layout.tsx` đã thêm `suppressHydrationWarning` ở `html` và `body` để tránh overlay cảnh báo kiểu này.

## Favicon

Project có `app/icon.svg` theo phong cách biểu tượng Next.js (nền tròn đen, chữ N trắng). Next.js App Router tự nhận metadata icon từ file này.
