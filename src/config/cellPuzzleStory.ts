import type { DialogueLine } from '../systems/story/DialogueTypes'

export const TUAN_LOCK_CLUE: readonly DialogueLine[] = [
    { speaker: 'Tuấn', text: 'Anh mở được cửa rồi? Em nghe lính nói cổng tầng trên còn có khóa số. Đừng chạy thẳng ra đó.' },
    { speaker: 'Tuấn', text: 'Em mới 19 tuổi. Họ hứa cho việc để trả nợ cho bố, rồi đưa em vào đây. Trên hồ sơ họ chẳng ghi tên thật nữa.' },
    { speaker: 'Minh', text: 'Em có nhớ họ nhập thế nào không?' },
    { speaker: 'Tuấn', text: 'Họ đọc: buồng trước, ca sau, tổ cuối. Chỉ lấy chữ số cuối của mỗi mục. Sổ đổi ca nằm ở phòng hồ sơ tầng 2.' },
    { speaker: 'Minh', text: 'Em biết quy tắc mở cổng, sao lại nói cho anh?' },
    { speaker: 'Tuấn', text: 'Một mình em không tới được đó. Anh đi trước xem đường. Em sẽ canh tiếng lính, không để họ biết cửa đã mở.' },
    { speaker: 'Minh', text: 'Vậy giúp anh nhớ tên những người ở đây. Mình không chỉ tìm đường cho một người.' },
]

export const ARCHIVIST_STORY: readonly DialogueLine[] = [
    { speaker: 'Minh', text: 'Bà có hồ sơ của Tuấn không? Cậu ấy mới 19 tuổi, ở cùng buồng với tôi.' },
    { speaker: 'Người ghi sổ', text: 'Không có ai tên Tuấn trong danh sách hiện hành. Tôi không biết người cậu hỏi.' },
    { speaker: 'Minh', text: 'Nhưng cậu ấy vừa nói chuyện với tôi...' },
    { speaker: 'Người ghi sổ', text: 'Đừng hỏi nữa. Tôi chỉ chép những gì họ đưa. Không ai được tự ý xem sổ đổi ca.' },
    { speaker: 'Minh', text: 'Bà đang nhìn về tập giấy cạnh tủ. Mình cần kiểm tra trước khi kết luận.' },
]

export const TORN_LEDGER_CLUE: readonly DialogueLine[] = [
    { speaker: 'Sổ hiện hành', text: 'Dòng HS19 bị gạch chéo; ô tên đã bị phủ mực. Gáy sổ còn dấu một trang bị xé, mép giấy chưa cũ.' },
    { speaker: 'Minh', text: 'Có người đã sửa cuốn sổ này. Chưa thể biết vì sao, cũng chưa đủ để khẳng định đó là Tuấn.' },
]

export const TRANSFER_ORDER_CLUE: readonly DialogueLine[] = [
    { speaker: 'Lệnh chuyển người', text: 'Danh sách dự kiến bàn giao trước sáng: HS19 — 19 tuổi — nợ của bố. Chờ xác nhận của trưởng ca. Tên thật không được ghi trên bản này.' },
    { speaker: 'Minh', text: 'Mã HS19 vẫn xuất hiện ở đây dù đã bị gạch trong sổ. Phải đối chiếu với lời Tuấn rồi hỏi lại người ghi sổ.' },
]

export const ARCHIVIST_CONFESSION: readonly DialogueLine[] = [
    { speaker: 'Người ghi sổ', text: 'Cậu nói đúng. Tôi đã gạch dòng đó theo lệnh. Nếu không làm, họ sẽ bắt cả phòng chịu phạt.' },
    { speaker: 'Minh', text: 'Còn trang bị xé? Bà giấu nó ở đâu?' },
    { speaker: 'Người ghi sổ', text: 'Ở dưới bìa sổ. Tôi giữ tên thật của họ, để một ngày còn có người tìm được. Tuấn, 19 tuổi, nợ của bố. Mã HS19.' },
    { speaker: 'Người ghi sổ', text: 'Cậu ấy nằm trong kế hoạch chuyển người trước sáng. Đây là trang gốc. Sổ đổi ca trên bàn có thể giúp cậu tìm đường.' },
    { speaker: 'Minh', text: 'Tôi sẽ tìm đường, rồi tìm cách quay lại. Tôi không muốn tên của họ chỉ còn là những con số.' },
]

export const ARCHIVIST_RECALL: readonly DialogueLine[] = [
    { speaker: 'Người ghi sổ', text: 'Trang gốc cậu đã ghi lại: Tuấn, 19 tuổi, mã HS19. Lệnh bàn giao mới là dự kiến, nhưng đừng chờ đến sáng.' },
    { speaker: 'Người ghi sổ', text: 'Tôi đã cho cậu xem sổ đổi ca. Giữ cả trang gốc lẫn lời khai trong nhật ký; đừng để chúng bị lẫn với bản đã sửa.' },
]

export const TECHNICIAN_STORY: readonly DialogueLine[] = [
    { speaker: 'Người thợ điện', text: 'Tôi từng sửa điện dân dụng. Họ giữ giấy tờ rồi bắt tôi bảo dưỡng khóa cho trại. Có mã cũng chưa đủ: nguồn khóa đang bị ngắt.' },
    { speaker: 'Người thợ điện', text: 'Dùng ba nút ở phòng này: ngắt BÁO ĐỘNG trước, nối ĐÈN KIỂM TRA sau, cuối cùng cấp NGUỒN KHÓA. Làm sai thứ tự mạch sẽ tự ngắt.' },
    { speaker: 'Người thợ điện', text: 'Những nét sửa trên sơ đồ là của người từng thử mở cửa trước cậu. Họ chỉ cắt điện rồi mắc kẹt trước khóa. Tôi giữ lại cách nối đúng, mong lần sau có người đi xa hơn.' },
    { speaker: 'Minh', text: 'Tôi sẽ dùng cách anh để lại. Nếu qua được cổng, tôi phải mang chuyện ở đây ra ngoài.' },
]

export const CLEANER_STORY: readonly DialogueLine[] = [
    { speaker: 'Người lau dọn', text: 'Tôi phải lau lối này mỗi đêm nên thuộc tiếng giày của hắn. Đừng cố nhảy qua đầu lính.' },
    { speaker: 'Người lau dọn', text: 'Núp khi hắn còn đi tuần, đợi hắn quay lưng rồi mới chuyển hốc. Nếu đã bị đuổi, phải chạy khuất mắt hắn trước khi dừng lại.' },
    { speaker: 'Minh', text: 'Cảm ơn. Nếu tìm được đường ra, tôi sẽ tìm cách giúp những người còn lại.' },
]

export const ROSTER_CLUE: readonly DialogueLine[] = [
    { speaker: 'Sổ đổi ca', text: 'Khu B · Buồng 07. Ca trực 02. Tổ phụ trách 04. Tuyến gác gồm phòng trực và chốt gác tầng trên.' },
    { speaker: 'Minh', text: 'Các con số có thể mở cổng. Mình cần ghép chúng theo đúng quy tắc Tuấn nghe được. Đã ghi vào nhật ký.' },
]

export const CHAT_EVIDENCE: readonly DialogueLine[] = [
    { speaker: 'Tờ giấy trên tường', text: 'Kịch bản chat: đọc đúng lời soạn sẵn, giữ liên lạc với khách, báo số tiền đã chuyển cho trưởng ca. Không đạt chỉ tiêu sẽ bị tăng nợ.' },
    { speaker: 'Minh', text: 'Họ ép người trong trại làm chuyện này. Mình phải nhớ nội dung để làm bằng chứng. Đã ghi vào nhật ký.' },
]
