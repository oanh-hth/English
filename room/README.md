# Phòng Trữ Đồ

Căn phòng nhỏ chứa mọi thứ bạn đã mua. Mỗi món là một đồ vật theo nhóm, kéo thả đặt ở đâu cũng được (2D hoặc 3D). App nhắc món sắp hết hạn, đọc hoá đơn từ ảnh hoặc chữ, và so sánh chi tiêu tháng này với tháng trước. Miso (mèo khó tính) chê khi bạn mua nhiều, Misu (cún hay lo xa) hỏi về những món nằm im.

Giao diện hoàn toàn bằng tiếng Việt, tiền tệ VND, không có máy chủ: dữ liệu lưu ngay trong trình duyệt.

## Chạy thử

Từ **thư mục gốc của repo** (vì `room/` dùng chung `../vendor/`):

```
python3 -m http.server 8000
# mở http://localhost:8000/room/
```

Đưa lên host tĩnh qua HTTPS (GitHub Pages, Netlify...) để cài lên điện thoại: trên iPhone mở bằng Safari, Chia sẻ, Thêm vào Màn hình chính.

## Có gì

- Căn phòng 2D và 3D, 16 nhóm đồ, thùng rác có Hoàn tác, nhấn giữ để nhân đôi, 6 kiểu phòng hoặc ảnh nền của bạn.
- Thêm món bằng tay hoặc từ hoá đơn (đơn Shopee, bill quán cà phê, hoá đơn siêu thị), luôn có bước xem lại.
- Nhắc hạn dùng, chi tiêu so sánh theo tháng, lịch sử theo khoảng thời gian.
- Miso và Misu với các quy tắc nhắc nhở; quy tắc mua lại món giống.
- Giao diện kawaii: đồ vật có mặt biết chớp mắt và đổi biểu cảm, hai bạn thú cưng ngồi trong phòng (2D và 3D), cửa sổ đổi theo giờ, cái cây héo khi bạn để đồ hết hạn, heo đất cho chi tiêu, điểm gọn gàng và huy hiệu, pháo giấy, âm thanh tuỳ chọn.
- Trên điện thoại: bảng trượt và thanh lối tắt thay cho trang dài.

## Tài liệu

Toàn bộ nằm trong [`docs/`](docs/README.md):

- [Hướng dẫn sử dụng](docs/user-guide.md)
- [Nhóm đồ và quy tắc](docs/rules.md)
- [Đọc hoá đơn](docs/bills.md)
- [Tài liệu kỹ thuật](docs/technical.md) (cấu trúc, dữ liệu, cách thêm nhóm hoặc kiểu phòng)
- [Nhật ký thay đổi](docs/changelog.md)

## Lưu ý

- Đọc **ảnh** hoá đơn khi chạy ngoài Claude cần khoá API Claude của chính bạn (nhập trong tab Từ hoá đơn). Khoá chỉ lưu trên máy và chỉ gửi tới Anthropic; đừng commit khoá vào repo. Dán chữ của hoá đơn thì không cần khoá.
- Thông báo hết hạn chỉ hiện khi app đang mở, vì app tĩnh không gửi được khi đã đóng.
- Dữ liệu ở trình duyệt của từng máy, chưa có sao lưu hay đồng bộ.
