# T60 — MCP/Skill: phản biện kỹ thuật và MVP đề xuất

Techlead · 2026-10-22 · đối chiếu main/worktree `07ac93337a`, Agent Chat **0.10.0**. Đọc đề xuất PM từ worktree PM vì chưa có trong nhánh này. Đây là kết quả nghiên cứu để PM thống nhất phương án với End-User, **chưa phải contract triển khai**.

## Kết luận để PM chốt phương hướng

**Đồng ý hướng B: Skill trước, MCP sau; CLI tiếp tục thực thi.** Làm trước một Skill nhỏ cho QA và một adapter Claude. Sau khi chứng minh chọn đúng Skill trong phiên mới/resume, thêm một MCP chỉ đọc tài liệu. Không cần đưa SDK MCP vào Electron hoặc thay vòng thực thi hiện tại.

Cần sửa ba điểm trong cách trình bày:

1. Cả **Claude, Codex và agy đều hỗ trợ Skill/MCP gốc**; hai mục “sắp có” chỉ nói về phần quản lý của Agent Chat. Chưa có adapter quản lý không có nghĩa CLI không dùng được.
2. Không hứa “bật/tắt theo agent” tương đương với thu hồi toàn bộ năng lực. Cấu hình người dùng, repo, plugin và nội dung trong phiên cũ có thể còn hiệu lực. MVP chỉ quản lý những gói do app cấp; phần kế thừa phải ghi rõ.
3. Câu “Skill không cấp quyền” cần giới hạn: Claude xử lý `allowed-tools` trong Skill như quyền được duyệt trước cho lượt kích hoạt. MVP nên nhận **gói hướng dẫn thuần**, không tự chấp nhận trường cấp quyền, hook hoặc mã thực thi. [Claude: quyền trong Skill](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill).

Nếu người dùng cần cả ba CLI ngay từ đầu, phương án nhỏ hơn là **danh mục và hướng dẫn cấu hình gốc**, chưa có nút áp dụng riêng theo agent. Không làm một nút chung mà âm thầm sửa cấu hình toàn tài khoản.

## 1. Căn cứ và giới hạn khảo sát

- Đã đọc code hiện hành, memory cập nhật v0.10.0, đề xuất PM; chạy `--version`/`--help` của CLI và các lệnh con quản lý. Chỉ dùng kết quả help, không gọi model hay MCP server.
- Binary tìm thấy trên PATH: `/opt/homebrew/bin/claude` **2.1.308**, `/opt/homebrew/bin/codex` **0.163.0**, `/opt/homebrew/bin/agy` **1.4.5**. Chưa xác nhận tiến trình app đang mở đã nhận cùng PATH. File `cli-paths.json` ở vị trí userData mặc định không có trong lần đọc này; app có logic tự tìm CLI.
- Tài liệu chính thức được đọc ngày 2026-10-22. Tài liệu trực tuyến có thể mới hơn binary; các tính năng chưa thực thi thật được đánh dấu riêng bên dưới.
- Không cài dependency/plugin/server, không đăng nhập dịch vụ, không đọc nội dung token, không đổi config tài khoản, không sửa code sản phẩm. Không chạy Node/Electron: T60 nghiệm thu bằng báo cáo.

Ký hiệu ma trận: **H** = xác minh help/version của binary; **C** = xác minh code Agent Chat; **D** = tài liệu chính thức; **?** = chưa thử tích hợp thực tế. H/D không phải bằng chứng tool đã gọi thành công.

## 2. Hiện trạng code và chỗ tích hợp

| Vị trí | Dữ kiện hiện tại | Hệ quả |
| --- | --- | --- |
| `index.html:1030`, `1072` | MCP và Skill là placeholder. | Chưa có catalog, lựa chọn hay trạng thái áp dụng. |
| `core.js:239`, `298`, `314` | App gọi Claude `-p`, Codex `exec`, agy `-p`, nhận stream; adapter chưa truyền catalog Skill/MCP. | CLI là nơi giữ vòng gọi tool. Kết nối MCP riêng trong Electron không tự xuất hiện trong agent. |
| `core.js:184`, `194`, `1288` | Claude có allow-rule gồm `mcp__server__tool`; Codex dùng sandbox/network, agy dùng mode. | Cho phép tool khác với đăng ký server. Adapter hiện tại chưa có chính sách tool MCP đồng nhất. |
| `core.js:213` | Codex nhận progress `mcp_tool_call`. | Có nền để hiển thị hoạt động, chưa phải kiểm tra kết nối hay quản lý server. |
| `core.js:369`, `2383` | Tài khoản, cwd, workspaceId và session được tách; có resume. | Gói được chọn phải đi theo đúng agent/workspace/tài khoản, không chỉ theo tên CLI. |
| `main.js:323` | Worktree có cwd riêng; `.chat` dùng chung. Agent readOnly có thể chạy ở root. | Đặt Skill/config trong `.chat` không tự khiến CLI khám phá; không dùng cwd làm khóa duy nhất cho lựa chọn theo agent. |
| `core.js:808`, `2195` | Có pin cấu hình tin cậy ở userData và dừng process group. | Tận dụng nền này, nhưng pin hiện chỉ bao phủ agents/project config, không bao phủ mọi gói Skill/MCP kế thừa. |

Phạm vi v0.10.0 giữ nguyên: không khôi phục hệ thống bằng chứng task đã gỡ; không thay `task-status`/`run-command`, luật merge hay quyền PM chỉ để tích hợp Skill.

## 3. Ma trận khả năng theo CLI

### 3.1 MCP và Skill gốc

| Khả năng | Claude Code 2.1.308 | Codex 0.163.0 | agy 1.4.5 |
| --- | --- | --- | --- |
| MCP local/remote | **H:** `mcp add` có stdio/http/sse. **D:** config theo local/user/project. [Claude MCP](https://code.claude.com/docs/en/mcp). **?** Gọi qua Agent Chat. | **D:** stdio và Streamable HTTP; bearer/OAuth. [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli). **H:** có `mcp add/login/logout`. **?** Gọi qua app. | **H:** `mcp add` nhận stdio/http, env/header; có enable/disable. **D:** có config global và workspace. [agy MCP](https://antigravity.google/docs/mcp?tab=cli). **?** Gọi qua app. |
| Truyền MCP riêng lúc spawn | **H:** `--mcp-config` nhận file/JSON; `--strict-mcp-config` bỏ các nguồn MCP khác. **?** Ghép với quyền/resume của app. | **H:** `-c key=value` có cả ở exec và resume. **D:** `mcp_servers.*` có cấu hình bật/tắt/lọc tool. **?** Cách merge override với config kế thừa. | **H:** root/add/enable help chưa thấy cờ nhận config riêng mỗi lượt. **D:** workspace `.agents/mcp_config.json`, global `~/.gemini/config/mcp_config.json`. **?** Cô lập theo agent không đổi global. |
| Nạp Skill | **D:** `.claude/skills`, thư mục personal, plugin; plugin có namespace. [Claude Skills](https://code.claude.com/docs/en/skills). **H:** `--plugin-dir` nạp riêng phiên, repeatable; `--disable-slash-commands` tắt skills/commands. | **D:** quét `.agents/skills` từ cwd tới repo root, user `$HOME/.agents/skills`, cùng nguồn admin/system/plugin. [Codex Skills](https://learn.chatgpt.com/docs/build-skills). **?** Nạp gói ngoài các nguồn đó bằng adapter app. | **D:** `.agents/skills` trong workspace; global `~/.gemini/antigravity-cli/skills`; plugin có skills. [agy Skills](https://www.antigravity.google/docs/skills?tab=cli). **H:** plugin manager; `--disable-slash-commands` tắt mở rộng slash/skill trong print mode. |
| Chọn Skill riêng từng agent | **Đề xuất:** `--plugin-dir` trỏ gói app đã duyệt. **?** Không nạp trùng, không giữ gói đã bỏ qua resume. Không mặc định tắt các Skill kế thừa. | **D:** `skills.config` có enable/disable theo path; **không coi nó là API import thư mục tùy ý**. **?** Override per-run và discovery ngoài cwd. | **?** Không thấy cờ chọn danh sách riêng theo lượt. Workspace có thể dùng chung giữa nhiều agent; plugin global không giải quyết cô lập này. |
| Bật/tắt, lọc tool | **C/H:** app đã biết allowed/disallowed tools. **D:** Skill có thể cấp trước quyền trong lượt; không suy quyền từ nhãn readOnly của agent. | **D:** `enabled_tools`, `disabled_tools`, `enabled` ở MCP server. [Config reference](https://learn.chatgpt.com/docs/config-file/config-reference). **C:** app chưa truyền các trường đó, đang dùng sandbox + approval never. | **C:** app chỉ hỗ trợ edit/full/readOnly, không custom tool allowlist. **H:** MCP enable/disable là lệnh quản lý; chưa xác minh nó chỉ tác động một agent. |

Các cờ CLI trên là khả năng đã tìm thấy, **không phải tính năng Agent Chat đã triển khai**. Với agy, “chưa thấy cờ” không đủ kết luận không thể tích hợp: cần probe scope trước khi chọn cách ghi profile.

### 3.2 Tài khoản, worktree và phiên

| Điểm | Claude | Codex | agy |
| --- | --- | --- | --- |
| Tài khoản app đang chọn | **C:** `claude2` đặt `CLAUDE_CONFIG_DIR=~/.claude2`; plain claude bỏ biến này. | **C:** `codex2` đặt `CODEX_HOME=~/.codex2`, plain dùng `~/.codex`. | **C:** app chưa có alias agy2 hay đổi home tương đương; môi trường được kế thừa. |
| Config phiên | **H:** `--settings`, `--setting-sources`, `--plugin-dir`, `--mcp-config`; phải giữ nguyên tài khoản đăng nhập. | **H:** `-c` dùng được khi exec/resume; bản cài có profile file mới `$CODEX_HOME/<name>.config.toml`. Không dựa trên cú pháp profile cũ. `--ignore-user-config` vẫn dùng auth cùng home nhưng không phải nút tắt mọi nguồn kế thừa. | **D/H:** có config workspace và plugin/global; **?** scope chính xác khi chạy print, nhiều project và conversation cũ. |
| Cwd/worktree | **C:** CLI chạy cwd worktree, thêm sharedChat qua `--add-dir`. **?** đọc resources của plugin ngoài repo với các mức quyền app. | **C:** cwd/workspace riêng. **D:** Skill khám phá theo cây thư mục; user Skill vẫn có thể dùng chung giữa tài khoản. `CODEX_HOME` không đủ để hứa cô lập mọi Skill. | **C:** cwd riêng; **D:** workspace Skill ở `.agents/skills`. **?** quan hệ giữa cwd, project của CLI và conversation đã lưu. |
| Resume | **H:** `--resume`; help còn nêu snapshot system prompt được giữ qua resume theo mặc định. **?** tác động thực tế khi đổi Skill/MCP; không coi snapshot prompt là bằng chứng tool config cũng bị đóng băng. | **C/H:** `exec resume`; có override cấu hình. **?** discovery, tool cache và nội dung Skill cũ sau thay đổi. | **C/H:** `--conversation`; **?** reload và thu hồi config/Skill trong conversation cũ. |

Không đổi `HOME`/`CODEX_HOME`/`CLAUDE_CONFIG_DIR` chỉ để tạo sandbox Skill: các biến này gắn với tài khoản và phiên hiện có. Không ghi token vào config trong repo, argv hoặc báo cáo. Auth của dịch vụ phải do credential store/môi trường đã cấu hình quản lý, tách khỏi danh mục chia sẻ.

## 4. Phương án B nhỏ nhất nên triển khai

### 4.1 MVP Skill — Claude trước

Một gói **`qa-changes`**: hướng dẫn QA đọc yêu cầu và diff, chọn kiểm phù hợp, báo kết quả/lỗi tái hiện ngắn; không chạy lại toàn suite khi không có thay đổi liên quan. Nội dung phải theo quy trình v0.10.0, không nhắc cổng bằng chứng task cũ. Agent Skills dùng `SKILL.md` có tên/mô tả và có thể kèm tài liệu; phần hướng dẫn đầy đủ được nạp khi cần. [Định dạng Agent Skills](https://agentskills.io/specification).

Luồng đề xuất:

1. Người dùng chọn **gói local đã xem nội dung**; app hiển thị nguồn và danh sách file. MVP chỉ cho frontmatter tên/mô tả và hướng dẫn/tài liệu, không nhận hook, script, khai báo MCP hay trường tự cấp quyền. Từ chối gói ngoài tập hỗ trợ, không âm thầm bỏ trường rồi tuyên bố tương đương.
2. App lưu bản sao nội dung đã duyệt theo hash trong userData; lưu lựa chọn theo box/agent. Định nghĩa có thể xuất/chia sẻ nhưng việc file xuất hiện trong repo **không tự kích hoạt**. Chưa cần thiết kế registry/marketplace.
3. Adapter Claude tạo wrapper plugin tối thiểu chỉ chứa Skill, truyền đường dẫn tuyệt đối bằng `--plugin-dir` cho đúng lượt. Namespace riêng tránh đụng tên; resources giải theo thư mục gói. Không chép thư mục sinh ra vào source worktree hay sửa config toàn tài khoản.
4. UI ghi “Được app cấp cho lượt kế tiếp”, đồng thời phân biệt năng lực kế thừa từ CLI. Không hứa đã vô hiệu mọi Skill khác. Nếu probe cho thấy không cô lập được gói app quản lý, dừng ở hướng A thay vì viết config global làm đường vòng.
5. Chọn tường minh Skill ở lượt thử đầu; sau đó đánh giá mô tả có kích hoạt đúng khi giao việc QA thông thường. Cả hai cần kiểm riêng: được nạp và làm đúng việc.

Đây là đề xuất triển khai dựa trên cờ CLI, chưa thử bằng model. Ưu tiên Claude vì có `--plugin-dir` riêng phiên cùng cơ chế MCP riêng lượt rõ trong help, **không phải vì Codex/agy thiếu Skill**.

### 4.2 MCP kế tiếp — một ví dụ đọc tài liệu

Chọn **OpenAI Docs MCP**, endpoint `https://developers.openai.com/mcp`, trên cùng adapter Claude. Đây là server công khai để tìm/đọc tài liệu, không gọi OpenAI API thay người dùng. [Mô tả server chính thức](https://developers.openai.com/learn/docs-mcp). Chưa kết nối hoặc gọi server trong T60; trước MVP xác nhận lại yêu cầu auth và tool list thực tế.

App sinh JSON riêng, truyền `--mcp-config`; rule quyền theo tên tool được kiểm chứng, không tự đổi agent sang Toàn quyền. Có thể dùng `--strict-mcp-config` cho pilot **chỉ khi người dùng chọn chế độ chỉ dùng danh sách MCP này**; hiển thị rõ server kế thừa sẽ không được dùng trong lượt. Chế độ mặc định bảo toàn cấu hình gốc, và không gọi danh sách đó là “toàn bộ quyền hiệu lực”.

Tách trạng thái: đã cấu hình → CLI đã nạp/khám phá → lời gọi thử thành công, kèm thời điểm/CLI/tài khoản. Nếu adapter không có event xác nhận thì ghi “chưa xác minh”, không đoán từ việc process chạy hay model nói đã kết nối. Không gửi câu hỏi model hoặc gọi MCP có phí âm thầm để cập nhật đèn trạng thái.

### 4.3 Phiên mới và thay đổi cấu hình

Đề xuất lưu dấu cấu hình năng lực cạnh session: gói/hash, server config không bí mật, lựa chọn quyền, adapter và tài khoản. Mỗi job chụp cấu hình lúc bắt đầu. Thay đổi khi job đang chạy chỉ áp dụng lượt kế, không sửa file cấu hình mà process hiện tại đang dùng.

Khi dấu này đổi, mở **phiên mới ở lượt tiếp theo**, tận dụng handoff sẵn có; không tự thêm lượt AI. Nội dung đã vào hội thoại cũ không bị xóa bằng cách ẩn Skill. Tắt ngay một khả năng đang chạy cần Dừng lượt trước; vẫn không hứa hoàn tác tác động đã gửi tới dịch vụ.

Đây là chính sách bảo thủ cho MVP, không khẳng định mọi CLI bắt buộc fresh khi sửa config. Chỉ cho resume qua thay đổi sau khi có probe chứng minh đúng. Giữ nguyên cơ chế xoay phiên theo token đang có, không gộp thành một dự án sửa session mới.

## 5. Cấu hình dùng chung không phải process dùng chung

MCP host tạo client cho từng server; stdio thường phục vụ một client, remote HTTP có thể phục vụ nhiều client. [Kiến trúc MCP](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture).

| Tình huống | Quy tắc đề xuất và phần cần kiểm |
| --- | --- |
| Nhiều agent dùng một định nghĩa | Chia sẻ gói/config đã duyệt; mỗi job có lựa chọn/quyền/cwd riêng. Không chia sẻ một process stdio giữa các CLI. |
| Local stdio | CLI sở hữu việc khởi chạy server. Dùng executable và args tường minh, cwd/data dir theo box nếu server có trạng thái. Tránh mặc định `npx -y` hoặc tự tải mã khi bật. Không tự sao chép toàn bộ env/secret sang server. |
| Stop/timeout | App dừng nhóm tiến trình hiện có; cần probe server con, process tách nhóm và file lock. Claude có cơ chế dừng stdio riêng, nhưng chưa chứng minh bao phủ lúc app cưỡng bức dừng. [Vòng đời stdio Claude](https://code.claude.com/docs/en/mcp#how-claude-code-stops-a-stdio-server). |
| Remote dùng chung | Dịch vụ có thể dùng chung endpoint nhưng tài khoản/phạm vi truy cập phải rõ. “Hủy” client không bảo đảm server đã hủy hành động; công cụ ghi chưa vào MVP. |
| Tắt app | Giữ quyết định hiện tại: không tự giết agent khi thoát. Không xóa gói/config runtime khi process còn dùng; dọn sau khi xác nhận lượt kết thúc. |
| Đọc file và quyền | Scope source/khóa file của Agent Chat không tự trở thành quyền MCP. Shell sandbox/readOnly cũng không đủ để suy server không ghi dữ liệu ngoài máy. Phải giới hạn tool và quyền phía dịch vụ riêng. |
| Nguồn không tin cậy | Mô tả/tool output vẫn là dữ liệu; không dùng chúng để nâng quyền, thay task hoặc cấu hình. Pin phải bao phủ cả nội dung gói được app cấp, không chỉ đường dẫn dễ bị thay đổi. |

App làm **MCP server cho task/memory** là hướng riêng: hữu ích nếu cần agent/ứng dụng ngoài đọc trạng thái có schema. Hiện chưa có nhu cầu chứng minh tốt hơn block protocol. Nếu làm sau, bắt đầu API chỉ đọc với định danh box, auth và revision; chưa đưa sửa task/merge vào quyền tool ở MVP này.

## 6. Probe tối thiểu trước khi chốt contract

Các probe dưới đây **chưa chạy**; T60 chỉ đề xuất. Dùng repo/box tạm và giới hạn lượt, không dùng dữ liệu công việc thật.

| Probe | Câu hỏi phải trả lời và tiêu chí đạt |
| --- | --- |
| P1 — Skill Claude | Gói QA thuần nạp qua plugin-dir trong print mode; tài liệu tương đối đọc được ở worktree; output chỉ ra đúng nội dung đặc trưng. Gói không được chọn không được app cấp. Kiểm cả lựa chọn tường minh và kích hoạt theo mô tả. |
| P2 — cấu hình kế thừa/quyền | Cài fixture có Skill/MCP khác ở user/project; inventory phân biệt đúng. Gói có allowed-tools/hook/script bị MVP từ chối trước spawn. Không có thao tác nâng quyền hoặc ghi config toàn cục. |
| P3 — resume/tài khoản | Hai agent, hai box, thêm trường hợp chung cwd và tài khoản hậu tố. Đổi gói/bỏ chọn → lượt kế fresh; không dùng nhầm session/config cũ. Gói không đổi vẫn resume được. |
| P4 — MCP chỉ đọc | Đăng ký endpoint tài liệu cho một agent; xác nhận qua event thực tế + một tool call. Kiểm lỗi mạng/tool bị từ chối, không chuyển full, không treo chờ hộp hỏi quyền không ai trả lời. |
| P5 — vòng đời local | Server fixture do nhóm kiểm soát ghi PID/marker; hai CLI tạo hai process đúng cwd; Stop/timeout không để process thuộc lượt bị dừng chạy tiếp. Không giết lượt khác. Kiểm thoát app giữ hành vi hiện tại. Chỉ cần khi chuẩn bị hỗ trợ stdio. |
| P6 — mở rộng CLI | Codex: override per-run, discovery, scope home/Skill; agy: ưu tiên workspace/global, print-mode và conversation. Nếu không bảo đảm lựa chọn riêng agent mà không ghi global, chỉ hỗ trợ catalog/hướng dẫn cho CLI đó. |

Một lỗi probe → lưu output và sửa nguyên nhân trước khi thử tiếp; không chạy lặp đến khi xanh. Không suy “Skill được liệt kê” thành “đã tuân thủ workflow”, hay “server online” thành “agent dùng được tool”.

## 7. Phạm vi, công sức và bước tiếp

Ước lượng sơ bộ theo **ngày công kỹ thuật**, một BE và một FE phối hợp; chưa tính thời gian chờ duyệt/tài khoản. Chỉ áp dụng khi cờ CLI giữ như bản khảo sát, không phát sinh auth doanh nghiệp hay dependency mới.

| Đợt | Đầu ra | Công sức dự kiến |
| --- | --- | --- |
| 0 | Probe P1–P3, xác nhận discovery/quyền/resume; chốt contract nhỏ | 1–2 ngày kỹ thuật + 0,5–1 ngày QA |
| 1 | Claude Skill MVP: import gói thuần, chọn agent, snapshot/fresh, UI trạng thái | 3–5 ngày kỹ thuật + 1–2 ngày QA |
| 2 | Một MCP HTTP chỉ đọc trên Claude, quyền và xác nhận lời gọi P4 | 2–3 ngày kỹ thuật + 1 ngày QA |
| Sau | Codex, rồi agy nếu P6 đạt; stdio sau P5 | Ước lượng lại theo kết quả, không hứa parity trong đợt 1 |

Hoãn: marketplace, tải/cài tự động, secret editor/OAuth flow chung, remote tool ghi, process broker dùng chung, adapter giả lập cho cả ba CLI, Skill chứa hook/script và MCP server điều phối Agent Chat. Khi có nhu cầu cụ thể mới đưa vào phạm vi.

**Đề nghị PM thống nhất:** B theo từng đợt; Claude đầu tiên; Skill `qa-changes`; MCP tài liệu chỉ đọc làm bước kế. Nếu mục tiêu thực tế là kết nối GitHub/Drive/DB ngay, cần đổi thứ tự theo nhu cầu đó thay vì mặc định Skill trước. PM hỏi End-User về hai lựa chọn sản phẩm này khi gửi đề xuất chung, chưa giao dev chỉ từ báo cáo T60.

## 8. Kiểm tra báo cáo

Đã đối chiếu đủ các mục T60: khả năng ba CLI, quyền/tài khoản/cwd/resume, cô lập lựa chọn, process và Stop, hướng MVP, công sức, probe và phần hoãn. Nguồn web đặt cạnh nhận định; cờ binary dựa trên help tại máy, còn tích hợp đều ghi chưa thử. Kiểm whitespace tài liệu trước bàn giao; không tuyên bố kiểm Node/Electron hay tích hợp MCP/Skill đã đạt.
