# Tầng 2 Khu hồ sơ và phòng gác

Trạng thái: thiết kế cốt truyện đã được chủ dự án duyệt ngày 2026-11-10. Chặng người ghi sổ đã triển khai để chơi thử: phủ nhận, sổ bị sửa, lệnh chuyển người, đối chất, thú nhận và trao trang gốc. Câu đố điện dự phòng và lối vòng qua kho chưa triển khai; mạch ba nút cũ vẫn hoạt động trong lúc chờ bước kế tiếp.

### Kiểm tra chặng người ghi sổ

- Nói chuyện với Tuấn ở tầng 1; đến phòng hồ sơ tầng 2 nghe bà phủ nhận.
- Tìm SỔ BỊ SỬA ở X=928 và LỆNH CHUYỂN ở X=1400 trong phòng an toàn. Có thể tìm chúng trước khi nói chuyện với bà.
- Nhấn J để xem lời khai chưa xác minh, quan sát trên sổ và tài liệu bàn giao; các mục chưa tìm không tự xuất hiện.
- Quay lại bà, nhấn E đối chất. Thiếu dữ kiện hoặc chọn sai vẫn có thể đóng bảng và tìm tiếp.
- Chọn lập luận có căn cứ, rồi nhấn E với bà lần nữa để nghe thú nhận và nhận trang gốc. Bỏ qua phần trình bày vẫn nhận đúng trang đã mở khóa.
- Chỉ lúc này mới đọc được sổ đổi ca. Có thể hỏi lại bà sau đó mà không nhận trang gốc lặp lại.
- Hồi sinh giữ manh mối và trang đã nhận trong lượt chơi; Restart Level xóa toàn bộ trạng thái câu đố như trước. Chưa có lưu nhật ký qua tải lại trang.

Kiểm tra tự động mô hình, callback tương tác và giao diện lựa chọn đã đạt; cần người chơi xác nhận chặng truyện trước khi làm bước tiếp theo.

## Vai trò trong hành trình

Tầng 2 hé lộ rằng Tuấn sắp bị chuyển khỏi trại. Minh phải hiểu thông tin, giành được sự tin tưởng của những người bị giữ ở đây và tìm đường lên tầng 3 trước khi kế hoạch chuyển người diễn ra. Chưa dùng đồng hồ đếm ngược ở giai đoạn này: sự khẩn cấp được kể qua hội thoại và tài liệu, không ép người chơi đọc vội.

Giữ bố cục đã chốt: phòng hồ sơ an toàn bên phải, phòng gác với một bảo vệ bên trái. Tầng 3 có hai bảo vệ. Thiết kế mới không tự đổi tốc độ lính, luật núp hoặc phần tầng 1 đã được người chơi xác nhận đạt.

## Người ghi sổ và trang danh sách bị giấu

Ban đầu bà nói không có hồ sơ của Tuấn. Bà đang tự bảo vệ vì bị ép sửa danh sách và sợ người hỏi là người của trại.

Minh thấy dấu trang bị xé và một số hiệu quen thuộc trong tập giấy chuyển người. Người chơi phải đối chiếu tuổi, hoàn cảnh của Tuấn với các ghi chép, sau đó dùng điểm mâu thuẫn để hỏi lại bà. Chỉ chọn một hồ sơ từ trí nhớ không còn là toàn bộ câu đố.

Khi được đưa ra chứng cứ phù hợp, bà thú nhận đã giấu trang gốc để giữ lại tên thật của các nạn nhân. Bà cho Minh xem trang gốc và sổ đổi ca. Phát hiện quan trọng là Tuấn có trong danh sách dự kiến chuyển người; câu chuyện chuyển từ tìm một lối ra cho Minh sang lo cho người vẫn còn ở lại.

Tiến trình dự kiến: lời phủ nhận → quan sát dấu sửa/xé → đối chiếu lời Tuấn → chỉ ra mâu thuẫn → lời thú nhận → nhận trang gốc và lịch đổi ca. Chọn sai có phản hồi để tìm tiếp; không khóa vĩnh viễn nhánh hội thoại.

## Thợ điện và đường cấp nguồn dự phòng

Ông biết cách cấp điện cho khóa nhưng không sẵn lòng giúp: lần trước có người thử trốn khiến cả phòng bị phạt. Đây là lý do ông ngần ngại, không phải một NPC chỉ chờ đọc đáp án.

Minh tìm ghi chú bảo dưỡng và đối chiếu với sơ đồ, nhãn trên tủ điện. Ghi chú chứng minh có đường cấp điện dự phòng cho khóa mà không bật lại đèn cảnh báo trong phòng gác. Người chơi mang thông tin này về để thuyết phục ông.

Sau đó người chơi chọn đúng đường cấp nguồn dựa trên chức năng từng nhánh. Lời NPC, sơ đồ và nhãn máy cung cấp các phần thông tin bổ sung nhau. Không giải bằng cách chép lại một danh sách thao tác đã được NPC đọc nguyên thứ tự.

Tiến trình dự kiến: ông từ chối vì sợ liên lụy → tìm ghi chú → giải thích phương án dự phòng → ông hợp tác → suy luận mạch cấp nguồn → khóa tầng 3 có điện. Cách đấu dây, đáp án và hậu quả thao tác sai sẽ được xác định khi triển khai; chưa tự bổ sung hình phạt báo động hoặc mất tiến trình vào thiết kế đã duyệt.

## Người lau dọn và lựa chọn đường đi

Người lau dọn biết danh sách chuyển người sẽ được mang lên tầng 3 vào cuối ca. Thông tin của ông giúp Minh hiểu lý do cần lên tầng trên và vị trí cần tìm tiếp.

Ông chỉ ra hai hướng:

- Qua phòng gác: đường ngắn, phải quan sát hướng lính và chuyển giữa các hốc núp.
- Tìm chìa kho để mở lối vòng: cần khám phá thêm, đổi lại dễ né lính hơn.

Cả hai đường đều tới tầng 3 và đều hợp lệ. Nhánh kho là lựa chọn khám phá, không trở thành điều kiện bắt buộc vô tình chặn đường chính. Lối vòng sẽ được bố trí trong phạm vi khu hồ sơ/phòng gác hiện tại; hình học và vị trí chìa cần được kiểm tra trong bước dựng map.

## Kết tầng và liên kết kịch bản chính

Minh hiểu rằng mở cổng cho bản thân chưa giải quyết được tình cảnh của Tuấn và những người khác. Anh quyết định tìm được đường rồi quay lại, gieo động cơ cho tuyến giải cứu về sau.

Đây là phần mở rộng đã được chủ dự án chấp thuận cho prototype. Giữ nguyên Lan, Tuấn và tuyến hai mươi cánh cửa trong kịch bản chính. Tầng này báo trước nguy cơ chuyển người; lệnh chính thức của Hùng/Ông K và phần chia tay ở các cửa sau vẫn có vai trò xác nhận, nâng mức nguy hiểm. Không tiết lộ danh tính hay giải quyết tuyến Ông K ngay tại tầng 2.

## Quy tắc trải nghiệm

- Thông tin quan trọng được ghi trong nhật ký; phân biệt lời đồn, lời khai và tài liệu đã kiểm chứng.
- Có thể hỏi lại NPC để xem thông tin đã biết mà không nhận thưởng hoặc thay đổi tiến trình lặp lại.
- Bỏ qua trình bày hội thoại vẫn giữ các manh mối mà người chơi thực sự đã mở khóa; không tự trao tài liệu chưa khám phá.
- Sai một suy luận không làm mất cả màn. Phản hồi hướng về dữ kiện cần xem lại, không tiết lộ ngay đáp án.
- Không đặt giới hạn thời gian ở bước triển khai đầu tiên.
- Checkpoint trong phòng an toàn giữ kết quả câu đố đã hoàn thành theo luật của lượt chơi hiện tại. Không tự thay đổi quy tắc Restart Level hay lưu qua tải lại trang.
- Chứng cứ phụ và lựa chọn đường vòng không được nhập nhằng với các điều kiện bắt buộc mở cổng.

## Các bước tích hợp để kiểm tra lần lượt

1. Dựng trạng thái hội thoại người ghi sổ và các dấu hiệu trên hồ sơ; kiểm tra đọc sai thứ tự vẫn tìm được hướng tiếp.
2. Thêm đối chiếu chứng cứ, trang gốc và phát hiện về Tuấn; cập nhật nhật ký và mục tiêu.
3. Dựng động cơ thợ điện, ghi chú bảo dưỡng, sơ đồ và câu đố cấp nguồn; thay thế cơ chế ba nút đọc sẵn khi bản mới đã kiểm tra xong.
4. Mở rộng hội thoại người lau dọn, dựng chìa kho và lối vòng; kiểm tra cả hai tuyến đều qua được.
5. Thêm nhịp kết tầng và nối mục tiêu lên tầng 3; kiểm tra lại trạng thái cổng cuối với các nhánh mới.
6. Chơi lại toàn tuyến: bỏ qua hội thoại, hỏi lại, chọn sai, khám phá ngược thứ tự, hồi sinh và chơi lại từ đầu.

Mỗi bước là một phần việc riêng để người chơi xác nhận trước khi chuyển bước tiếp theo. Việc lưu thiết kế này không đồng nghĩa đã chỉnh map, mã nguồn hoặc bản đang triển khai trên Vercel.
