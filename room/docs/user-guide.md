# Hướng dẫn sử dụng

## 1. Mở app lần đầu

Lần đầu mở, phòng đã có 15 món có sẵn (sữa, trứng, rau cải, nước cam, gạo, vitamin C, dầu gội, nước rửa chén, áo thun, một món quà, son dưỡng môi, bánh quy, bộ tua vít, hộp bút, len) để bạn có cái xem ngay. Bạn xoá hoặc sửa tuỳ ý. Nếu muốn bắt đầu trống, xoá từng món bằng thùng rác, hoặc bấm **Xoá hết dữ liệu** ở cuối trang (bấm hai lần để xác nhận).

Cuối trang có hai nút nạp lại dữ liệu:

- **Thêm vài món có sẵn**: thêm bộ 15 món trên, bỏ qua món trùng tên.
- **Nạp dữ liệu mẫu đầy đủ**: thay toàn bộ bằng bộ dữ liệu lớn (37 món, trải từ vài tháng trước tới hôm nay, có cả tình huống để Miso và Misu lên tiếng) để thử mọi tính năng. Nút này thay hết dữ liệu hiện có nên cần bấm hai lần.

## 2. Căn phòng

Mỗi món là một đồ vật theo nhóm (táo cho rau củ, hộp sữa cho sữa & trứng, chai cho đồ uống...).

| Thao tác | Kết quả |
| --- | --- |
| Chạm hoặc bấm vào món | Chọn món, hiện tên và chi tiết |
| Kéo món | Dời đi chỗ khác (đâu cũng được) |
| Nhấn giữ khoảng nửa giây không di chuyển | Nhân đôi món (bản sao có ngày mua là hôm nay) |
| Kéo món vào thùng rác ở góc dưới bên trái | Xoá món và tiền của nó (có **Hoàn tác** trong 8 giây) |
| Chọn món rồi bấm thùng rác | Xoá món đang chọn |
| Phím mũi tên khi đang chọn món (chế độ 2D) | Nhích món từng chút |
| Phím **D** khi đang chọn món (chế độ 2D) | Nhân đôi |

Huy hiệu trên món: **!** màu đỏ là đã hết hạn; số kiểu **2d** màu cam là sắp hết hạn (còn 2 ngày); **zZ** là món nằm im lâu.

**Lọc theo nhóm:** hàng nút nhóm dưới căn phòng. Bấm một nhóm để chỉ làm nổi món thuộc nhóm đó, bấm lại để bỏ lọc.

**Xem 3D:** nút ở góc trên bên phải căn phòng. Kéo vào chỗ trống để xoay, cuộn chuột để zoom, **Góc nhìn gốc** để đặt lại. Kéo, chọn, nhân đôi và thùng rác hoạt động như ở 2D. Lần đầu bấm cần mạng để tải thư viện 3D (bản trong repo có sẵn thư viện nên chạy offline).

**Đổi phòng:** xem mục 9.

## 3. Thêm món

Bấm **Thêm vào phòng** (trên điện thoại là nút tròn **Thêm** ở thanh dưới). Có hai tab.

### Nhập tay

| Ô | Ý nghĩa |
| --- | --- |
| Tên món | Bắt buộc |
| Nhóm | Chọn một trong 16 nhóm (mặc định Sữa & trứng) |
| Hạn dùng | Tuỳ chọn, bỏ trống nếu món không có hạn |
| Giá đã trả | Tổng tiền cho cả dòng (nếu mua 6 chai thì là tiền của cả 6) |
| Ngày mua | Mặc định hôm nay; ảnh hưởng đến chi tiêu theo tháng |
| Số lượng | Mặc định 1 |

Bấm **Đặt vào phòng**: món rơi vào một chỗ trống trong phòng, bạn kéo đi đâu tuỳ ý.

### Từ hoá đơn

1. **Chọn ảnh** hoặc kéo ảnh vào khung (ảnh chụp bill, ảnh màn hình đơn Shopee). Có thể thêm vài ảnh của cùng một lần mua.
2. Bấm **Đọc hoá đơn**. Claude đọc ảnh và trả về danh sách món.
3. Xem lại bảng kết quả: sửa tên, giá, nhóm, hạn dùng; bỏ tick món không muốn thêm.
4. Nếu là bill quán ăn uống (đã ăn hoặc uống rồi), tick **Đã ăn hoặc uống rồi** để chỉ tính vào chi tiêu mà không đặt vào phòng.
5. Bấm **Thêm N món**.

Không có ảnh? Mở **Không có ảnh? Dán chữ của hoá đơn vào đây**, dán chữ (hoặc chọn một ví dụ) và bấm **Đọc đoạn chữ đã dán**.

Cách đọc từng kiểu hoá đơn, số tiền lấy từ đâu, đọc ảnh cần gì: xem [Đọc hoá đơn](bills.md).

## 4. Chi tiết một món

Chạm vào món để mở chi tiết (trên điện thoại là bảng trượt lên). Bạn thấy tên, nhóm, ghi chú (ví dụ phân loại của Shopee), ngày mua, giá và tình trạng hạn dùng, cùng các nút:

| Nút | Làm gì | Tiền vẫn tính trong chi tiêu? |
| --- | --- | --- |
| Ngày hết hạn (ô nhập) | Sửa hoặc thêm hạn dùng | Có |
| **Nhân đôi** | Mua thêm một món y chang | Có, tính thêm tiền |
| **Vừa dùng** | Ghi nhận bạn vừa dùng, Misu tính lại thời gian nằm im | Có |
| **Dùng hết rồi** | Món rời phòng nhưng vẫn nằm trong lịch sử | Có |
| **Xoá** | Xoá hẳn món và tiền của nó (có Hoàn tác) | Không, tiền bị bỏ |

Muốn món biến khỏi phòng mà vẫn giữ tiền đã mua (ví dụ rau đã hỏng phải vứt) thì dùng **Dùng hết rồi**, không dùng **Xoá**.

## 5. Nhắc hạn dùng

- Ô **Nhắc mình** ở đầu trang chọn nhắc trước 2, 3, 5, 7 hoặc 14 ngày.
- Món đã hết hạn hoặc còn trong khoảng nhắc xuất hiện ở banner vàng, ở danh sách **Sắp hết hạn** (nút **Tìm** nhảy tới món trong phòng) và ở con số trên chuông.
- **Bật thông báo**: cho phép thông báo của trình duyệt. App chỉ gửi **khi bạn mở app**, tối đa một lần mỗi ngày, vì app chạy hoàn toàn trên máy bạn nên không gửi được khi đã đóng. Nút **Gửi thử một thông báo** để kiểm tra.

## 6. Chi tiêu và lịch sử

**Chi tiêu** cho biết tháng này đã chi bao nhiêu, so với cùng những ngày đầu của tháng trước (ví dụ 1 đến 8 tháng này so với 1 đến 8 tháng trước) và với cả tháng trước, kèm biểu đồ cộng dồn theo ngày. Tiền tính theo **ngày mua**.

**Lịch sử mua sắm** liệt kê mọi món (kể cả món đã dùng hết) theo một khoảng thời gian: Tất cả, Tháng này, Tháng trước, 30 ngày qua hoặc Tự chọn. Mỗi khoảng cho tổng tiền, tiền theo từng nhóm và danh sách món (mới nhất trước). Khi chọn khoảng khác Tất cả, món ngoài khoảng đó mờ đi trong phòng. Chạm một dòng để nhảy tới món trong phòng.

## 7. Miso và Misu

**Miso** (mèo khó tính) nằm dưới căn phòng và nói về chuyện *mua*: mua nhiều lần trong ngày, mua cùng một nhóm nhiều ngày trong tuần, mua nhanh hơn tháng trước, phòng quá đầy, đồ hết hạn. Bấm **Chê tiếp đi** (hoặc chạm vào mặt mèo) để nghe câu khác.

**Misu** (cún hay lo xa) ở mục **Nằm im lâu rồi** và nói về chuyện *dùng*: món mua đã lâu mà chưa đụng tới. Mỗi món có nút **Vừa dùng**, **Dùng hết rồi** và **Tìm**. Với món còn hạn dùng, Misu chỉ hỏi *Bạn dùng chưa?* với nút **Dùng rồi** và **Chưa dùng** (Misu hỏi lại sau 30 ngày). Món trong nhóm **Mua tặng** thì Misu không bao giờ nhắc.

Ngưỡng cụ thể của từng nhân vật: xem [Nhóm đồ và quy tắc](rules.md).

## 8. Mua lại món giống

Khi bạn thêm một món giống món đã mua ở tháng trước (cùng tên hoặc tên gần giống, hoặc cùng nhóm Đồ cho bé, Đồ vệ sinh), món cũ tự chuyển sang **Đã thay bằng món mới**: rời phòng, không còn bị nhắc hạn hay nhắc nằm im, tiền vẫn nằm trong chi tiêu. Có nút **Hoàn tác**. Tắt hẳn bằng ô chọn **Mua lại món giống tháng trước thì tính món cũ là đã hết** ở cuối trang. Nhân đôi không kích hoạt quy tắc này.

## 9. Đổi giao diện phòng

Bấm **Đổi phòng**. Có 6 kiểu làm sẵn: Phòng sáng, Bạc hà mát, Hồng kẹo, Gỗ ấm, Hoàng hôn, Đêm yên tĩnh. Hoặc **Tải ảnh của bạn lên** để làm nền phòng 2D (trong 3D, ảnh thành bức tường phía sau). Thanh **Làm dịu ảnh** phủ lớp trắng nhẹ để đồ dễ nhìn. **Xoá ảnh** bỏ ảnh. Chọn lại một kiểu làm sẵn thì ảnh vẫn được giữ, bấm ô **Ảnh của bạn** để quay lại. Ảnh được thu nhỏ rồi lưu trên máy, không gửi đi đâu.

## 10. Trên điện thoại

Từ chiều rộng 820 px trở xuống, trang chỉ giữ căn phòng, Miso và hàng nhóm lọc. Mọi khung khác nằm trong **bảng trượt từ dưới lên**, mở bằng thanh lối tắt ở đáy màn hình:

| Nút | Mở |
| --- | --- |
| Nhắc hạn | Danh sách Sắp hết hạn (có số món cần chú ý) |
| Chi tiêu | Chi tiêu tháng này so với tháng trước |
| **Thêm** (nút tròn) | Form thêm món |
| Lịch sử | Lịch sử mua sắm |
| Misu | Món nằm im (có số món) |

Bảng nằm phía trên thanh lối tắt nên bấm sang nút khác là chuyển bảng ngay. Đóng bằng nút **Xong**, chạm vào vùng mờ hoặc phím Esc. Chạm một món trong phòng thì bảng chi tiết món tự mở. Thêm món xong hoặc bấm **Tìm** thì bảng tự đóng. Có thể thêm app vào màn hình chính (trên iPhone: Safari, Chia sẻ, Thêm vào Màn hình chính) khi app được host qua HTTPS.

## 11. Dữ liệu của bạn

- Mọi dữ liệu nằm trong trình duyệt của máy đang dùng. Xoá dữ liệu trình duyệt hoặc đổi sang máy khác thì không còn. App chưa có sao lưu, xuất hay đồng bộ.
- Ảnh hoá đơn được gửi để đọc: trong app độc lập thì gửi tới Anthropic bằng khoá API của chính bạn (khoá chỉ lưu trên máy); trong bản chạy bên trong Claude thì đọc bằng Claude, không cần khoá. Ảnh được thu nhỏ còn tối đa 1600 px trước khi gửi.

## 12. Hỏi nhanh

**Sao món biến khỏi phòng?** Bạn bấm Dùng hết rồi, hoặc quy tắc mua lại đã coi nó là hết (xem Lịch sử, dòng đó ghi *Đã dùng hết* hoặc *Đã thay bằng món mới*), hoặc bạn đã xoá.

**Sao Misu không nhắc món quà?** Nhóm Mua tặng được bỏ qua có chủ ý.

**Sao có món bị hỏi *Bạn dùng chưa?* thay vì nhắc nằm im?** Vì món còn hạn dùng. Món đã quá hạn nằm trong danh sách như thường.

**Đọc ảnh báo cần khoá API?** Khi chạy ngoài Claude, mở mục *Khoá API Claude để đọc ảnh* trong tab Từ hoá đơn và dán khoá của bạn. Hoặc dán chữ của hoá đơn thay cho ảnh.

**Sao thông báo không hiện khi đóng app?** Xem mục 5: app chỉ nhắc khi đang mở.
