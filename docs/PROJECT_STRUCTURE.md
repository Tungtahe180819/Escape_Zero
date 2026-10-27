# Cấu trúc project

Updated: 2026-10-22

```text
escape-zero/
├── README.md
├── src/
│   ├── main.ts
│   ├── config/
│   │   ├── gameConfig.ts
│   │   └── stealthConfig.ts
│   ├── scenes/
│   │   ├── core/       BootScene, MenuScene, LevelCompleteScene
│   │   ├── levels/     Level01Scene, Level02Scene
│   │   └── dev/        GuardTestScene, GreyboxScene
│   ├── entities/       Player, Guard, SurveillanceCamera
│   ├── systems/
│   │   ├── input/        InputManager
│   │   ├── interaction/  Interactable, InteractionSystem
│   │   ├── progress/     MissionSystem, CheckpointSystem
│   │   └── stealth/      GuardStateMachine, DetectionSystem, DetectionMeter
│   └── styles/          game.css
├── public/
│   ├── favicon.svg
│   └── assets/
│       ├── maps/        level-01.tmx/json, level-02.tmx/json
│       └── tilesets/    greybox-tiles.png
├── docs/
│   ├── PROGRESS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── CHANGES.md
│   └── playtests/       level-02.md
├── archive/
│   └── 2026-10-22-cleanup/  bản cũ và asset mẫu; không dùng trong game
├── package.json
├── package-lock.json
├── tsconfig.json
└── index.html
```

## Quy tắc phân loại

- `scenes/core`: luồng chung như khởi động, menu, kết quả.
- `scenes/levels`: phối hợp gameplay riêng của từng màn; Level-03 sẽ thêm tại đây
  khi bắt đầu P5.
- `scenes/dev`: màn thử nghiệm; GuardTestScene có nút vào từ menu, GreyboxScene
  được giữ nhưng chưa đăng ký trong gameConfig.
- `entities`: đối tượng có hình ảnh/hành vi trong thế giới game.
- `systems`: logic dùng chung, chia theo trách nhiệm; tránh sao chép sang mỗi level.
- `config`: cấu hình game và thông số độ khó. Vị trí spawn/waypoint lấy từ Tiled.
- `public/assets`: tài nguyên đang dùng. Không tạo bản map thứ hai trong `src`.
- `docs`: trạng thái, quyết định và bằng chứng; mỗi báo cáo playtest có file riêng.

## Các đường dẫn đã đổi

| Trước | Sau |
|---|---|
| `src/scenes/LevelScene.ts` | `src/scenes/levels/Level01Scene.ts` |
| `src/scenes/Level02Scene.ts` | `src/scenes/levels/Level02Scene.ts` |
| `src/scenes/{BootScene,MenuScene,LevelCompleteScene}.ts` | `src/scenes/core/` |
| `src/scenes/{GuardTestScene,GreyboxScene}.ts` | `src/scenes/dev/` |
| `src/systems/InputManager.ts` | `src/systems/input/InputManager.ts` |
| `src/systems/{Interactable,InteractionSystem}.ts` | `src/systems/interaction/` |
| `src/systems/{MissionSystem,CheckpointSystem}.ts` | `src/systems/progress/` |
| `src/systems/{GuardStateMachine,DetectionSystem,DetectionMeter}.ts` | `src/systems/stealth/` |
| `src/style.css` | `src/styles/game.css` |
| `public/assets/map/` | `public/assets/maps/` |
| `docs/PLAYTEST_LEVEL02.md` | `docs/playtests/level-02.md` |

Tên class và scene key `LevelScene` đổi thành `Level01Scene`; menu, Replay,
gameConfig đã cập nhật cùng nhau. `level-01`/`level-02` là mã dữ liệu màn chơi,
không đổi. Các thông số gameplay không đổi.

## Làm việc với Tiled sau khi chuyển

1. Đóng tab bản đồ cũ để không ghi nhầm đường dẫn đã chuyển vào archive.
2. Mở `.tmx` tại `public/assets/maps/`.
3. Chỉnh, lưu, export JSON cùng thư mục và cùng tên level.
4. Hai file `.tmx` và `.json` phải có cùng layer/object; ảnh tileset nằm tại
   `public/assets/tilesets/`, đường dẫn trong map là `../tilesets/greybox-tiles.png`.
5. Reload game; kiểm tra Console và build trước khi chốt task.

## Kiểm tra sau sắp xếp

- TypeScript/build và asset/map verification: xem bằng chứng trong PROGRESS.
- Kiểm tra thủ công: PLAY Level-01, NEXT LEVEL, hoàn thành/Replay Level-02,
  GUARD AI TEST, thoát menu và mở `.tmx` từ thư mục mới.
