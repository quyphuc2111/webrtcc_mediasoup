# Screen Sharing - WebRTC + Mediasoup SFU

Ứng dụng chia sẻ màn hình cho lớp học với hỗ trợ 30-50 học sinh đồng thời.

## Tính năng

- ✅ Chia sẻ màn hình với âm thanh hệ thống
- ✅ Chia sẻ giọng nói qua microphone
- ✅ Hỗ trợ 30-50 clients đồng thời
- ✅ Tối ưu cho máy cấu hình thấp
- ✅ WebRTC + SFU (Mediasoup)
- ✅ Tự động khởi động server khi mở app

## Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Teacher App (Tauri)                   │
├─────────────────────────────────────────────────────────┤
│  React Frontend          │  Mediasoup Server (Sidecar)  │
│  - Screen capture        │  - WebSocket signaling       │
│  - Audio capture         │  - SFU routing               │
│  - mediasoup-client      │  - Room management           │
├─────────────────────────────────────────────────────────┤
│                    Tauri Backend (Rust)                  │
│                  - Sidecar management                    │
└─────────────────────────────────────────────────────────┘
                              │
                              │ WebRTC
                              ▼
┌─────────────────────────────────────────────────────────┐
│                Students (30-50 clients)                  │
│              Browser hoặc Student App                    │
└─────────────────────────────────────────────────────────┘
```

## Cài đặt

### 1. Cài đặt dependencies

```bash
# Frontend
npm install

# Mediasoup server
npm run server:install
```

### 2. Build Mediasoup server

```bash
npm run server:build
```

### 3. Chạy development

```bash
# Terminal 1: Mediasoup server
npm run server:dev

# Terminal 2: Tauri app
npm run tauri dev
```

## Sử dụng

Ứng dụng có 2 phiên bản riêng biệt:
- **Teacher App** (`Screen Sharing Teacher.app`) - Dành cho giáo viên
- **Student App** (`Screen Sharing Student.app`) - Dành cho học sinh

### Giáo viên (Teacher App)

1. Mở ứng dụng **Screen Sharing Teacher**
2. Click "Khởi động Server"
3. Nhập tên và Room ID
4. Click "Kết nối Server"
5. Click "Chia sẻ màn hình + Âm thanh"
6. Chia sẻ Server URL cho học sinh

### Học sinh (Student App)

1. Mở ứng dụng **Screen Sharing Student**
2. Nhập Server URL (nhận từ giáo viên)
3. Nhập tên và Room ID
4. Click "Vào lớp học"
5. Click "Kết nối vào lớp"

### Development

```bash
# Chạy Teacher app
npm run tauri dev

# Chạy Student app (terminal riêng)
npm run tauri:dev:student
```

## Tối ưu cho máy cấu hình thấp

- Resolution: 720p max
- Frame rate: 24fps
- Codec: VP8 (nhẹ hơn VP9/H264)
- Simulcast: 3 layers cho adaptive quality
- Max 2 Mediasoup workers
- Giới hạn bitrate: 1.5Mbps

## Build Production

### Build tự động với GitHub Actions

Repository này có GitHub Actions workflow để tự động build app cho macOS:

1. **Build Unsigned** (Không cần Apple Developer account):
   - Vào tab **Actions** → **Build macOS Apps (Unsigned)**
   - Click **Run workflow**
   - Chọn build target: `both`, `teacher`, hoặc `student`
   - Download artifacts sau khi build xong

2. **Build với Code Signing** (Cần Apple Developer account):
   - Cấu hình GitHub Secrets (xem `.github/BUILD_INSTRUCTIONS.md`)
   - Push code hoặc tạo tag `v*` để trigger build
   - Release tự động được tạo với file DMG

Xem chi tiết: [Build Instructions](.github/BUILD_INSTRUCTIONS.md)

### Build local trên macOS

```bash
# Build Teacher app
npm run build
npm run tauri:build

# Build Student app  
npm run build:student
npm run tauri:build:student

# Build Universal Binary (Intel + Apple Silicon)
npm run build
tauri build --target universal-apple-darwin

npm run build:student
tauri build --config src-tauri/tauri.student.conf.json --target universal-apple-darwin
```

File output:
- Teacher DMG: `src-tauri/target/release/bundle/dmg/Screen Sharing Teacher_*.dmg`
- Student DMG: `src-tauri/target/release/bundle/dmg/Screen Sharing Student_*.dmg`

## Cấu trúc thư mục

```
├── src/                      # React frontend
│   ├── components/
│   │   ├── TeacherView.tsx
│   │   ├── StudentView.tsx
│   │   └── VideoPlayer.tsx
│   ├── hooks/
│   │   └── useMediasoup.ts
│   ├── lib/
│   │   └── mediasoup-client.ts
│   └── App.tsx
├── src-tauri/                # Tauri backend
│   ├── src/
│   │   └── lib.rs
│   └── binaries/             # Sidecar binaries
├── mediasoup-server/         # Node.js SFU server
│   └── src/
│       ├── index.ts
│       ├── config.ts
│       ├── Room.ts
│       ├── MediasoupManager.ts
│       └── SignalingServer.ts
└── package.json
```

## Yêu cầu hệ thống

### Server (Giáo viên)
- CPU: 2+ cores
- RAM: 4GB+
- Network: 10Mbps+ upload

### Client (Học sinh)
- Browser: Chrome/Edge/Firefox (mới nhất)
- Network: 2Mbps+ download
