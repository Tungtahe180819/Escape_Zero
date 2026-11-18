# Level 03 — Hàng rào cuối cùng

Tuyến prototype Cửa 09, nối USB của Level 02 với kết thúc **Còn tiếp**. Không thay Level 01/02 hoặc hình học ba hố hiện có. Cập nhật mới: bệ di chuyển đã thay bằng cầu nâng cấp điện; xem LEVEL03_DRAWBRIDGE.md.

## Tuyến chơi

1. Đọc bản đồ Lan (X112), gặp người khuân hàng (240). Túi vải ở 400 là nhiệm vụ phụ; trả túi mở lối mương 560 ↔ 1104. Lối này dùng hội thoại chuyển cảnh tức thời, chưa có map đường hầm riêng.
2. Sân có một guard thật (đuổi 110, chạm bắt theo quy tắc hiện có), đèn quét gây lộ sau 0,9 giây liên tục và chó tuần tra chạm bắt. Ba kiện hàng X592/816/1080 dùng S để núp. Chó hiện là hình ghép Phaser, chưa có sprite/AI đánh hơi riêng.
3. Đối chiếu bản đồ, cột B hai vạch (608), mương chảy tây sang đông (768). Tại X912 chọn cột B / phía đông / sơn đỏ. Thiếu manh mối không thể đoán trước. J mở sổ tay khi đang chuẩn bị.
4. Đọc sơ đồ (1040), bật nguồn mô-tơ (992), kéo cần (1136), chờ cầu nâng hạ xong để qua X1152–1328. Tủ điện hàng rào (1376): chọn nhánh 2. Sai được thử lại, chưa bật timer.
5. Cầu dao (1536): E và kết thúc hội thoại mới bắt đầu 30 giây. Chase-start phía sau kích hoạt nhóm bốn guard tốc độ 140. Cầu nằm trước cầu dao; đoạn chạy chỉ còn hố nhỏ hiện có.
6. Tới chase-end rồi vùng finish trước hết giờ: hội thoại tín hiệu ba ngắn/một dài, Minh mang USB ra ngoài, Lan/Tuấn còn lại, rừng đêm và Còn tiếp. Chỉ chuyển DemoCompleteScene ở UPDATE sau khi hội thoại đóng.

## Trạng thái

Checkpoint/chết/hết giờ: giữ manh mối, lời giải, nhiệm vụ túi, nguồn mô-tơ và trạng thái cầu; reset đồng hồ, chase và guard. Phải kéo lại cầu dao hàng rào. Restart Level/F5 tạo nhiệm vụ mới. Tiến độ cốt truyện nội màn chưa lưu localStorage. Pause và hội thoại dừng thời gian gameplay; J khóa trong chặng đếm ngược.

Đây là hội thoại và lựa chọn tương tác, chưa có video cắt cảnh. Thông số độ khó cần kiểm tra thực tế trên trình duyệt trước khi chốt.
