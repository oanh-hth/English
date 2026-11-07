# Phòng Trữ Đồ

Căn phòng nhỏ chứa mọi thứ bạn đã mua. Mỗi món là một đồ vật theo nhóm, kéo thả đặt ở đâu cũng được. App nhắc món sắp hết hạn, đọc hoá đơn từ ảnh hoặc chữ, và so sánh chi tiêu tháng này với tháng trước. Miso, bé mèo khó tính, sẽ chê bạn mua nhiều.

Giao diện hoàn toàn bằng tiếng Việt. Tiền tệ là VND.

## Chạy thử
Không cần build, không có backend. Từ thư mục gốc của repo:
```
python3 -m http.server 8000   # rồi mở http://localhost:8000/room/
```
Thư mục `room/` dùng chung `../vendor/anthropic-sdk.js` với app tiếng Anh ở thư mục gốc, nên hãy phục vụ cả repo, đừng chỉ phục vụ riêng `room/`.

Đưa lên GitHub Pages hoặc host tĩnh nào cũng được (cần HTTPS). Trên iPhone: mở bằng Safari, **Chia sẻ → Thêm vào Màn hình chính**.

## Tính năng
- **Căn phòng**: kéo thả món đi đâu cũng được, phím mũi tên để nhích, thùng rác để xoá (có Hoàn tác). Lọc theo nhóm.
- **Thêm món**: nhập tay (tên, nhóm, hạn dùng, giá, ngày mua, số lượng) hoặc từ hoá đơn.
- **Hoá đơn**: chụp ảnh hoặc ảnh màn hình rồi để Claude đọc, hoặc dán chữ. Có sẵn bộ đọc cho đơn Shopee, bill quán cà phê (STT / Tên món / SL / Đơn giá / Thành tiền) và hoá đơn siêu thị. Số tiền tính là "Thành tiền" cuối cùng. Luôn có bước xem lại trước khi thêm.
- **Nhắc hạn dùng**: banner, danh sách "Sắp hết hạn", số trên chuông, và thông báo của trình duyệt.
- **Chi tiêu**: tháng này so với cùng kỳ tháng trước, biểu đồ cộng dồn theo ngày. "Dùng hết rồi" vẫn giữ tiền trong chi tiêu, còn xoá bằng thùng rác thì bỏ luôn.
- **Lịch sử mua sắm**: xem theo Tất cả, Tháng này, Tháng trước, 30 ngày qua hoặc khoảng ngày tự chọn, kèm tổng tiền theo nhóm.
- **Miso**: bình luận theo số món bạn mua, số món trong phòng và số món hết hạn.

## Đọc ảnh hoá đơn
Cần khoá API Claude của chính bạn (nhập ở **Thêm vào phòng → Từ hoá đơn → Khoá API Claude**). Khoá chỉ lưu trong `localStorage` của trình duyệt này và chỉ được gửi tới Anthropic. Ảnh được thu nhỏ còn tối đa 1600px trước khi gửi. Đừng commit khoá vào repo. Nếu không muốn dùng khoá, bạn vẫn dán được chữ của hoá đơn.

## Thông báo
Đây là web app tĩnh, nên thông báo chỉ hiện khi bạn mở app (tối đa một lần mỗi ngày), không đẩy được khi app đang đóng. Muốn nhắc khi đóng app thì cần thêm máy chủ gửi Web Push, hoặc làm bản app điện thoại.

## Dữ liệu
Lưu trong `localStorage` (khoá `phongtrudo.v1`), chỉ trên máy này. Chưa có tài khoản hay đồng bộ giữa các máy. Lần đầu mở app, phòng trống; bấm "Xem thử với dữ liệu mẫu" để xem thử.

## Tệp
`index.html`, `styles.css`, `app.js` (một module, không cần build), `sw.js` (chạy offline), `manifest.webmanifest`, `icons/`.
