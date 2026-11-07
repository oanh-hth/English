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
- **Mua lại thì món cũ coi như hết**: khi bạn thêm một món giống món đã mua ở tháng trước (cùng tên hoặc tên gần giống, ví dụ "Sữa tươi 1L" và "Sữa tươi tiệt trùng"; hoặc cùng nhóm Đồ cho bé, Chăm sóc cá nhân, Đồ vệ sinh, ví dụ bỉm tã khác hãng), món cũ được tự động đánh dấu "Đã thay bằng món mới". Món đó rời khỏi phòng, không còn bị nhắc hạn dùng hay nhắc nằm im, và tiền mua vẫn nằm trong chi tiêu. Có nút Hoàn tác, và công tắc ở cuối trang để tắt rule. Các nhóm khác (rau củ, đồ khô, đồ uống, sữa & trứng...) chỉ tính khi tên giống nhau, vì mua táo không có nghĩa là hết cam. Mua hai lần trong cùng một tháng thì không tính, vì có thể bạn đang tích trữ.
- **Miso**: bé mèo khó tính, bình luận theo số món bạn mua, số món trong phòng và số món hết hạn. Miso cũng chê **theo từng nhóm**: nếu trong 7 ngày gần nhất bạn mua cùng một nhóm vào từ 5 ngày khác nhau trở lên thì Miso nhắc nhẹ (ví dụ "5 ngày trong tuần bạn đều mua đồ uống"), đủ 7/7 ngày thì chê nặng ("Bạn là cá hay sao mà uống dữ vậy?"). Mỗi nhóm có câu chê riêng, trừ nhóm Mua tặng. Ngưỡng nằm ở `HABIT_MIN_DAYS` trong `app.js`.
- **Nằm im lâu rồi**: liệt kê món còn trong phòng mà chưa đụng tới quá lâu (tính từ ngày mua, hoặc lần bấm "Vừa dùng" gần nhất). Đồ thường: hơn 30 ngày. **Quần áo**: hơn 90 ngày (3 tháng). **Mua tặng**: Misu không bao giờ nhắc. Riêng món **còn hạn dùng** thì Misu không nhắc nặng lời, chỉ hỏi "Bạn dùng chưa?" với hai nút **Dùng rồi** (tính lại thời gian nằm im) và **Chưa dùng** (Misu hỏi lại sau 30 ngày). Món đã quá hạn thì vẫn nằm trong danh sách như thường, và phần nhắc hạn dùng lo chuyện hết hạn. Món nằm im có huy hiệu "zZ" trong phòng. Misu, bé cún hay lo xa, nhắc bạn về chúng. Mỗi món có nút Vừa dùng (tính lại từ hôm nay), Dùng hết rồi và Tìm.

## Đọc ảnh hoá đơn
Khi chạy ngoài Claude, cần khoá API Claude của chính bạn (nhập ở **Thêm vào phòng → Từ hoá đơn → Khoá API Claude**). Khoá chỉ lưu trong `localStorage` của trình duyệt này và chỉ được gửi tới Anthropic. Ảnh được thu nhỏ còn tối đa 1600px trước khi gửi. Đừng commit khoá vào repo. Nếu không muốn dùng khoá, bạn vẫn dán được chữ của hoá đơn.

## Thông báo
Đây là web app tĩnh, nên thông báo chỉ hiện khi bạn mở app (tối đa một lần mỗi ngày), không đẩy được khi app đang đóng. Muốn nhắc khi đóng app thì cần thêm máy chủ gửi Web Push, hoặc làm bản app điện thoại.

## Dữ liệu
Lưu trong `localStorage` (khoá `phongtrudo.v1`), chỉ trên máy này. Chưa có tài khoản hay đồng bộ giữa các máy. Lần đầu mở app, phòng trống; bấm "Xem thử với dữ liệu mẫu" để xem thử.

## Tệp
`index.html`, `styles.css`, `app.js` (một module, không cần build), `sw.js` (chạy offline), `manifest.webmanifest`, `icons/`.

## Nhóm đặc biệt
- **Mua tặng**: đồ bạn mua để tặng người khác, không phải để tự xài. Misu không nhắc về nhóm này, và rule "mua lại thì món cũ coi như hết" cũng bỏ qua nhóm này. Tiền mua vẫn được tính trong chi tiêu, và nhắc hạn dùng vẫn chạy nếu món có hạn. App không tự đoán nhóm này; bạn chọn tay (khi đọc hoá đơn bằng Claude, Claude chỉ chọn khi hoá đơn ghi rõ là quà).
- **Quần áo**: tự nhận diện qua từ như áo, quần, váy, giày, dép, nón. Riêng "bỉm tã quần" vẫn là Đồ cho bé.
