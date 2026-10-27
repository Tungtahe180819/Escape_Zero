# Escape Zero

Prototype HTML5 dùng Phaser 3 + TypeScript + Vite, phát triển trong IntelliJ IDEA.

## Chạy project

Mở thư mục gốc `D:\Anh_Content_T7\escape-zero` trong IntelliJ, rồi chạy trong Terminal:

```powershell
npm run dev
```

Kiểm tra TypeScript và production build:

```powershell
npx tsc --noEmit
npm run build
```

## Tìm file nhanh

| Cần làm | Mở tại |
|---|---|
| Xem task, bằng chứng kiểm tra và bước tiếp theo | `docs/PROGRESS.md` |
| Xem sơ đồ toàn bộ project | `docs/PROJECT_STRUCTURE.md` |
| Sửa gameplay Level-01 | `src/scenes/levels/Level01Scene.ts` |
| Sửa gameplay Level-02 | `src/scenes/levels/Level02Scene.ts` |
| Sửa menu, màn hoàn thành | `src/scenes/core/` |
| Sửa nhân vật, guard, camera giám sát | `src/entities/` |
| Chỉnh độ khó stealth | `src/config/stealthConfig.ts` |
| Vẽ map trong Tiled | `public/assets/maps/level-01.tmx`, `level-02.tmx` |
| Map JSON mà game tải | `public/assets/maps/level-01.json`, `level-02.json` |
| Báo cáo thử nghiệm | `docs/playtests/` |

Chỉnh `.tmx`, lưu rồi export đè `.json` cùng thư mục. Đường dẫn tileset trong map
giữ là `../tilesets/greybox-tiles.png`. Đóng các tab Tiled trỏ tới đường dẫn cũ
`public/assets/map` hoặc `src/assets` và mở lại từ thư mục `maps` mới.

Level-01 và Level-02 đã qua gate G4. P5 chưa bắt đầu. Theo dõi trạng thái mới nhất
trong `docs/PROGRESS.md`.

`archive/` chứa bản map cũ và file mẫu không dùng, được giữ để khôi phục.
`node_modules/` là thư viện cài bằng npm; `dist/` là kết quả build. Không sửa trực
tiếp hai thư mục này.
