# Cầu nâng Level 03

Thay thế bệ di chuyển qua mương rộng bằng cầu nâng tại X1152–1328, mặt cầu Y288 ngang mặt đất. Lấy vị trí từ hố rộng nhất của Ground; không dùng các object `moving-platform` / `platformEnd` cũ trong Tiled nữa. Các object đó tạm giữ để không làm mất dữ liệu bản đồ nguồn, nhưng không sinh vật thể runtime.

## Cốt truyện và thao tác

- Cầu bị dựng lên để chặn đường vận chuyển ban đêm.
- Đọc sơ đồ bảo trì tại X1040. Sơ đồ giải thích nguồn mô-tơ độc lập với nhánh hàng rào.
- E tại tủ nguồn mô-tơ X992 để đóng điện.
- E tại cần điều khiển X1136 để nhả xích hạ cầu trong 2,4 giây gameplay. Kéo khi chưa cấp nguồn chỉ hiện lời giải thích.
- Chỉ khi cầu nằm ngang mới bật va chạm sàn; không có sàn vô hình khi cầu đang dựng/đang hạ. Mặt cầu chồng vào mỗi bờ 2px để tránh khe va chạm.
- Chốt cơ khí giữ cầu hạ. Hồi sinh checkpoint giữ nguồn, tiến độ hạ cầu và lời giải; Restart Level tạo cầu dựng lại.
- Cầu dao hàng rào X1536 vẫn riêng, chỉ bắt đầu 30 giây khi cầu đã hạ và câu đố nhánh điện đã giải. Chase tốc độ 140 giữ nguyên.

Hình cầu, bản lề, xích, tủ mô-tơ và cần điều khiển dùng Phaser Graphics. Pause/hội thoại dừng tiến độ hạ cầu cùng gameplay. Sổ tay J ghi tình trạng nguồn và cầu.
