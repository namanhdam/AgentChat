# MCP/Skill — kết luận trao đổi PM và techlead

2026-10-22 · T60 · Agent Chat v0.10.0. **Nghiên cứu hoàn tất; đề xuất dưới đây chưa được duyệt triển khai.**

## Kết luận

Khả thi về kiến trúc và khả năng CLI đã khảo sát. PM và techlead thống nhất để **CLI tiếp tục thực thi, Agent Chat quản lý gói và lựa chọn theo agent**. Làm **Skill trước, MCP sau**, bắt đầu với Claude. Chưa có bằng chứng tích hợp chạy thật trong Agent Chat; không cam kết khả năng bật/tắt đồng nhất trên cả ba CLI.

Giá trị mong muốn: Skill giúp nhóm dùng lại quy trình QA/review mà không lặp hướng dẫn dài mỗi lượt; MCP bổ sung nguồn dữ liệu/công cụ bên ngoài khi công việc cần. Hai mục này bổ trợ nhau, không thay luật giao việc, scope hay hàng chờ merge hiện hành.

## Những điểm đã thống nhất hoặc điều chỉnh

| Điểm trao đổi | Kết luận |
| --- | --- |
| MCP/Skill đang ở đâu? | Placeholder là phần quản lý của Agent Chat. Techlead xác minh help/version và tài liệu của Claude 2.1.308, Codex 0.163.0, agy 1.4.5 có hỗ trợ gốc; chưa chứng minh các lựa chọn đó đi đúng qua app. |
| Vì sao chọn Claude đầu tiên? | Help có cách nạp plugin/config MCP riêng lúc chạy, phù hợp hướng adapter. Đây là ưu tiên thử nghiệm, không phải kết luận Codex/agy thiếu Skill hoặc MCP. |
| Có cần MCP SDK/broker trong Electron ngay? | Chưa cần cho hướng đã chọn; CLI đang giữ vòng gọi tool. Chỉ thiết kế tầng trung gian nếu một nhu cầu thực tế không giải quyết được bằng adapter. |
| Skill có cấp quyền không? | PM sửa nhận định ban đầu: cách CLI xử lý Skill có thể cấp quyền hoặc thực thi nội dung động; bản đầu chỉ nhận hướng dẫn thuần, không suy quyền từ tên gói. |
| Nút tắt có thu hồi mọi thứ không? | Chỉ quản lý gói do app cấp. Cấu hình kế thừa từ người dùng/repo/plugin và nội dung đã vào phiên cũ phải được phân biệt, không hứa xóa bằng một nút tắt. |
| Thay lựa chọn khi đang chạy | Đề xuất mỗi lượt giữ cấu hình đã chụp; thay đổi áp dụng ở lượt sau và mở phiên mới khi cấu hình năng lực đổi. Không tự thêm lượt AI chỉ để cập nhật cấu hình. |
| Dùng chung giữa agent | Dùng chung định nghĩa/gói đã chọn không đồng nghĩa dùng chung process MCP; việc đọc/ghi, tài khoản, cwd và vòng đời vẫn phải theo từng lượt. |

Điểm quyền đã được PM đối chiếu lại: `allowed-tools` của Claude cấp quyền cho lượt kích hoạt, không phải danh sách hạn chế mọi tool; hướng dẫn có thể chứa lệnh được nội suy. Định nghĩa “thuần” ở bước thiết kế phải loại trừ cả cơ chế này, không chỉ bỏ script/hook trong thư mục. [Tài liệu quyền Skill](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill), [nội dung động](https://code.claude.com/docs/en/skills#inject-dynamic-context).

## Phạm vi nên làm theo thứ tự

1. **Thử nghiệm nhỏ trước khi viết tính năng:** một gói `qa-changes` trên Claude trong repo/box tạm. Xác minh gói được chọn thực sự nạp được, tài liệu tương đối đọc được từ worktree, không lẫn agent/tài khoản, thay lựa chọn không dùng lại phiên cũ sai cấu hình. So sánh có/không có Skill để biết quy trình QA có tốt hơn, không chỉ kiểm tên Skill xuất hiện.
2. **MVP Skill:** chọn gói local đã xem nội dung, xem nguồn, gán agent; app giữ bản nội dung đã chọn và phân biệt phần app cấp với phần CLI kế thừa. Gói thuần có tên/mô tả/hướng dẫn/tài liệu; không tự chạy script, hook, nội suy lệnh hoặc khai báo cấp quyền. Không ghi đè config toàn tài khoản, không tạo file runtime vào source worktree.
3. **MCP sau khi Skill ổn:** một server đọc tài liệu, cùng adapter Claude; phải kiểm cả khám phá tool và một lời gọi thực tế. Phân biệt đã cấu hình, đã nạp và đã gọi thành công; lỗi mạng/từ chối quyền phải hiện rõ. Chưa gồm công cụ ghi dữ liệu, đăng nhập chung hay marketplace.
4. **Mở rộng:** Codex và agy sau probe riêng về discovery, quyền, worktree và resume. Local stdio chỉ thêm sau khi kiểm quản lý process/Stop/timeout; giữ quyết định không tự giết agent khi tắt app.

Nếu nhu cầu ưu tiên là GitHub/Drive/DB ngay, PM đề nghị đổi thứ tự sang MCP tương ứng. Nếu bắt buộc cả ba CLI trong bản đầu, phương án nhỏ hơn là danh mục và hướng dẫn cấu hình gốc; chưa cung cấp nút áp dụng riêng từng agent khi chưa kiểm chứng cô lập.

## Công sức và điều kiện chuyển sang triển khai

Ước lượng sơ bộ của techlead, chưa phải lịch cam kết: probe 1–2 ngày kỹ thuật + 0,5–1 ngày QA; MVP Skill 3–5 ngày kỹ thuật + 1–2 ngày QA; MCP HTTP chỉ đọc 2–3 ngày kỹ thuật + 1 ngày QA. Ước lượng lại sau probe; chưa tính auth đặc thù hoặc yêu cầu hỗ trợ cả ba CLI ngay.

Bước được đề xuất tiếp theo chỉ là probe Skill trên Claude. Trước khi chạy cần chốt phạm vi probe, số lượt/timeout và dữ liệu fixture; không tự cài server hay thay tài khoản thật từ kết luận nghiên cứu này. Kết quả probe mới là căn cứ chốt thiết kế tính năng và giao dev.

## Nghiệm thu T60 và nguồn

PM chấp nhận T60 là **nghiên cứu đã hoàn tất**: báo cáo có ma trận ba CLI, căn cứ help/code/tài liệu, phân tích quyền/tài khoản/worktree/resume/vòng đời, phương án MVP, ước lượng và các probe còn phải làm. Đóng T60 không có nghĩa tính năng MCP/Skill đã triển khai hoặc đã kiểm tích hợp.

- [Đề xuất ban đầu và đính chính PM](mcp-skills-feasibility-pm.md).
- [Báo cáo techlead](mcp-skills-feasibility-techlead.md), bản đọc để nghiệm thu ở commit `3770b22`; lúc PM bắt đầu tổng hợp, file chưa có trong worktree PM nên đã đọc bản ở worktree techlead, không cần gộp lại code sản phẩm.
- Lượt tổng hợp chỉ sửa tài liệu và bổ sung kết luận vào memory; không chạy model/MCP, Node hay Electron. Các lần kiểm help/version là khảo sát của techlead, không phải thử tính năng trong app.
