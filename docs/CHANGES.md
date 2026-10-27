# Thay đổi phạm vi / tổ chức

## MAP-02-01 — Vùng núp dưới camera Level-02

- Date: 2026-10-22
- Requested by: developer in chat; đặt hide-03 ngay dưới camera.
- Decision: ACCEPTED; cập nhật đồng thời TMX/JSON.
- Change: hide-03 X=1376 -> 1168; Y=192, kích thước 64x48 giữ nguyên.
  Tâm vùng núp X=1200 khớp cameraSpawn X=1200.
- Affected: EZ-P4-01/EZ-P4-04, bố cục Level-02; không đổi luật phát hiện.
- Effort estimate: chỉnh một object và kiểm tra lại vị trí/đồng bộ dữ liệu.
- Risk: thay đổi nhịp tránh camera; ba lượt playtest trước đây áp dụng bố cục cũ.
- Verification: kiểm tra dữ liệu và TypeScript; cần thử cúi/đứng dưới camera trong game.

## ORG-01 — Sắp xếp project trước P5

- Date: 2026-10-22
- Requested by: developer in chat.
- Reason: phân biệt file từng level, code dùng chung, màn test và asset nguồn;
  giảm nguy cơ chỉnh nhầm bản Tiled cũ.
- Decision: ACCEPTED; thực hiện trước EZ-P5-01.
- Affected: import/scene registration, tên Level01Scene, URL map, vị trí tài liệu.
- Effort estimate: một lượt refactor và một lượt kiểm tra thủ công.
- Risk: sai import/scene key, URL asset hoặc mở tab Tiled tại đường dẫn cũ.
- Mitigation: cập nhật mọi tham chiếu, giữ asset/map nguyên nội dung, archive bản
  cũ, chạy typecheck/build và kiểm tra map/TMX, yêu cầu smoke test trong game.
- Gameplay: không thay đổi quy tắc, độ khó, tọa độ map hoặc tiến độ roadmap.
- Automated verification: `npm run build` passed (TypeScript + Vite, 24 modules);
  unique scene keys, registered transition targets, stealth tuning import,
  map/TMX tile and object equality, tileset files and production asset paths passed.
  Archived asset hashes match their original contents; archive is excluded from dist.
- Status: implementation and automated verification complete; manual game/Tiled
  smoke test pending in docs/PROGRESS.md. No gameplay acceptance claimed by automation.
