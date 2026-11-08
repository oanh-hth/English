# Nhóm đồ và quy tắc

Mọi ngưỡng ở đây là hằng số trong `app.js`; chỗ nào có tên hằng thì ghi kèm để bạn dễ đổi.

## 1. Mười sáu nhóm đồ

| # | Nhóm (id) | Hình 2D và mô hình 3D | Màu | Quy tắc riêng |
| --- | --- | --- | --- | --- |
| 1 | Rau củ quả (`produce`) | quả táo có cuống và lá | `#ff5a47` | |
| 2 | Sữa & trứng (`dairy`) | hộp sữa có mái nhọn | `#3d9bff` | |
| 3 | Đồ uống (`drinks`) | chai có vai và nắp | `#ff9a1f` | |
| 4 | Đồ khô (`pantry`) | lon có viền | `#bd8c4a` | |
| 5 | Thuốc (`meds`) | lọ thuốc có dấu thập | `#1fbf8a` | |
| 6 | Chăm sóc & mỹ phẩm (`care`) | chai bơm, thỏi son, hộp phấn | `#c76bf0` | Mua lại chỉ tính khi tên giống |
| 7 | Đồ vệ sinh (`cleaning`) | bình xịt | `#19c3e0` | Mua lại tính theo nhóm |
| 8 | Đồ điện tử (`electronics`) | laptop gập | `#6f86ad` | |
| 9 | Đồ cho bé (`baby`) | gói bỉm có quai | `#ff6f9f` | Mua lại tính theo nhóm |
| 10 | Quần áo (`clothes`) | áo thun | `#5b6ee1` | Misu nhắc sau 90 ngày |
| 11 | Mua tặng (`gift`) | hộp quà có nơ | `#f2b705` | Misu không nhắc; không tính mua lại; Miso bỏ qua; app không tự đoán |
| 12 | Dụng cụ (`tools`) | hộp dụng cụ | `#f76707` | Misu nhắc sau 90 ngày |
| 13 | Văn phòng phẩm (`stationery`) | cốc bút có bút chì | `#74b816` | Misu nhắc sau 90 ngày |
| 14 | Len (`yarn`) | cuộn len có kim đan | `#7950f2` | Misu nhắc sau 90 ngày |
| 15 | Đồ ăn vặt (`snack`) | gói bim bim và viên kẹo | `#e64980` | |
| 16 | Khác (`other`) | thùng hàng | `#c4925f` | Nhóm mặc định khi không đoán được |

Món lưu trước đây ở nhóm Mỹ phẩm (`cosmetics`) tự chuyển sang `care` khi mở app.

## 2. Trạng thái hạn dùng

Số ngày còn lại = hạn dùng trừ hôm nay. Trạng thái:

- **Đã hết hạn**: dưới 0 ngày (huy hiệu đỏ !).
- **Sắp hết hạn**: từ 0 đến N ngày, với N là ô *Nhắc mình* (2, 3, 5, 7 hoặc 14; mặc định 3) (huy hiệu cam).
- **Còn hạn**: nhiều hơn N ngày. Không có hạn thì không có trạng thái.

Banner, danh sách Sắp hết hạn, chuông và thông báo trình duyệt chỉ tính món còn trong phòng, trạng thái đã hết hạn hoặc sắp hết hạn. Nhóm Mua tặng vẫn được nhắc hạn nếu món có hạn.

## 3. Misu: món nằm im

Một món bị coi là **nằm im** khi còn trong phòng, chưa Dùng hết rồi, và đã quá ngưỡng kể từ ngày mua hoặc từ lần bấm **Vừa dùng** gần nhất.

| Nhóm | Ngưỡng |
| --- | --- |
| Quần áo, Len, Dụng cụ, Văn phòng phẩm | hơn 90 ngày (`DORMANT_DAYS_LONG`) |
| Các nhóm còn lại | hơn 30 ngày (`DORMANT_DAYS`) |
| Mua tặng | không bao giờ |

- Món nằm im có huy hiệu **zZ** trong phòng và nằm trong mục **Nằm im lâu rồi**.
- Món nằm im **còn hạn dùng** chỉ bị hỏi *Bạn dùng chưa?*: **Dùng rồi** tính lại thời gian nằm im; **Chưa dùng** ẩn câu hỏi 30 ngày (`snoozed`), sau đó hỏi lại. Món đã quá hạn không được hỏi kiểu này mà nằm trong danh sách như bình thường.
- Mặt Misu: vui khi không có món nằm im (hoặc chỉ có món cần hỏi), buồn ngủ khi có 1 đến 4 món, lo lắng khi có từ 5 món.

## 4. Miso: nói về chuyện mua

Miso chọn **một** nhóm câu theo thứ tự ưu tiên dưới đây, món nào đúng trước thì Miso nói trước:

| Thứ tự | Tình huống | Ngưỡng | Mặt Miso |
| --- | --- | --- | --- |
| 1 | Nhiều món hết hạn còn trong phòng | từ 3 món | hoảng hốt |
| 2 | Mua cùng nhóm nhiều lần **trong ngày** | từ 2 lần mua riêng biệt (`DAILY_MIN`); từ 3 lần thì hoảng hốt | phán xét |
| 3 | Mua cùng nhóm nhiều **ngày trong 7 ngày gần nhất** | từ 5 ngày (`HABIT_MIN_DAYS`) nhắc nhẹ; đủ 7/7 ngày chê nặng | phán xét, hoảng hốt khi 7/7 |
| 4 | Phòng quá đầy | từ 24 món trong phòng | hoảng hốt |
| 5 | Mua nhanh hơn tháng trước | gấp 1,5 lần cùng kỳ và ít nhất 6 món | phán xét |
| 6 | Có 1 đến 2 món hết hạn | | phán xét |
| 7 | Mua nhiều | từ 12 món trong tháng | phán xét |
| 8 | Mua ít | từ 3 món trở xuống trong tháng | vui |
| 9 | Còn lại | | bình thường |

Chi tiết:

- **Một lần mua** là một lần thêm bằng tay, hoặc một hoá đơn (mọi dòng trên hoá đơn dùng chung một mã lô). Nên hoá đơn có nhiều đồ uống vẫn chỉ tính một lần.
- Số món tháng này tính theo **số lượng** (×6 nước có ga là 6 món), đếm cả món đã dùng hết.
- Nhóm **Mua tặng** bị bỏ qua ở các quy tắc 2 và 3.
- Ngay khi bạn thêm, xoá, dùng hết, mua lại hoặc hoàn tác một món, Miso nói về thao tác đó. Nếu thao tác vừa làm đẩy một nhóm vượt ngưỡng 2 hoặc 3, Miso chê nhóm đó luôn.
- Câu chữ nằm trong `HABIT`, `DAILY` và hàm `critique()` trong `app.js`. Giọng điệu: xưng 'tui', gọi bạn là 'bạn', chê món hàng chứ không chê con người.

## 5. Quy tắc mua lại món giống

Khi bạn thêm món mới (tay hoặc hoá đơn), các món cũ còn trong phòng bị chuyển sang **Đã thay bằng món mới** nếu **cả ba** đúng:

1. Món cũ mua ở một **tháng sớm hơn** tháng của món mới. Mua hai lần trong cùng một tháng không tính (có thể bạn đang tích trữ).
2. Một trong hai điều kiện sau:
   - **Cùng tên hoặc tên gần giống.** App bỏ dấu, bỏ chữ có số (1L, size L, 500g) và từ quảng cáo (combo, tặng, túi...), rồi so các từ còn lại. Khớp khi một tên chứa trọn tên kia (tên ngắn hơn có ít nhất hai từ), hoặc tỉ lệ từ chung trên tổng số từ của hai tên từ 60% trở lên. Tên chỉ có một từ thì chỉ khớp khi hai tên giống hệt.
   - **Cùng nhóm Đồ cho bé hoặc Đồ vệ sinh** (`REBUY_CATS`), dù khác tên: bỉm hãng này thay bỉm hãng kia.
3. Cả hai món không thuộc nhóm Mua tặng, món mới không phải món đã ăn uống rồi, và ô chọn ở cuối trang đang bật.

Món cũ không bị xoá: nó chuyển thành đã dùng, tiền vẫn tính. **Hoàn tác** trả nó về phòng. Nhân đôi món không kích hoạt quy tắc.

## 6. Chi tiêu

- Mỗi món có **một giá**, là tổng tiền cho cả dòng. Chi tiêu tháng = tổng giá của các món có **ngày mua** thuộc tháng đó (kể cả món đã dùng hết hoặc đã thay).
- **Cùng kỳ**: tháng này so với những ngày đầu tháng trước có cùng số ngày (nếu hôm nay là ngày 8 thì so với 1 đến 8 tháng trước).
- Dùng hết rồi, thay bằng món mới: tiền giữ nguyên. **Xoá** và thùng rác: tiền bị bỏ.
- Số tiền hiển thị theo VND (`vi-VN`), không có số lẻ.

## 7. Cách app đoán nhóm từ tên món

Khi đọc hoá đơn bằng chữ (và khi Claude không điền nhóm), app thử các nhóm theo thứ tự: Đồ ăn vặt, Đồ cho bé, Quần áo, Chăm sóc & mỹ phẩm, Đồ vệ sinh, Thuốc, Đồ điện tử, Dụng cụ, Văn phòng phẩm, Len, Đồ uống, Sữa & trứng, Rau củ quả, Đồ khô. Không khớp nhóm nào thì là Khác. Mua tặng không bao giờ được đoán.

Thứ tự này quyết định các trường hợp nhập nhằng:

- "Bim bim" ra Đồ ăn vặt, trong khi "bỉm" ra Đồ cho bé.
- "Áo len" ra Quần áo (vì Quần áo đứng trước Len); "len" một mình ra Len.
- "Giấy vệ sinh" ra Đồ vệ sinh; "giấy", "vở", "bút" ra Văn phòng phẩm.
- "Bánh quy", "kẹo", "socola" ra Đồ ăn vặt; "bánh mì" ra Đồ khô.

Từ khoá nằm ở thuộc tính `kw` của từng nhóm trong `CATS` và ở bảng `VN` trong `app.js`. Đoán sai thì sửa ở bước xem lại hoá đơn.

## 8. Điểm gọn gàng và huy hiệu

**Điểm gọn gàng** (hàm `tidyScore`) = 100, trừ 10 điểm mỗi món còn trong phòng đã hết hạn, trừ 3 điểm mỗi món nằm im (theo mục 3), trừ 10 điểm nếu phòng có từ 24 món; giới hạn từ 0 đến 100. Nhãn: từ 85 *Phòng gọn như mơ*, từ 65 *Cũng ổn áp*, từ 40 *Hơi bừa rồi nha*, dưới 40 *Cần dọn gấp*.

| Huy hiệu | Điều kiện nhận |
| --- | --- |
| Heo đất khoẻ | Có chi tiêu cùng kỳ tháng trước và tháng này chi không hơn |
| Dùng kịp hạn | Ít nhất 3 món có hạn được bấm *Dùng hết rồi* **trước hoặc đúng ngày hết hạn** trong 30 ngày gần nhất (dùng trường `usedAt`) |
| Phòng gọn gàng | Điểm gọn gàng từ 85 trở lên và có ít nhất 5 món trong phòng |
| Nhịn được đồ uống, Nhịn được đồ ăn vặt | Đã mua nhóm đó ít nhất 2 lần trong 60 ngày gần nhất, và lần mua cuối cách đây từ 7 ngày |

Huy hiệu được tính lại mỗi lần vẽ, không lưu từng huy hiệu mà chỉ nhớ danh sách đã nhận (`state.badges`) để biết khi nào có huy hiệu **mới** (lúc đó có pháo giấy và thông báo). Lần mở đầu tiên chỉ ghi lại danh sách, không ăn mừng.

## 9. Căn phòng sống

- **Cửa sổ** theo giờ trên máy: từ 19 giờ đến 5 giờ là đêm (nền xanh đậm, trăng sao, cả phòng tối nhẹ, hết vệt nắng trên sàn); từ 17 giờ 30 là hoàng hôn (nền cam); từ 5 giờ đến 7 giờ là bình minh; còn lại là ban ngày. Cập nhật mỗi phút.
- **Cái cây** theo số món hết hạn còn trong phòng: 0 món là khoẻ và có hoa; 1 đến 2 món là rũ xuống; từ 3 món là héo úa.
- **Mặt của món** (`faceMood`): lo lắng nếu đã hết hạn hoặc sắp hết hạn trong 1 ngày; buồn ngủ nếu đang nằm im; còn lại vui. Món nằm im còn bám bụi trong 2D.
- **Misu trong phòng** ngủ khi có ít nhất một món nằm im.
- Phòng 3D áp dụng cùng quy tắc: màu cửa sổ theo giờ, màu và độ rũ của lá cây, mặt của món, Misu ngủ.

## 10. Heo đất

Độ đầy của bụng heo = chi tiêu tháng này chia cho số lớn hơn giữa cả tháng trước và tháng này (tối thiểu hiển thị 5%). Heo toát mồ hôi nếu tháng này chi hơn cùng kỳ tháng trước trên 10%, cười nếu không hơn, bình thường nếu chưa có số liệu tháng trước.
