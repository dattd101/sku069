# Banner quảng cáo

Đặt ảnh và file `banners.xlsx` trong thư mục này.

Mở sheet `banners` và chỉnh các cột:

- `page`: số trang hiển thị (`1`, `2`, `3`...). Mỗi dòng chỉ áp dụng cho một trang. Để trống mặc định là trang 1.
- `slot`: `1` hoặc `2`, mỗi vị trí trên mỗi trang dùng một dòng.
- `image`: tên file ảnh trong cùng thư mục, ví dụ `banner-1.png`. Hỗ trợ PNG, JPG, WebP, GIF, AVIF, SVG.
- `url`: link đích đầy đủ bắt đầu bằng `https://` hoặc `http://`.
- `alt`: mô tả ảnh cho trình đọc màn hình.
- `enabled`: `TRUE` để bật, `FALSE` để tắt.

Các ảnh PNG đi kèm chỉ là ảnh mẫu; trang 1 và trang 2 có hai bộ ảnh riêng. Link đích được để trống; ảnh banner vẫn hiển thị. Nhập link thật để có thể bấm vào banner. Link trống hoặc không hợp lệ sẽ hiển thị ảnh không có liên kết. Dòng thiếu ảnh sẽ không hiển thị. Nếu trùng cả `page` và `slot`, lấy dòng hợp lệ đầu tiên. Trang chưa có cấu hình sẽ không hiển thị banner; không lấy banner của trang khác. Số trang không hợp lệ (âm, 0, số lẻ hoặc chữ) sẽ bị bỏ qua.

Banner 1 nằm ở ô thứ 5. Banner 2 là một thẻ `article.movieCard` rộng hai ô cuối hàng thứ 4 trên máy tính (ô 15–16). Trên màn hình 3 hoặc 2 cột, banner 2 vẫn ở cuối hàng thứ 4; trên điện thoại 1 cột, nằm ngay sau banner 1. Cả hai banner vẫn hiển thị tại vị trí cố định khi trang cuối có ít phim; không hiển thị khi không có kết quả. Vị trí giữ nguyên trên mỗi trang nhưng ảnh/link lấy theo cột `page`. Khi tìm kiếm, lọc nền tảng hoặc chọn “Được xem nhiều”, banner theo số trang hiện tại của kết quả. Quảng cáo không tính vào tổng phim hoặc giới hạn 15 phim/trang.

Link dùng `rel="no-index sponsored nofollow noopener noreferrer"`. Giá trị `no-index` được giữ theo yêu cầu nhưng không phải chỉ thị SEO có hiệu lực; `sponsored nofollow` đánh dấu liên kết quảng cáo. Không đặt noindex cho trang danh sách phim.

Sau khi sửa Excel hoặc ảnh, build/deploy lại như dữ liệu phim. Đây là thư mục public: không lưu thông tin bí mật trong Excel.

Ví dụ cấu hình:

| page | slot | image | url | enabled |
| --- | --- | --- | --- | --- |
| 1 | 1 | banner-1.png | | TRUE |
| 1 | 2 | banner-2.png | | TRUE |
| 2 | 1 | banner-page-2-1.png | | TRUE |
| 2 | 2 | banner-page-2-2.png | | TRUE |

Để thêm banner trang 3, thêm dòng `page = 3`, chọn `slot`, tên ảnh và link tương ứng. Banner không tạo thêm trang phim; số trang vẫn được tính từ danh sách phim, 15 phim/trang.
