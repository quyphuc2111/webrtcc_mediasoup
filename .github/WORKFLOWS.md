# GitHub Actions Workflows

Repository này có 3 workflows tự động:

## 1. Build macOS Apps (Unsigned) ⭐ Khuyến nghị

**File**: `.github/workflows/build-macos-unsigned.yml`

**Khi nào dùng**: Build nhanh không cần Apple Developer account

**Cách chạy**:
1. Vào tab **Actions**
2. Chọn **Build macOS Apps (Unsigned)**
3. Click **Run workflow**
4. Chọn target:
   - `both` - Build cả Teacher và Student
   - `teacher` - Chỉ build Teacher
   - `student` - Chỉ build Student
5. Click **Run workflow**

**Output**:
- Universal DMG (Intel + Apple Silicon)
- Không cần code signing
- Người dùng cần right-click → Open lần đầu

**Thời gian**: ~15-20 phút

---

## 2. Build macOS Apps (Signed)

**File**: `.github/workflows/build-macos.yml`

**Khi nào dùng**: Build production với code signing

**Yêu cầu**:
- Apple Developer account ($99/năm)
- Cấu hình GitHub Secrets (xem BUILD_INSTRUCTIONS.md)

**Trigger tự động**:
- Push lên branch `main` hoặc `master`
- Tạo Pull Request
- Tạo tag `v*` (ví dụ: `v1.0.0`)

**Output**:
- Universal DMG đã được ký
- Tự động tạo GitHub Release (khi push tag)
- Người dùng có thể mở trực tiếp

**Thời gian**: ~20-25 phút

---

## 3. Test Build

**File**: `.github/workflows/test-build.yml`

**Khi nào dùng**: Test nhanh khi tạo Pull Request

**Trigger tự động**:
- Khi tạo Pull Request
- Có thể chạy thủ công

**Chức năng**:
- Build frontend (Teacher + Student)
- Build mediasoup-server
- Compile Rust code
- Không tạo DMG (nhanh hơn)

**Thời gian**: ~10-12 phút

---

## So sánh Workflows

| Feature | Unsigned | Signed | Test Build |
|---------|----------|--------|------------|
| Cần Apple Dev account | ❌ | ✅ | ❌ |
| Tạo DMG | ✅ | ✅ | ❌ |
| Universal Binary | ✅ | ✅ | ❌ |
| Code Signing | ❌ | ✅ | ❌ |
| Tự động Release | ❌ | ✅ | ❌ |
| Chạy thủ công | ✅ | ✅ | ✅ |
| Chạy tự động | ❌ | ✅ | ✅ (PR) |
| Thời gian | ~15-20min | ~20-25min | ~10-12min |

---

## Hướng dẫn sử dụng

### Build lần đầu (Không có Apple Dev account)

1. Fork repository
2. Vào tab **Actions** → Enable workflows
3. Chọn **Build macOS Apps (Unsigned)**
4. Click **Run workflow** → Chọn `both`
5. Đợi build xong (~20 phút)
6. Download artifacts từ workflow run

### Setup Code Signing (Có Apple Dev account)

1. Tạo các secrets trong GitHub (xem BUILD_INSTRUCTIONS.md):
   - `APPLE_CERTIFICATE`
   - `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_SIGNING_IDENTITY`
   - `APPLE_ID`
   - `APPLE_PASSWORD`
   - `APPLE_TEAM_ID`

2. Tạo tag để trigger build:
```bash
git tag v1.0.0
git push origin v1.0.0
```

3. Workflow sẽ tự động:
   - Build Teacher + Student apps
   - Sign với Apple certificate
   - Tạo GitHub Release (draft)
   - Upload DMG files

4. Vào **Releases** → Edit draft → Publish

### CI/CD cho Development

Để tự động test mỗi khi push code:

1. Workflow **Test Build** sẽ tự động chạy khi tạo PR
2. Kiểm tra kết quả trong tab **Actions**
3. Fix lỗi nếu có
4. Merge PR khi test pass

---

## Artifacts

Sau khi workflow chạy xong, download artifacts:

### Unsigned Build
- `ScreenSharing-Teacher-macOS-Universal` - Teacher DMG
- `ScreenSharing-Student-macOS-Universal` - Student DMG
- `build-info` - Thông tin build

### Signed Build
- `screensharing-teacher-macos` - Teacher DMG (signed)
- `screensharing-student-macos` - Student DMG (signed)

### Test Build
- Không có artifacts (chỉ test compile)

---

## Troubleshooting

### Workflow failed: "Port 1421 is already in use"

- Không ảnh hưởng, workflow sẽ retry
- Hoặc cancel và run lại

### Workflow failed: "Rust compilation error"

- Kiểm tra code Rust trong `src-tauri/`
- Chạy `cargo build` local để debug

### Workflow failed: "Frontend build error"

- Kiểm tra TypeScript errors
- Chạy `npm run build` local để debug

### Signing failed (Signed workflow)

- Kiểm tra GitHub Secrets đã đúng chưa
- Verify certificate chưa hết hạn
- Kiểm tra Apple ID password (app-specific)

---

## Tips

### Build nhanh hơn

1. Sử dụng **Test Build** để test code nhanh
2. Chỉ build DMG khi cần release
3. Build từng app riêng (teacher/student) thay vì both

### Cache

Workflows đã enable Rust cache để build nhanh hơn:
- Lần đầu: ~20 phút
- Lần sau: ~10-15 phút (nếu không đổi Rust code)

### Parallel builds

Workflows build Teacher và Student song song để tiết kiệm thời gian.

---

## Liên hệ

Nếu cần hỗ trợ về workflows, tạo issue với label `ci/cd`.
