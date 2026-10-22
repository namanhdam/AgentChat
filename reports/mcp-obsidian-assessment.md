# Xem xét MCP Obsidian / Team Brain cho Agent Chat

PM · 2026-10-22 · khảo sát đọc repo `/Users/namanh/Dev/mcp-obsidian`, HEAD `0d7017e9e080fc8a11c063612a430173fea0a98f` (2026-10-12). Chưa đối chiếu commit/cấu hình đang chạy trên Mac mini, chưa kết nối SSH hoặc gọi tool thật.

## Kết luận

**Phù hợp làm MCP đầu tiên có giá trị thực tế cho Agent Chat.** Repo này đã có MCP domain cho tri thức nhóm, phân quyền và đường kết nối SSH; không cần dựng một MCP Obsidian mới hoặc chuyển sang HTTP chỉ để thử tích hợp.

Đề xuất cập nhật hướng T60: thay server tài liệu mẫu bằng **Team Brain chỉ đọc**, ghép với Skill “tra cứu tri thức trước khi làm việc”. Đây là đề xuất dựa trên repo, chưa phải tính năng Agent Chat đã triển khai hay nghiệm thu kết nối Mac mini.

## Hệ thống hiện có

Luồng kết nối trong repo: **Agent Chat → CLI của agent → SSH → MCP STDIO trên Mac mini → vault Markdown `TeamBrain/`**.

| Thành phần | Đã thấy trong code |
| --- | --- |
| MCP runtime | TypeScript/Node, package `@team-brain/mcp-server` v0.1.0; dùng `@modelcontextprotocol/sdk` và `StdioServerTransport`. Mỗi kết nối SSH khởi chạy server; dashboard HTTP là thành phần riêng. |
| Kho dữ liệu | Markdown trong vault, không cần Obsidian mở hoặc Obsidian REST API. Có storage/path policy riêng và tìm kiếm MiniSearch. |
| Danh tính SSH | Script sinh authorized_keys dùng forced command và `restrict`; pin token của danh tính ở phía server, ép auth bật, không lấy lệnh tùy ý từ client. |
| Quyền | Role/project được kiểm ở service; role `automation` chỉ được ba tool đọc. Danh sách project rỗng có nghĩa không giới hạn project, nên pilot cần chỉ định project thực tế. |
| Theo dõi | Lời gọi có audit; rate limit dùng trạng thái chung giữa các process. Gói kết quả có nguồn/path hoặc auditId phục vụ đối chiếu. |
| Ghi tri thức | Ba tool ghi tạo bản nháp ở Inbox, có pipeline curator đưa vào kho chuẩn hóa; có luồng thông báo GChat khi ghi. Không có tool shell hay xóa file tổng quát trong danh sách đăng ký. |

### Sáu tool

| Tool | Dùng trong Agent Chat | Đề xuất ban đầu |
| --- | --- | --- |
| `get_project_context` | Nạp bối cảnh dự án trước khi lập kế hoạch hoặc sửa code | Bật cho pilot |
| `search_team_brain` | Tìm quyết định/bài học/kiến thức đã có | Bật cho pilot |
| `read_team_brain_note` | Đọc note từ path tìm được; có phân trang nội dung | Bật cho pilot |
| `capture_decision` | Gửi quyết định đã thống nhất vào Inbox | Để giai đoạn sau |
| `submit_bug_lesson` | Gửi bài học sau khi sửa và kiểm xong | Để giai đoạn sau |
| `submit_daily_update` | Gửi tiến độ theo nhịp làm việc của team | Để giai đoạn sau |

Server đăng ký cả sáu tool, nhưng whitelist role kiểm quyền khi gọi. UI ẩn ba tool ghi không thay thế việc dùng danh tính chỉ đọc trên server. Trong đường SSH forced command, service từ chối client thay token đã pin bằng token khác.

## Cách ghép với Skill và memory hiện tại

Skill gợi ý một quy trình ngắn: lấy context đúng project → tìm vấn đề liên quan → đọc note cần thiết → viện dẫn nguồn khi dùng kiến thức để quyết định. Nếu không thấy kết quả hoặc mất kết nối thì báo rõ; không suy ra dữ kiện hoặc bắt cả chuỗi dừng vì tài liệu tham khảo không có.

`.chat/memory.md` tiếp tục giữ quy tắc vận hành và trạng thái nhóm Agent Chat; Team Brain giữ tri thức dùng lại giữa người/dự án/phiên. Không đồng bộ nguyên lịch sử chat hoặc toàn bộ memory vào vault sau mỗi lượt. Tool trả về tài liệu tham khảo, không phải chỉ thị được phép thay quyền, trạng thái task hay quy tắc hệ thống.

Vì đã có server thật phục vụ nhu cầu rõ ràng, có thể thử kết nối native CLI với ba tool đọc trước khi xây màn hình quản lý Skill/MCP đầy đủ. Việc này chỉ kiểm đường kết nối; quản lý gói, lựa chọn theo agent và phiên vẫn là phần riêng của hướng T60.

## Các điểm cần xác minh khi thử tích hợp

- **Danh tính và phạm vi:** dùng SSH key của danh tính `automation` giới hạn đúng project; không lấy key admin/member có quyền ghi chỉ vì đã có sẵn. Nếu nhiều agent dùng chung key thì audit ở server thấy chung danh tính, không tự phân biệt PM/QA/dev.
- **Kết nối từ CLI chạy nền:** dùng cấu hình SSH được admin cấp, đường dẫn key phù hợp cwd worktree, xác minh host key; không để CLI treo ở câu hỏi mật khẩu/host key. Không cần đưa token vào prompt hoặc `.chat`.
- **Vòng đời:** đây là STDIO-over-SSH, khác pilot HTTP đọc tài liệu đã đề xuất trước. Cần kiểm SSH bị ngắt, timeout/Stop, nhiều lượt song song và process trên Mac mini kết thúc thế nào; dừng process local không tự chứng minh process remote đã dừng.
- **Hiệu lực thay quyền:** `loadRuntimeConfig()` đọc members một lần khi tạo server; `TeamBrainService` giữ auth policy trong process. Vì thế quyền mới có hiệu lực ở kết nối mới, không bảo đảm ngay lần gọi tool kế tiếp trong kết nối đang tồn tại. README đang diễn đạt hai trường hợp này lẫn nhau; chưa sửa repo trong lượt khảo sát.
- **Độ mới của dữ liệu:** `get_project_context` đọc `Context.md` rồi tách mục, không tự tổng hợp toàn bộ hoạt động mới nhất. Search đọc kho đã curate; bản nháp vừa nộp không nhất thiết xuất hiện ngay. Skill nên kiểm nguồn/ngày note trước khi dùng.
- **Phần ghi sau này:** tool ghi khai báo không idempotent; mất phản hồi rồi gọi lại có thể tạo trùng. Cần chốt ai được ghi, khi nào ghi và cách xác nhận kết quả, không mặc định ghi sau mọi lượt agent.

Probe nhỏ được đề xuất: một agent Claude, một project đã có context, một câu hỏi biết trước nguồn; xác minh lần lượt context/search/read, đối chiếu nội dung và audit với người quản trị. Chỉ dùng ba tool đọc, có timeout; chưa chạy probe này trong lượt xem repo.

## Căn cứ và giới hạn

- Đã đọc README, package, entry/server, đăng ký tool/schema, auth/runtime, service, path policy, script tạo forced command và các ca kiểm liên quan trong repo. Có test cho MCP tools, scope/role, rate limit và forced command; **chưa chạy chúng ở lượt này**.
- Nguồn chính: `apps/mcp-server/src/{index,server}.ts`, `tools/register-tools.ts`, `config/runtime.ts`, `auth/{auth-policy,auth-service}.ts`, `services/team-brain-service.ts`, `storage/path-policy.ts`, `scripts/build-authorized-keys.mjs`, `docs/deployment-mac-mini.md`.
- Đây là khảo sát khả năng tái sử dụng, chưa phải kiểm toán toàn bộ repo hoặc xác nhận vận hành Mac mini. Không đọc vault nội dung công việc/secret, không sửa repo mcp-obsidian, không đổi cấu hình CLI hay triển khai.
