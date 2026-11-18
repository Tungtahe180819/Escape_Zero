import type { DialogueLine } from '../systems/story/DialogueTypes'
export const NIGHT_FOOD: readonly DialogueLine[] = [
    { speaker: 'Người cấp suất ăn', text: 'Lan ở khu làm việc phía dưới. Lối ngắn phải qua lính và camera; lối phục vụ bên trái dài hơn nhưng ít người kiểm tra.' },
    { speaker: 'Người cấp suất ăn', text: 'Cầm thẻ này. Nếu gặp anh tôi ở phòng máy, nhắn rằng chúng tôi vẫn chờ anh về. Đừng để anh nghĩ mình đã bị quên.' },
]
export const NIGHT_LAN: readonly DialogueLine[] = [
    { speaker: 'Lan', text: 'Cậu tới được rồi. Những người ngồi ở đây đang bị ép gõ tin nhắn suốt đêm. Tuấn cũng bị đưa tới làm việc.' },
    { speaker: 'Minh', text: 'Người ghi sổ nói Tuấn sắp bị chuyển đi. Nếu tìm được cửa sau, mình đưa em ấy đi ngay được không?' },
    { speaker: 'Lan', text: 'Họ đã đổi tên em ấy thành HS19. Ra ngoài mà không có hồ sơ, cậu sẽ chỉ biết rằng em ấy từng ở đây. Còn họ sẽ nói chưa từng giữ người nào tên Tuấn.' },
    { speaker: 'Lan', text: 'Tôi chia danh sách nạn nhân thành ba phần A, B, C để tránh bị phát hiện. Tìm đủ rồi xếp theo giờ, từ đầu đến cuối ca; số phòng chỉ giúp nhận diện từng phần.' },
    { speaker: 'Lan', text: 'Người trực máy có thể giúp. Muốn mang dữ liệu ra, phải ghép đúng và chép tại ba máy trên hành lang. Đã chép xong phần nào thì phần đó được giữ.' },
    { speaker: 'Minh', text: 'Vậy tôi sẽ quay lại hành lang máy. Những người giúp mở cửa cho tôi phải có tên trong chứng cứ, không thể chỉ biến mất khỏi cuốn sổ.' },
]
export const NIGHT_WORKER: readonly DialogueLine[] = [
    { speaker: 'Người trực máy', text: 'Tài khoản cá nhân của tôi bị ghi lại mỗi lần truy cập. Nếu trưởng ca thấy, cả phòng sẽ chịu phạt.' },
    { speaker: 'Minh', text: 'Có tài khoản nào dành cho bảo dưỡng máy không? Tôi sẽ tìm giấy hướng dẫn, không bắt anh mạo hiểm vô ích.' },
]
export const NIGHT_MAINTENANCE: readonly DialogueLine[] = [
    { speaker: 'Ghi chú kỹ thuật', text: 'BV-02: tài khoản bảo dưỡng cho máy xuất dữ liệu. Chỉ người trực máy kích hoạt được; không dùng tài khoản cá nhân để thử hệ thống.' },
    { speaker: 'Minh', text: 'Mang ghi chú này về có thể thuyết phục được anh ấy.' },
]
export const NIGHT_ACCOUNT: readonly DialogueLine[] = [
    { speaker: 'Người trực máy', text: 'Đúng là còn tài khoản bảo dưỡng. Tôi sẽ kích hoạt cho các máy xuất. Nhưng lính vẫn đi tuần, cậu phải tự chọn thời điểm chép.' },
    { speaker: 'Người trực máy', text: 'Nếu thấy tên người cấp suất ăn, giữ cả dòng đó. Là em tôi. Đừng chỉ mang những con số ra ngoài.' },
]
export const NIGHT_USB: readonly DialogueLine[] = [
    { speaker: 'Lan', text: 'Đủ ba phần rồi. Cầm chiếc USB này. Nó chứa tên những người đang bị giữ, nhưng còn thiếu dữ liệu trong phòng giám sát.' },
    { speaker: 'Minh', text: 'Lúc mở cửa buồng, tôi chỉ nghĩ tới mẹ và đường về. Giờ tôi không thể đi về rồi coi như chưa từng gặp mọi người.' },
    { speaker: 'Lan', text: 'Cậu vẫn phải sống để về với mẹ. Mang USB theo. Nó là cách để người bên ngoài biết tìm chúng tôi ở đâu.' },
]
export const NIGHT_ENDING: readonly DialogueLine[] = [
    { speaker: 'Cửa 06 · Kỹ thuật — Cấm vào', text: 'Minh lách qua cửa sắt, USB giấu trong tay. Ánh xanh từ khu giám sát hắt ra trước mặt.' },
    { speaker: 'Hùng · Qua bộ đàm', text: 'Máy xuất vừa có lượt truy cập. Kiểm tra lại ca trực. Có người đang nhìn những thứ không được phép nhìn.' },
    { speaker: 'Đoạn nối prototype · Cửa 07', text: 'Minh chép thêm sơ đồ hàng rào và dữ liệu chuyển tiền trong phòng giám sát. Anh phát hiện kế hoạch chuyển mình và Tuấn sang trại khác.' },
    { speaker: 'Đoạn nối prototype · Cửa 08', text: 'Lan gây hỗn loạn để mở đường. Minh kéo Tuấn ra khỏi khu chờ và dụ Hùng vào kho lạnh. Nhưng Lan bị trật chân, không thể trèo rào.' },
    { speaker: 'Minh', text: 'Tôi không để hai người ở lại. Tôi sẽ chờ.' },
    { speaker: 'Tuấn', text: 'Anh mang cái đó ra ngoài. Đừng để chúng em biến mất như những người trong danh sách. Em giấu chị Lan được; anh đứng lại thì cả ba sẽ bị tìm thấy.' },
    { speaker: 'Lan và Tuấn', text: 'Tuấn ở lại giấu Lan. Minh buộc sợi chỉ đỏ vào tay cô: “Giữ giúp tôi. Tôi sẽ quay lại lấy.” Lan đẩy anh ra cửa sau.' },
    { speaker: 'Cửa 09 · Hàng rào cuối cùng', text: 'Minh bước ra sân giữa còi hú. Phía trước là hàng rào cuối cùng; phía sau vẫn còn những người anh đã hứa quay lại cứu.' },
]

export const NIGHT_DATA_STORIES: Record<'A' | 'B' | 'C', readonly DialogueLine[]> = {
    C: [
        { speaker: 'Phần C — 00:15 · Phòng 07', text: 'Danh sách đầu ca còn tên thật của Tuấn. Bên cạnh là ghi chú khoản nợ của bố — trùng với lời em kể sau song cửa.' },
        { speaker: 'Minh', text: 'Đây là dòng nối Tuấn với mã HS19. Giữ nó lại, người ngoài mới đối chiếu được.' },
    ],
    A: [
        { speaker: 'Phần A — 01:10 · Phòng 12', text: 'Tên thật đã chuyển thành mã. Bảng ca giữa ghi số tin nhắn phải gửi và khoản nợ tăng thêm nếu không đạt. Người trực máy cũng nằm trong bảng này.' },
        { speaker: 'Minh', text: 'Anh ấy không phải người tự do chọn giúp hay không. Mỗi lần mở tài khoản cho mình đều có thể khiến anh ấy bị phạt.' },
    ],
    B: [
        { speaker: 'Phần B — 02:00 · Phòng 19', text: 'Cuối ca: HS19 chờ bàn giao sang trại khác. Dòng người giao nhận thay cho ô tên; không có xác nhận của người bị chuyển.' },
        { speaker: 'Minh', text: 'Ghép ba mốc giờ mới thấy họ đã biến một người có tên thành một mã để chuyển đi. Không thể để mất phần nào.' },
    ],
}
