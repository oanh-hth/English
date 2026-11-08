# Đọc hoá đơn

Có hai đường vào, cùng đổ ra **một bảng xem lại**: bạn luôn sửa được tên, giá, nhóm, hạn dùng và bỏ tick món không muốn thêm trước khi lưu.

| Đường vào | Khi nào dùng | Cần gì |
| --- | --- | --- |
| **Ảnh** (chụp hoặc ảnh màn hình) | Có sẵn ảnh | Claude đọc ảnh: bản trong Claude không cần gì thêm; app độc lập cần khoá API Claude của bạn |
| **Chữ dán vào** | Không có ảnh, hoặc không muốn dùng khoá | Không cần gì, bộ đọc chạy ngay trên máy |

## 1. Ba kiểu hoá đơn đã hỗ trợ

### Đơn Shopee (ảnh màn hình đơn hàng)

Mỗi cửa hàng trong đơn có: tên shop, tên sản phẩm (hay bị cắt bằng dấu ba chấm), dòng phân loại kèm số lượng (`... x1`), giá gốc gạch ngang và giá hiện tại, rồi **Thành tiền**.

- Tên món được làm sạch: bỏ nhãn kiểu `[COMBO 2 Tặng Túi ]` và dấu ba chấm cuối.
- Dòng phân loại (ví dụ `Quần XL 12-18kg, 17 miếng, Combo 2 túi`) thành **ghi chú** của món.
- Giá lấy là **giá hiện tại**, không phải giá gạch ngang.
- **Số tiền ghi nhận là Thành tiền** (số bạn thật sự trả sau giảm giá, voucher). Nếu một cửa hàng có nhiều sản phẩm thì Thành tiền được chia theo tỉ lệ đơn giá nhân số lượng của từng sản phẩm.
- Hoá đơn không in ngày đặt thì món lấy ngày hôm nay.

### Bill quán cà phê hoặc nhà hàng

Bảng có các cột STT, Tên món, SL, Đơn giá, Thành tiền, và dòng Tổng tiền cuối.

- Mỗi dòng thành một món. Dòng bắt đầu bằng `-` có giá 0 (topping, ví dụ `- Thạch Giòn`) **không** thành món riêng mà được gắn vào ghi chú của món ở dòng trên.
- Các dòng giờ vào, giờ ra, thanh toán, wifi bị bỏ qua. Số tiền theo **Tổng tiền**; nếu khác tổng các dòng (có giảm giá) thì các dòng được chia lại cho khớp.
- Đây là đồ đã ăn uống rồi nên ô **Đã ăn hoặc uống rồi** được tick sẵn: món chỉ tính vào chi tiêu, không đặt vào phòng.
- Món không đoán được nhóm thì mặc định là Đồ uống.

### Hoá đơn siêu thị hoặc cửa hàng

Mỗi dòng dạng `Tên món   x2   72.000`, có thể có dòng ngày (`Ngày: 07/11/2026` hoặc `2026-11-07`). Dòng tổng, thuế, giảm giá, tiền thối bị bỏ qua. Số trong dòng là tiền của cả dòng.

## 2. Số và tiền

Tiền là **VND, số nguyên**. Chấp nhận `667.000đ`, `35,000`, `32.000` (dấu chấm hoặc phẩy ngăn cách hàng nghìn). Ngày dạng `dd/mm/yyyy` hoặc `yyyy-mm-dd`. Mọi món của một hoá đơn dùng chung một ngày mua và một mã lô, vì thế với Miso cả hoá đơn là **một lần mua**.

## 3. Đọc ảnh bằng Claude

App gửi ảnh kèm một đoạn hướng dẫn và nhận lại một đối tượng JSON:

```json
{
  "date": "YYYY-MM-DD hoặc null",
  "consumed": true,
  "amount_paid": 77000,
  "items": [
    {"name": "Phê Hạnh Nhân", "variant": "", "qty": 1, "unit_price": 35000, "category": "drinks"}
  ]
}
```

- `consumed` là true với bill quán ăn uống.
- `amount_paid` là số tiền cuối cùng bạn trả (Thành tiền, Tổng tiền); nếu có thì các dòng được chia lại cho khớp, nếu không thì dùng đơn giá nhân số lượng.
- `category` là một trong các id nhóm. Claude chỉ chọn `gift` khi hoá đơn nói rõ là quà. Id lạ thì app tự đoán lại từ tên.
- Topping giá 0 được Claude gộp vào `variant` của món chính.
- Nếu ảnh không phải hoá đơn, kết quả là danh sách rỗng và app báo không tìm thấy món nào.

Chi tiết kỹ thuật:

- Ảnh được thu nhỏ còn tối đa 1600 px cạnh dài (JPEG) trước khi gửi; tối đa 4 ảnh một lần (hoặc theo giới hạn của môi trường).
- **Bản trong Claude** dùng khả năng `sample` của artifact: không cần khoá, lần đầu bấm Claude sẽ hỏi bạn cho phép.
- **App độc lập** dùng SDK Anthropic ở `../vendor/anthropic-sdk.js` trực tiếp từ trình duyệt với khoá của bạn. Khoá và mô hình đã chọn lưu trong `localStorage` (`phongtrudo.apikey`, `phongtrudo.model`), chỉ được gửi tới Anthropic. Mô hình mặc định `claude-sonnet-5-5`, có thể chọn Haiku (rẻ nhất) hoặc Opus. Mỗi hoá đơn tốn vài trăm đồng. Nên đặt hạn mức chi tiêu trong Anthropic Console và đừng commit khoá vào repo.
- Lỗi thường gặp: khoá sai (401), chưa được phép dùng mô hình (403), gửi quá nhiều (429), ảnh quá nặng (413), mất mạng. App báo bằng tiếng Việt và vẫn cho dán chữ thay thế.

## 4. Thêm một kiểu hoá đơn mới

Đường **ảnh** thường tự đọc được kiểu mới vì Claude hiểu bố cục. Đường **chữ dán** cần bộ đọc cho kiểu đó:

1. Xin một ảnh và đoạn chữ mẫu của kiểu hoá đơn mới.
2. Trong `app.js`, hàm `parseBill(text)` quyết định bộ đọc: kiểu bảng quán ăn nhận ra bằng chữ `Tên món` cùng `STT`; kiểu Shopee nhận ra bằng chữ `Thành tiền`; còn lại là kiểu dòng chung. Thêm một hàm đọc mới (mẫu: `parseDineIn`, `parseShopee`) và một điều kiện nhận ra nó, **đặt trước** các điều kiện có thể nhận nhầm.
3. Hàm đọc trả về danh sách `{on, name, cat, exp, price, qty, note, bought}`. Đặt `rows.consumed = true` nếu là đồ đã ăn uống.
4. Thêm một mục vào `SAMPLES` và một `<option>` trong `#bill-sample` (ở `index.html`) để người dùng thử.
5. Nếu cần nhận nhóm mới, thêm từ khoá (xem [Nhóm đồ và quy tắc](rules.md), mục 7).
6. Thử bằng cách dán mẫu vào ô chữ và kiểm tra bảng xem lại: số dòng, tên, giá, tổng.
