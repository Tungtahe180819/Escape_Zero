# Level 02 Ca trực ban đêm

Trạng thái: kịch bản được chủ dự án chốt ngày 2026-11-10, đã tích hợp một bản gameplay để chơi thử trong Level02Scene. Đây là Level 02 riêng biệt, không phải tầng 2 của Level 01. Bản mới có hai đường tiếp cận, bốn NPC, câu đố ba phần dữ liệu, tài khoản bảo dưỡng, sao chép dưới giám sát, USB và đoạn kết. Xem LEVEL02_IMPLEMENTATION.md để biết giới hạn bản prototype và các ca kiểm tra; phần trình bày cắt cảnh hiện là hội thoại/lược thuật, chưa có video minh họa.

## Cốt lõi

Minh tìm được Lan, nhưng đưa bằng chứng ra khỏi khu làm việc khó hơn tìm đường thoát. Level 01 tập trung khám phá bí mật; Level 02 tập trung phối hợp với những người bị giữ trong trại để lấy bằng chứng. Thông tin và sự giúp đỡ của NPC phải thay đổi cách chơi hoặc mở một lựa chọn có ý nghĩa.

## Mở đầu Lời hẹn trong bóng tối

Sau khi rời khu giam, Minh lần theo dấu hiệu Lan để lại trên hành lang. Người chơi quan sát camera, lính và ký hiệu để xác định đường tới khu làm việc.

Có hai hướng: đường ngắn nguy hiểm hơn và lối phục vụ dài hơn, có thể mở bằng thẻ mượn từ NPC. Không biến nhánh phụ thành một điều kiện bắt buộc khiến đường chính mất tác dụng.

## Khu làm việc và các NPC

| Nhân vật | Điều họ biết hoặc có | Động cơ và vai trò chơi |
| --- | --- | --- |
| Người cấp suất ăn | Vị trí của Lan và thông tin lối phục vụ | Muốn Minh mang lời nhắn tới người thân bị giữ ở khu khác; mở một nhánh tương tác có lợi ích cụ thể |
| Người trực máy | Cách truy cập các phần dữ liệu | Ban đầu từ chối vì tài khoản có thể bị truy ra; chỉ giúp khi Minh tìm được phương án dùng tài khoản bảo dưỡng để tránh liên lụy anh |
| Lan | Danh sách nạn nhân đã bí mật sao chép | Chia dữ liệu thành nhiều phần để tránh bị phát hiện; phối hợp với Minh ghép và mang chúng ra |
| Tuấn | Hiện diện ở khu làm việc | Minh nhìn thấy cậu bị ép đọc kịch bản lừa đảo, làm rõ lý do phải giúp những người còn lại |

Các vai cấp suất ăn và trực máy là vai phụ mở rộng của prototype, chưa chốt tên riêng. Lan, Tuấn và các mốc của kịch bản chính tiếp tục giữ vai trò đã duyệt.

## Câu đố chính Ghép lại danh sách

Minh tìm ba phần dữ liệu, khôi phục đúng thứ tự dựa trên mốc giờ, số phòng và ghi chú của Lan. Mỗi nguồn cung cấp một phần cần thiết để suy luận; không dùng một đoạn hội thoại đọc nguyên đáp án.

Trước khi nhận được hỗ trợ truy cập từ người trực máy, Minh phải tìm cách dùng tài khoản bảo dưỡng để bảo vệ người giúp mình. Đây là câu đố của một trò chơi hư cấu; không thiết kế thành hướng dẫn truy cập hệ thống thật.

Nhật ký lưu dữ kiện đã tìm. Ghép sai có thể thử lại; các phần chưa khám phá không tự xuất hiện. Đáp án, vị trí từng phần và giao diện ghép sẽ được cụ thể hóa trong bước thiết kế gameplay, chưa coi một mã số hoặc thao tác tùy ý là phần đã duyệt.

## Đoạn căng thẳng Chép dữ liệu dưới giám sát

Khi chép từng phần, Minh phải rời máy và núp lúc lính kiểm tra. Các phần đã chép xong được giữ lại, tránh phải làm lại toàn bộ sau mỗi lần gián đoạn.

Lựa chọn phụ: lấy thêm danh sách của khu khác. Hành động này tăng rủi ro và đem lại chứng cứ bổ sung, nhưng không thay thế dữ liệu bắt buộc hoặc ngăn việc hoàn thành tuyến chính nếu người chơi bỏ qua.

Các chi tiết như thời lượng sao chép, chu kỳ kiểm tra, giới hạn báo động và cách lưu sau tải lại trang cần được kiểm tra riêng khi triển khai; không tự thêm hình phạt mất toàn bộ tiến trình.

## Kết màn Một chiếc USB chưa đủ

Lan trao USB và giải thích dữ liệu vẫn thiếu phần ở phòng giám sát. Minh đi qua cánh cửa Kỹ thuật — Cấm vào. Cảnh kết cho thấy Hùng bắt đầu nghi ngờ có người truy cập trái phép.

Giữ phù hợp với Cửa 06 trong kịch bản chính. Phần phòng giám sát, lệnh chuyển người được xác nhận và chia tay Lan thuộc các mốc sau. Không trao sợi chỉ đỏ hoặc tiết lộ toàn bộ Ông K sớm chỉ để kết Level 02.

Prototype hiện có ba màn chơi. Cần một cầu nối kể chuyện Cửa 07–08 trước nội dung Cửa 09 ở Level 03; không tự coi việc đi qua cửa kỹ thuật là đã hợp lý hóa chuyển thẳng ra sân ngoài. Cầu nối sẽ được thiết kế và kiểm tra trong bước chuyển cảnh.

## Chia chặng triển khai

1. Dựng bố cục Level 02: hành lang giám sát, khu làm việc, điểm NPC và hai hướng đi; kiểm tra di chuyển trước.
2. Nối lời hẹn của Lan, người cấp suất ăn, lời nhắn và thẻ lối phục vụ.
3. Thêm người trực máy, động cơ từ chối và phương án tài khoản bảo dưỡng.
4. Làm ba phần dữ liệu, suy luận thứ tự và nhật ký; kiểm tra khám phá sai thứ tự hoặc bỏ qua hội thoại không gây kẹt.
5. Làm sao chép theo từng phần dưới nhịp tuần tra, cùng danh sách phụ tùy chọn; cân bằng checkpoint và độ khó.
6. Làm cảnh trao USB, cửa kỹ thuật, nghi ngờ của Hùng và cầu nối sang Level 03.

Mỗi chặng cần kiểm tra trước khi chuyển sang chặng kế tiếp. Ưu tiên giữ tiến trình bắt buộc rõ ràng, NPC có động cơ, phản hồi khi suy luận sai và sự khác biệt giữa tuyến chính với khám phá phụ. Chốt kịch bản không đồng nghĩa cho phép đẩy bản chưa thử lên GitHub/Vercel.
