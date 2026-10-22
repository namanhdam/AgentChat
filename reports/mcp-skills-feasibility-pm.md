# MCP và Skill trong Agent Chat — đề xuất PM để trao đổi với techlead

PM · 2026-10-22 · code nền `07ac93337a`, v0.10.0. Đây là đề xuất ban đầu, đã nhận phản biện T60; xem [kết luận PM–techlead](mcp-skills-direction.md). Chưa có quyết định triển khai.

## Mục đích và cách hiểu yêu cầu

End-User yêu cầu PM và techlead bàn về tính khả thi, phương hướng áp dụng MCP/Skill trong dự án. PM hiểu mục tiêu là làm hai mục MCP/Skill trong Cài đặt hữu ích cho nhóm agent: dùng thêm công cụ/dữ liệu và tái sử dụng cách làm theo vai trò. Đây là giả định để techlead phản biện, chưa phải danh sách tính năng đã chốt.

Đầu ra vòng này là phương án có căn cứ từ code và khả năng CLI. Chưa cài server, đăng nhập dịch vụ, đổi cấu hình tài khoản hoặc viết code sản phẩm. Các skill/công cụ có sẵn trong phiên CLI hiện tại không đồng nghĩa Agent Chat đã quản lý được chúng.

## Hiện trạng xác minh bằng code

| Điểm | Hiện trạng và hệ quả |
| --- | --- |
| Giao diện | `index.html:1030–1031,1072–1076`: hai mục MCP/Skill là “sắp có”; chưa có màn hình quản lý thực tế. |
| Thực thi agent | `core.js`, các adapter `CLI.claude/codex/agy` và `exec()`: app gọi CLI rồi nhận stream kết quả; vòng quyết định gọi tool nằm trong CLI. Chỉ thêm một MCP client vào Electron chưa đủ để agent gọi được tool đó. |
| MCP hiện có | `codexLabel()` đọc sự kiện `mcp_tool_call`; `permissionRules()`/`normalizePermissions()` nhận rule `mcp__server__tool` cho Claude. Đây là phần hiển thị/quyền công cụ, chưa phải quản lý server chung. |
| Quyền khác nhau | Adapter app hiện hỗ trợ allowTools cho Claude; từ chối danh sách này với Codex/agy. Codex được truyền sandbox/network; agy không có chế độ quyền custom ở adapter hiện tại. Không hứa một nút bật/tắt áp dụng giống nhau cho cả ba. |
| Tài khoản/phiên | `account()` tách CODEX_HOME/CLAUDE_CONFIG_DIR theo tài khoản; `exec()` dùng cwd của agent và hỗ trợ resume. Cần kiểm cấu hình nào CLI thực sự đọc ở từng trường hợp. |
| Worktree và tin cậy | `prepareWorkspace()` tạo worktree riêng, nối `.chat` dùng chung; cơ chế trust hiện pin agents.json/project.json trong userData. Chưa có quản lý độ tin cậy riêng cho nguồn Skill/MCP. |

## MCP và Skill giải quyết hai việc khác nhau

MCP nối agent với công cụ, dữ liệu và mẫu prompt của server; có kiểu chạy local qua stdio và kết nối remote qua Streamable HTTP. App phải xác định CLI hay chính app sẽ giữ vai trò client/host. [Kiến trúc MCP chính thức](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture).

Skill là gói hướng dẫn có `SKILL.md`, có thể kèm tài liệu/script. Nên đưa tên/mô tả vào danh mục rồi đọc nội dung khi cần; định dạng này không tự tạo kết nối MCP. [Agent Skills](https://agentskills.io/home), [hướng dẫn tích hợp](https://agentskills.io/client-implementation/adding-skills-support).

Đính chính sau phản biện T60: không thể nói chung rằng Skill không cấp quyền. Claude Code dùng `allowed-tools` để duyệt trước các tool trong lượt kích hoạt; nội dung Skill còn có thể dùng cơ chế nội suy lệnh. Vì vậy MVP đề xuất chỉ nhận gói hướng dẫn thuần, phải xem cả metadata lẫn nội dung, không coi nhãn Skill/readOnly là ranh giới quyền. [Quyền của Skill Claude](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill), [nội dung động](https://code.claude.com/docs/en/skills#inject-dynamic-context).

Hai ví dụ đề xuất để kiểm chứng giá trị: Skill “QA phần vừa đổi” giúp chọn đúng kiểm tra và bàn giao ngắn; MCP đọc tài liệu/issue giúp agent có dữ liệu ngoài repo. Cần techlead chọn một ví dụ cụ thể cho mỗi loại; chưa mặc định kết nối dịch vụ hoặc quyền ghi.

## Ba hướng để techlead phản biện

| Hướng | Lợi ích | Giá phải trả | Ý kiến PM |
| --- | --- | --- | --- |
| A. Hướng dẫn dùng cấu hình CLI sẵn có | Ít code nhất, người dùng tận dụng được thứ đã cài | Người dùng vẫn phải cấu hình từng CLI; app khó biết thứ gì thực sự đang hoạt động | Có thể làm bước khảo sát, chưa giải quyết đầy đủ mục quản lý chung |
| B. App quản lý danh mục và lựa chọn; adapter cấu hình theo từng CLI | Hợp kiến trúc đang có; chia nhỏ được theo CLI và theo loại năng lực | Phải kiểm discovery, quyền, tài khoản, worktree và resume; không có adapter thì phải báo chưa hỗ trợ | **PM ưu tiên hướng này**, bắt đầu Skill rồi một MCP đọc dữ liệu |
| C. App giữ toàn bộ kết nối MCP và làm trung gian gọi tool | Có thể quản lý tập trung kết nối và quan sát lời gọi | CLI đang giữ vòng tool; cần thêm cầu nối, auth, hủy lệnh và vòng đời tiến trình, phạm vi lớn hơn nhiều | Chỉ chọn nếu B không đáp ứng một nhu cầu cụ thể đã chứng minh |

Một hướng khác là biến Agent Chat thành MCP server để agent đọc task/memory hoặc thao tác trực tiếp với app. Hướng này khác việc dùng MCP bên ngoài và thay đổi interface điều phối; đề nghị techlead đánh giá riêng, không mặc định thay protocol task-status/run-command đang dùng.

## Hướng áp dụng ban đầu PM đề xuất

1. **Skill trước:** một danh mục nhỏ, nguồn rõ ràng, chọn theo dự án/agent; một Skill thực tế cho QA hoặc review. Ưu tiên cơ chế nạp gốc của CLI. Nếu cần đưa danh mục vào prompt, phải chứng minh agent đọc được tài nguyên trong worktree và không nạp trùng với CLI. Không nhét toàn bộ Skill vào memory/prompt mỗi lượt.
2. **MCP sau:** một CLI đã kiểm chứng và một server đọc dữ liệu. Hiện rõ đã cấu hình/kết nối được/không hỗ trợ. Bật cấu hình không đồng nghĩa gọi tool đã thành công. Không bật mặc định cho mọi agent.
3. **Mở rộng theo bằng chứng:** thêm adapter CLI khác, remote auth hoặc công cụ ghi khi có nhu cầu thật. Chưa cần marketplace, tự cài dependency, broker chung hoặc sửa cách agent bàn giao.

Techlead cần xác định vị trí lưu phù hợp; PM chưa chốt schema. Định hướng: định nghĩa có thể chia sẻ và lựa chọn theo box/agent; thông tin đăng nhập để ngoài repo/log/memory. Không ghi đè cấu hình CLI toàn cục, không biến việc nạp Skill thành quyền sửa ngoài scope. Nguồn Skill có script và server stdio đều có thể chạy code nên phải đi qua cơ chế tin cậy phù hợp, không chỉ hiển thị một nhãn “an toàn”.

Thay nguồn/quyền giữa các lượt cần có quy tắc rõ cho phiên resume. Cần phân biệt “ẩn khỏi danh mục” và “CLI đã ngừng dùng”; nếu chưa thu hồi được trong phiên cũ thì phải báo giới hạn. Đây là câu hỏi kỹ thuật cần xác minh, không phải yêu cầu tạo thêm tầng phê duyệt cho mọi thao tác.

## T60 — phản biện kỹ thuật, techlead phụ trách

Đầu ra: `reports/mcp-skills-feasibility-techlead.md`; chỉ nghiên cứu và báo cáo. Dùng code hiện hành và tài liệu chính thức theo phiên bản CLI thực tế, không suy khả năng agy từ tên hoặc từ Claude/Codex.

- Lập ma trận Claude/Codex/agy: MCP local/remote, cách truyền cấu hình, discovery Skill, quyền công cụ, tài khoản, cwd/worktree, resume. Mỗi ô ghi đã xác minh/chưa xác minh/không hỗ trợ và căn cứ; không đưa token hay config chứa bí mật vào báo cáo.
- Phản biện hướng B: điểm đồng ý, điểm không khả thi, phương án nhỏ hơn nếu có. Chọn CLI và ví dụ đầu tiên dựa trên khả năng xác minh, chưa hứa tương thích toàn bộ.
- Chốt ranh giới “cấu hình dùng chung” với tiến trình/server dùng chung: nhiều CLI chạy song song có gây nhiều server, lẫn box hoặc lẫn quyền không; ai sở hữu vòng đời và xử lý timeout/hủy?
- Xác định khả năng tận dụng cấu hình gốc mà không ghi đè thiết lập người dùng; mô tả đường đi từ chọn Skill/server tới agent thực sự dùng được trong worktree và phiên mới/resume.
- Đề xuất phạm vi MVP, các phần hoãn, thứ tự triển khai và mức công sức kèm giả định. Nếu cần thử nghiệm để trả lời, nêu câu hỏi và probe tối thiểu riêng; chưa chạy thử dịch vụ hoặc triển khai trong T60.

Nghiệm thu T60 bằng đọc báo cáo: có đủ ma trận/căn cứ, khuyến nghị và giới hạn; phân biệt được khả thi từ tài liệu với đã thử thật. Không cần chạy bộ Node/Electron cho lượt nghiên cứu này.

Bước kế: techlead xong gọi thẳng PM để thảo luận và chốt đề xuất gửi End-User. PM tổng hợp điểm thống nhất/bất đồng và lựa chọn cần quyết định trước khi giao triển khai; không coi báo cáo PM này là thiết kế đã được duyệt.
