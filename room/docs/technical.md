# Tài liệu kỹ thuật

## 1. Tổng quan

Phòng Trữ Đồ là một web app **tĩnh**: HTML, CSS và JavaScript thuần, không có bước build, không có máy chủ. Mọi dữ liệu nằm trong `localStorage` của trình duyệt. Nằm trong thư mục `room/` của repo, độc lập với app luyện tiếng Anh ở thư mục gốc (cả hai chỉ dùng chung `../vendor/anthropic-sdk.js`).

| Tệp | Vai trò |
| --- | --- |
| `index.html` | Khung trang, các hình 2D của từng nhóm (thẻ `<symbol id="s-...">`), các khung (card), bảng trượt và thanh lối tắt cho điện thoại |
| `styles.css` | Giao diện sáng (cố định, không có chế độ tối), hai cột trên máy tính, bảng trượt khi ≤ 820 px |
| `app.js` | Toàn bộ logic (khoảng 1500 dòng, một IIFE bọc trong module ES) |
| `sw.js` | Service worker: lưu cache để chạy offline |
| `manifest.webmanifest`, `icons/` | Cài lên màn hình chính (PWA) |
| `vendor/three.min.js` | three.js r128 (MIT, `three.LICENSE`) cho phòng 3D |
| `docs/` | Tài liệu này |

## 2. Chạy và đưa lên host

Chạy cục bộ, từ **thư mục gốc của repo** (vì `room/` dùng `../vendor/`):

```
python3 -m http.server 8000
# mở http://localhost:8000/room/
```

Đưa lên host tĩnh (GitHub Pages, Netlify...) cần **HTTPS** để cài lên điện thoại và để service worker chạy. Mọi đường dẫn đều tương đối nên chạy được dưới một thư mục con. Trên GitHub Pages, chọn nhánh và thư mục gốc `/`, app ở `.../room/`. Mỗi lần đổi tệp cần cache thì đổi tên `CACHE` trong `sw.js` (hiện `phong-tru-do-v2`) để trình duyệt tải bản mới; `sw.js` dùng chiến lược *mạng trước, cache khi mất mạng*.

Không đưa khoá API hay tệp `.env` vào repo (đã có trong `.gitignore`). Khoá chỉ do người dùng gõ vào app.

## 3. Cấu trúc `app.js`

`app.js` chia đoạn bằng các dòng chú thích `/* ---------- tên ---------- */`:

| Đoạn | Việc |
| --- | --- |
| constants | `CURRENCY`, `LOCALE`, `KEY`, danh sách `CATS` (nhóm, màu, từ khoá), thứ tự đoán nhóm `GUESS_ORDER`, bảng từ khoá `VN` |
| helpers | Ngày (`iso`, `parseISO`, `today`, `addDays`), tiền (`money`), `esc` |
| state | `starter()`, `seed()`, nạp và lưu, `daysLeft`, `status` |
| rebuy rule | `REBUY_CATS`, `sameProduct`, `applyRebuy`, `announceRebuy` |
| toast, trashItem, duplicateItem | Thông báo nhỏ có Hoàn tác, xoá, nhân đôi |
| room | `renderRoom`, kéo thả, nhấn giữ, phím |
| critic (Miso) | `HABIT`, `DAILY`, `critique()`, `renderCritic()` |
| Misu | `misuSvg`, `renderDormant`, `isDormant`, `needsAsk` |
| period, legend, inspector, alerts, spending | Lịch sử, lọc nhóm, chi tiết món, nhắc hạn và thông báo, chi tiêu và biểu đồ |
| add by hand, add from a bill | Form nhập tay, bộ đọc hoá đơn chữ |
| bill photos | Chọn ảnh, gọi Claude, `fromAI` |
| 3D view | three.js: `buildModel`, `buildRoomMeshes`, `sync3D`, tương tác |
| room look | `ROOMS` (kiểu làm sẵn), ảnh nền, thanh Làm dịu ảnh |
| phones | Bảng trượt và thanh lối tắt |
| boot | Khởi động |

**Mô hình hiển thị:** không có framework. Mỗi khu vực có một hàm `renderX()` ghi lại `innerHTML` của khu đó và gắn lại sự kiện. `renderAll()` gọi tất cả (`renderRoom`, `renderLegend`, `renderInspector`, `renderAlerts`, `renderSpend`, `renderHistory`, `renderCritic`, `renderDormant`). Mọi thay đổi dữ liệu theo trình tự: sửa `state` → `save()` → `renderAll()`.

**Trạng thái tạm** (không lưu): món đang chọn `sel`, bộ lọc nhóm `filter`, khoảng thời gian `period`, `tick` của câu Miso và Misu, phản ứng gần nhất `reaction`.

## 4. Dữ liệu

Một khoá `localStorage` `phongtrudo.v1` chứa:

```json
{
  "items": [ ... ],
  "win": 3,
  "view": "2d",
  "autoRebuy": true,
  "room": {"mode": "preset", "preset": "sang", "veil": 25}
}
```

Một món (`item`):

| Trường | Ý nghĩa |
| --- | --- |
| `id` | Mã ngẫu nhiên |
| `name`, `cat` | Tên và id nhóm |
| `bought` | Ngày mua `YYYY-MM-DD` (quyết định chi tiêu tháng) |
| `exp` | Hạn dùng `YYYY-MM-DD` hoặc chuỗi rỗng |
| `price`, `qty` | Giá **cả dòng** (VND), số lượng |
| `x`, `y` | Vị trí trong phòng, phần trăm 0 đến 100 (cả 2D và 3D dùng chung) |
| `used` | `true` nếu đã dùng hết hoặc bị thay: không hiện trong phòng nhưng vẫn tính tiền |
| `note` | Ghi chú (ví dụ phân loại Shopee, topping) |
| `touched` | Ngày bấm Vừa dùng gần nhất |
| `snoozed` | Ngày bấm Chưa dùng (ẩn câu hỏi của Misu 30 ngày) |
| `replacedBy` | Mã món mới đã thay món này (quy tắc mua lại) |
| `batch` | Mã chung của mọi món cùng một hoá đơn |

Các khoá `localStorage` khác:

| Khoá | Nội dung |
| --- | --- |
| `phongtrudo.roomimg` | Ảnh nền phòng (data URL JPEG, tối đa 1600 px) |
| `phongtrudo.apikey`, `phongtrudo.model` | Khoá API Claude và mô hình đã chọn |
| `phongtrudo.lastNotify` | Ngày đã gửi thông báo gần nhất |

Khi nạp, nếu còn món thuộc nhóm cũ `cosmetics` thì chuyển sang `care`. Khi thêm trường mới vào món, nhớ đọc nó an toàn vì dữ liệu cũ chưa có trường đó.

Toạ độ `x`, `y` là toạ độ phòng 2D. Phòng 3D ánh xạ: `y` từ 44 trở lên là sàn (độ sâu từ 44 đến 96), `y` dưới 44 là tường sau và kệ (độ cao tính từ `y`); `x` trải ngang phòng.

## 5. Phòng 3D

- three.js r128, tải **lần đầu bấm Xem 3D** bằng thẻ script động (`THREE_URL`, mặc định `vendor/three.min.js`). Nếu tải lỗi hoặc không có WebGL, app báo và ở lại 2D.
- Phòng dựng từ khối đơn giản: sàn có ván, tường sau và hai tường bên (chỉ một mặt, nên khi xoay ra sau tường thì tường biến mất), chân tường, cửa sổ, tranh, kệ, thảm, cây. Màu lấy từ kiểu phòng đang chọn (`ROOMS`); ảnh của bạn thành tường sau.
- Mỗi nhóm có một mô hình trong `buildModel(cat)`, dựng từ khối hộp, trụ, cầu... Huy hiệu hết hạn và zZ là sprite phía trên. Món có bóng đơn giản dưới chân.
- Camera là hàm của `yaw`, `pitch`, `radius` quanh một điểm; kéo vào chỗ trống để xoay, cuộn để zoom. Chọn món bằng raycast, kéo món bằng giao điểm tia với mặt sàn, thả vào thùng rác bằng cách so toạ độ con trỏ với nút thùng rác (DOM).
- Vẽ chỉ khi có thay đổi (cờ `needs`), không vẽ liên tục.

## 6. Giao diện điện thoại

Dưới 820 px (`matchMedia`), các khung `#spend`, `#alerts`, `#add`, `#history`, `#dormant`, `#inspector`, `#room-style` nằm trong các thẻ `.sheet` (trên máy tính thẻ này là `display: contents` nên không đổi bố cục). Khi mở, `.sheet.open` cố định ngay trên thanh lối tắt `#dock`, có lớp mờ `#scrim`. `openSheet(key)` và `closeSheets()` điều khiển; khi thêm món hoặc bấm Tìm thì bảng tự đóng. Thanh lối tắt cũng hiện số món cần chú ý.

## 7. Sử dụng Claude

Chỉ dùng để **đọc ảnh hoá đơn** (xem [Đọc hoá đơn](bills.md)). App tự phát hiện môi trường:

- Có `window.claude` với `sample` hỗ trợ ảnh (chạy bên trong Claude): dùng nó, ẩn ô khoá API.
- Ngược lại: nạp SDK bằng `import()` **động** khi cần, dùng khoá của người dùng.

Vì SDK nạp động nên `app.js` chạy được cả như module trong repo lẫn như script thường trong một trang đơn của Claude.

## 8. Mở rộng

### Thêm một nhóm đồ

1. `app.js`, mảng `CATS`: thêm `{id, name, color, kw}` (đặt trước nhóm `other`). Nếu muốn app đoán nhóm, thêm id vào `GUESS_ORDER` ở đúng vị trí (thứ tự quyết định các trường hợp nhập nhằng).
2. `index.html`: thêm `<symbol id="s-<id>" viewBox="0 0 48 48">` (hình 2D, dùng `currentColor` cho phần màu nhóm).
3. `app.js`, `buildModel(cat)`: thêm một nhánh dựng mô hình 3D (đáy ở y = 0, cao khoảng 1 đơn vị).
4. `HABIT` và `DAILY`: thêm câu chê của Miso cho nhóm (hai câu chê nặng, hai câu chê nhẹ, hai câu cho trong ngày).
5. Nếu nhóm cần ngưỡng Misu dài: thêm id vào `LONG_IDLE`. Nếu nhóm "mua lại là hết": thêm vào `REBUY_CATS`. Nếu Misu không được nhắc: xử lý như `gift` trong `isDormant`.
6. Thêm món mẫu trong `starter()` và `seed()`; cập nhật bảng nhóm trong [Nhóm đồ và quy tắc](rules.md).
7. Nếu bỏ hoặc gộp một nhóm, thêm bước chuyển dữ liệu cũ khi nạp (xem chỗ chuyển `cosmetics` sang `care`).

### Thêm một kiểu phòng

Thêm một dòng vào mảng `ROOMS` với các biến màu `--wall`, `--wall-2`, `--base`, `--floor`, `--floor-line`, `--rug`, `--glass`, `--frame`, `--shadow`. Kiểu mới tự xuất hiện trong bảng chọn, áp dụng cho cả 2D và 3D.

### Thêm câu cho Miso hoặc Misu

Sửa các mảng `HABIT`, `DAILY`, các nhóm câu trong `critique()` (Miso) và `POOLS` trong `renderDormant()` (Misu). Chỗ `{tên}` được thay bằng số liệu thật (`{now}`, `{inRoom}`, `{name}`, `{hdays}`, `{dcount}`...). Câu được chọn theo ngày trong tháng cộng với số lần bấm *Chê tiếp đi*, nên thêm câu là tự có thêm biến thể.

### Đổi ngưỡng

Các hằng số: `DORMANT_DAYS`, `DORMANT_DAYS_LONG`, `LONG_IDLE`, `HABIT_MIN_DAYS`, `DAILY_MIN`, `LONG_PRESS_MS`, `REBUY_CATS`; ngưỡng phòng đầy (24 món) và mua nhanh (1,5 lần, 6 món) nằm trong `critique()`.

## 9. Kiểm thử

Repo chưa có bộ kiểm thử tự động. Danh sách kiểm tra nhanh trước khi giao:

- Mở lần đầu với dữ liệu trống: có 15 món; tải lại không tạo lại món.
- Thêm món bằng tay, bằng hoá đơn dán (cả ba ví dụ), bằng ảnh nếu có khoá; kiểm tra bảng xem lại.
- Kéo một món, nhấn giữ nhân đôi, kéo vào thùng rác, Hoàn tác.
- Thêm hai món đồ uống trong một ngày: Miso chê. Thêm món cùng tên của tháng trước: món cũ chuyển sang Đã thay.
- Đặt ngày mua cách đây 100 ngày cho một món len: Misu nhắc; món Mua tặng thì không.
- Bấm Xem 3D, xoay, kéo một món, quay lại 2D, tải lại trang (nhớ chế độ).
- Thu cửa sổ còn 390 px: có thanh lối tắt, mở từng bảng, không tràn ngang.

Khi phát triển, phần lớn các kiểm tra trên được chạy bằng Playwright với trình duyệt Chromium (WebGL qua SwiftShader); các tập lệnh đó không nằm trong repo.

## 10. Bản chạy trong Claude (artifact)

Cùng mã nguồn có thể đóng gói thành **một trang đơn** để chạy bên trong Claude: nhúng `styles.css` vào thẻ `<style>`, thân trang từ `index.html`, và `app.js` vào thẻ `<script>` thường; bỏ dòng đăng ký service worker; đổi `THREE_URL` thành `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`; khai báo khả năng `sample` có ảnh khi đăng. Trang chạy trong khung bị hạn chế (không có service worker, thông báo có thể không dùng được) nên đây là bản xem và thử, bản đầy đủ là bản trong repo.

## 11. Giới hạn đã biết

- Chưa có tài khoản, đồng bộ, sao lưu, xuất và nhập dữ liệu.
- Thông báo chỉ hiện khi app đang mở, tối đa một lần mỗi ngày (cần máy chủ Web Push để nhắc khi đã đóng app).
- Đọc ảnh cần khoá API cá nhân khi chạy ngoài Claude.
- Phòng 3D chưa có phím nhích món; phím tắt chỉ ở chế độ 2D. Trên điện thoại, chạm vào phòng 3D không cuộn trang.
- Mô hình 3D là khối hình học đơn giản (kiểu hoạt hình), chưa có mô hình chi tiết.
- Bố cục 3D mới (nội thất theo nhóm, xếp ô tự động) mới ở mức bản phác thảo.
- Chỉ tiếng Việt và VND.
