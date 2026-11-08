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
- **Phòng 3D**: nút **Xem 3D** trên căn phòng chuyển sang căn phòng ba chiều (three.js, tải lần đầu khi bạn bấm). Mỗi món là một vật thể 3D dựng từ các khối đơn giản theo nhóm (quả táo, hộp sữa có mái, chai, lon, lọ thuốc, bình bơm, bình xịt, laptop gập, gói bỉm có quai, áo thun, hộp quà có nơ, thùng hàng), có bóng trên sàn, huy hiệu hết hạn và "zZ" nổi phía trên. Kéo vào chỗ trống để xoay phòng, cuộn chuột để zoom, **Góc nhìn gốc** để đặt lại. Kéo món để dời trên sàn, nhấn giữ để nhân đôi, kéo vào thùng rác để xoá, chạm để xem chi tiết, giống hệt chế độ 2D. Vị trí món dùng chung giữa 2D và 3D (món trên kệ 2D nằm trên kệ 3D). Kiểu phòng làm sẵn và ảnh nền đều áp dụng sang 3D (ảnh của bạn thành bức tường phía sau). Thư viện nằm ở `vendor/three.min.js` (three.js r128, giấy phép MIT, `vendor/three.LICENSE`) nên chạy offline được.
- **Món có sẵn**: lần đầu mở app, phòng đã có 10 món mẫu (sữa, trứng, rau, gạo, dầu gội, áo thun, một món quà...) để bạn có cái xem ngay. Nút **Thêm vài món có sẵn** ở cuối trang thêm lại các món đó (không thêm trùng tên). **Nạp dữ liệu mẫu đầy đủ** thay toàn bộ bằng bộ dữ liệu lớn để thử mọi tính năng.
- **Đổi giao diện phòng**: nút **Đổi phòng** ở góc trên bên phải căn phòng mở bảng chọn 6 kiểu làm sẵn (Phòng sáng, Bạc hà mát, Hồng kẹo, Gỗ ấm, Hoàng hôn, Đêm yên tĩnh) hoặc **Tải ảnh của bạn lên** để làm nền phòng. Ảnh được thu nhỏ còn tối đa 1600px rồi lưu trong `localStorage` của máy này (không gửi đi đâu), có thanh "Làm dịu ảnh" phủ lớp trắng nhẹ để đồ trong phòng dễ nhìn, và nút Xoá ảnh. Chọn lại một kiểu làm sẵn thì ảnh vẫn được giữ, bấm "Ảnh của bạn" để quay lại. Thêm kiểu mới thì thêm một dòng vào `ROOMS` trong `app.js`.
- **Nhân đôi**: nhấn giữ một món khoảng nửa giây (hoặc bấm phím D, hoặc nút Nhân đôi ở chi tiết món) để mua thêm một món y chang. Bản sao có ngày mua là hôm nay, hạn dùng giữ nguyên thời gian sử dụng so với món gốc, và tiền mua được tính thêm vào chi tiêu. Có Hoàn tác. Nhân đôi không kích hoạt rule "mua lại thì món cũ coi như hết", vì bạn muốn có hai món.
- **Thêm món**: nhập tay (tên, nhóm, hạn dùng, giá, ngày mua, số lượng) hoặc từ hoá đơn.
- **Hoá đơn**: chụp ảnh hoặc ảnh màn hình rồi để Claude đọc, hoặc dán chữ. Có sẵn bộ đọc cho đơn Shopee, bill quán cà phê (STT / Tên món / SL / Đơn giá / Thành tiền) và hoá đơn siêu thị. Số tiền tính là "Thành tiền" cuối cùng. Luôn có bước xem lại trước khi thêm.
- **Nhắc hạn dùng**: banner, danh sách "Sắp hết hạn", số trên chuông, và thông báo của trình duyệt.
- **Chi tiêu**: tháng này so với cùng kỳ tháng trước, biểu đồ cộng dồn theo ngày. "Dùng hết rồi" vẫn giữ tiền trong chi tiêu, còn xoá bằng thùng rác thì bỏ luôn.
- **Lịch sử mua sắm**: xem theo Tất cả, Tháng này, Tháng trước, 30 ngày qua hoặc khoảng ngày tự chọn, kèm tổng tiền theo nhóm.
- **Mua lại thì món cũ coi như hết**: khi bạn thêm một món giống món đã mua ở tháng trước (cùng tên hoặc tên gần giống, ví dụ "Sữa tươi 1L" và "Sữa tươi tiệt trùng"; hoặc cùng nhóm Đồ cho bé, Chăm sóc cá nhân, Đồ vệ sinh, ví dụ bỉm tã khác hãng), món cũ được tự động đánh dấu "Đã thay bằng món mới". Món đó rời khỏi phòng, không còn bị nhắc hạn dùng hay nhắc nằm im, và tiền mua vẫn nằm trong chi tiêu. Có nút Hoàn tác, và công tắc ở cuối trang để tắt rule. Các nhóm khác (rau củ, đồ khô, đồ uống, sữa & trứng...) chỉ tính khi tên giống nhau, vì mua táo không có nghĩa là hết cam. Mua hai lần trong cùng một tháng thì không tính, vì có thể bạn đang tích trữ.
- **Miso**: bé mèo khó tính, bình luận theo số món bạn mua, số món trong phòng và số món hết hạn. Miso cũng chê **theo từng nhóm**. Ngay trong một ngày, nếu bạn mua cùng một nhóm từ 2 lần riêng biệt trở lên (mỗi lần thêm bằng tay là một lần, cả một hoá đơn tính là một lần) thì Miso cảnh báo luôn, ngay khi bạn thêm món (ngưỡng `DAILY_MIN` trong `app.js`). Còn theo tuần: nếu trong 7 ngày gần nhất bạn mua cùng một nhóm vào từ 5 ngày khác nhau trở lên thì Miso nhắc nhẹ (ví dụ "5 ngày trong tuần bạn đều mua đồ uống"), đủ 7/7 ngày thì chê nặng ("Bạn là cá hay sao mà uống dữ vậy?"). Mỗi nhóm có câu chê riêng, trừ nhóm Mua tặng. Ngưỡng nằm ở `HABIT_MIN_DAYS` trong `app.js`.
- **Nằm im lâu rồi**: liệt kê món còn trong phòng mà chưa đụng tới quá lâu (tính từ ngày mua, hoặc lần bấm "Vừa dùng" gần nhất). Đồ thường: hơn 30 ngày. **Quần áo, Len, Dụng cụ, Văn phòng phẩm**: hơn 90 ngày (3 tháng). **Mua tặng**: Misu không bao giờ nhắc. Riêng món **còn hạn dùng** thì Misu không nhắc nặng lời, chỉ hỏi "Bạn dùng chưa?" với hai nút **Dùng rồi** (tính lại thời gian nằm im) và **Chưa dùng** (Misu hỏi lại sau 30 ngày). Món đã quá hạn thì vẫn nằm trong danh sách như thường, và phần nhắc hạn dùng lo chuyện hết hạn. Món nằm im có huy hiệu "zZ" trong phòng. Misu, bé cún hay lo xa, nhắc bạn về chúng. Mỗi món có nút Vừa dùng (tính lại từ hôm nay), Dùng hết rồi và Tìm.

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

## Trên điện thoại
Màn hình hẹp (từ 820px trở xuống) không xếp mọi khung dọc theo trang nữa. Trang chỉ còn căn phòng, Miso và các nhóm lọc, còn mọi khung khác nằm trong các **bảng trượt từ dưới lên**, mở bằng thanh lối tắt cố định ở đáy màn hình: **Nhắc hạn** (có số món cần chú ý), **Chi tiêu**, **Thêm** (nút tròn ở giữa: nhập tay hoặc từ hoá đơn), **Lịch sử** và **Misu** (có số món nằm im). Nút **Đổi phòng** và chuông ở đầu trang cũng mở bảng tương ứng. Chạm vào một món trong phòng thì bảng chi tiết món tự trượt lên. Bảng nằm phía trên thanh lối tắt nên chuyển qua lại giữa các bảng bằng một chạm. Đóng bảng bằng nút Xong, chạm vào vùng mờ hoặc phím Esc. Thêm món xong, hoặc bấm Tìm, thì bảng tự đóng để bạn thấy căn phòng. Trên máy tính bố cục hai cột vẫn như cũ.

## Nhóm Mỹ phẩm, Dụng cụ, Văn phòng phẩm, Len
Bốn nhóm mới, mỗi nhóm có hình 2D, mô hình 3D riêng (thỏi son và hộp phấn, hộp dụng cụ, cốc bút có bút chì, cuộn len có kim đan) và câu chê riêng của Miso (theo ngày và theo tuần). Khi đọc hoá đơn, app tự đoán nhóm qua từ khoá tiếng Việt và tiếng Anh (son, mascara, nước hoa, mặt nạ / búa, tua vít, băng keo / bút, vở, giấy, kẹp / len, kim đan). "Áo len" vẫn là Quần áo, "giấy vệ sinh" là Đồ vệ sinh, "sợi mì" là Đồ khô. Misu nhắc các nhóm này như nhóm thường (hơn 30 ngày); nhóm Mỹ phẩm không nằm trong rule "mua lại thì món cũ coi như hết" như Chăm sóc cá nhân. Mở app lần đầu giờ lưu ngay bộ món có sẵn để chúng không bị tạo lại mỗi lần tải trang.

## Cập nhật nhóm (16 nhóm)
- **Chăm sóc & mỹ phẩm**: gộp Chăm sóc cá nhân và Mỹ phẩm làm một (hình chai bơm cùng thỏi son và hộp phấn). Món đã lưu ở nhóm Mỹ phẩm tự chuyển sang nhóm gộp khi mở app. Vì nhóm này giờ gồm cả dầu gội lẫn son, nó **không còn** tính rule "mua lại thì món cũ coi như hết" theo nhóm (chỉ còn khi tên giống nhau); Đồ cho bé và Đồ vệ sinh vẫn tính theo nhóm.
- **Đồ ăn vặt** (mới): hình gói bim bim, mô hình 3D có thêm cái kẹo. App đoán nhóm qua từ như bim bim, kẹo, socola, bánh quy, hạt điều, mứt, snack, cookie. "Bánh mì" vẫn là Đồ khô. Miso có câu chê riêng cho nhóm này.
- **Len, Dụng cụ, Văn phòng phẩm**: Misu nhắc sau hơn 90 ngày thay vì 30.
- Sửa lỗi nhận nhầm: "bim bim" không còn bị coi là bỉm (Đồ cho bé).
