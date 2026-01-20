# Build Instructions

## GitHub Actions - Tự động build trên GitHub

### Cấu hình GitHub Secrets (Cho macOS code signing)

Để build và ký code cho macOS, bạn cần thêm các secrets sau vào GitHub repository:

1. Vào **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Thêm các secrets sau (Tùy chọn - chỉ cần nếu muốn code signing):

   - `APPLE_CERTIFICATE`: Base64-encoded certificate (.p12)
   - `APPLE_CERTIFICATE_PASSWORD`: Mật khẩu của certificate
   - `APPLE_SIGNING_IDENTITY`: Identity của certificate (e.g., "Developer ID Application: Your Name")
   - `APPLE_ID`: Apple ID email
   - `APPLE_PASSWORD`: App-specific password từ Apple ID
   - `APPLE_TEAM_ID`: Team ID từ Apple Developer account

**Lưu ý:** Nếu không có Apple Developer account, workflow vẫn chạy được nhưng app sẽ không được ký (unsigned).

### Cách tạo Base64 certificate:

```bash
# Export certificate từ Keychain Access thành file .p12
# Sau đó chạy:
base64 -i certificate.p12 | pbcopy
# Paste vào APPLE_CERTIFICATE secret
```

### Trigger build

Workflow sẽ tự động chạy khi:
- Push code lên branch `main` hoặc `master`
- Tạo Pull Request
- Tạo tag với format `v*` (ví dụ: `v1.0.0`)
- Chạy thủ công từ tab Actions

### Tạo release với tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Workflow sẽ tự động:
1. Build Teacher app
2. Build Student app
3. Tạo draft release với cả 2 file DMG

### Download build artifacts

Sau khi workflow chạy xong:
1. Vào tab **Actions** trong GitHub repository
2. Click vào workflow run
3. Scroll xuống phần **Artifacts**
4. Download:
   - `screensharing-teacher-macos` - Teacher app
   - `screensharing-student-macos` - Student app

## Build Local (Trên máy Mac)

### Build Teacher App

```bash
# Build frontend
npm run build

# Build Tauri app
npm run tauri:build

# Hoặc gộp lại:
npm run tauri:build
```

File output:
- DMG: `src-tauri/target/release/bundle/dmg/Screen Sharing Teacher_*.dmg`
- App: `src-tauri/target/release/bundle/macos/Screen Sharing Teacher.app`

### Build Student App

```bash
# Build frontend student
npm run build:student

# Build Tauri app student
npm run tauri:build:student
```

File output:
- DMG: `src-tauri/target/release/bundle/dmg/Screen Sharing Student_*.dmg`
- App: `src-tauri/target/release/bundle/macos/Screen Sharing Student.app`

### Build Universal Binary (Intel + Apple Silicon)

```bash
# Thêm targets
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin

# Build teacher
npm run build
tauri build --target universal-apple-darwin

# Build student
npm run build:student
tauri build --config src-tauri/tauri.student.conf.json --target universal-apple-darwin
```

## Yêu cầu hệ thống

### Để build trên macOS:
- macOS 10.15 hoặc mới hơn
- Xcode Command Line Tools
- Node.js 18+
- Rust (cài qua rustup)

### Cài đặt dependencies:

```bash
# Xcode Command Line Tools
xcode-select --install

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node dependencies
npm install
cd mediasoup-server && npm install && cd ..
```

## Troubleshooting

### Lỗi "xcrun: error: unable to find utility"
```bash
sudo xcode-select --switch /Library/Developer/CommandLineTools
```

### Lỗi build mediasoup-server
```bash
cd mediasoup-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

### App không mở được trên macOS (unsigned)
```bash
# Cho phép mở app unsigned
xattr -cr "Screen Sharing Teacher.app"
```

## Cấu trúc Output

```
src-tauri/target/
├── release/
│   └── bundle/
│       ├── dmg/
│       │   ├── Screen Sharing Teacher_0.1.0_aarch64.dmg
│       │   └── Screen Sharing Teacher_0.1.0_x64.dmg
│       └── macos/
│           └── Screen Sharing Teacher.app
└── universal-apple-darwin/
    └── release/
        └── bundle/
            ├── dmg/
            │   └── Screen Sharing Teacher_0.1.0_universal.dmg
            └── macos/
                └── Screen Sharing Teacher.app
```

## Phân phối

### Không có code signing:
- Gửi file DMG cho người dùng
- Người dùng cần chạy: `xattr -cr "Screen Sharing Teacher.app"` trước khi mở

### Có code signing:
- File DMG đã được ký
- Người dùng có thể mở trực tiếp (có thể cần xác nhận lần đầu)

### Notarization (Tùy chọn):
- Cần Apple Developer account ($99/năm)
- App sẽ được Apple xác minh và không bị cảnh báo khi mở
