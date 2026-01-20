# Hướng dẫn Cài đặt

## Download

### Từ GitHub Releases

1. Vào trang [Releases](../../releases)
2. Download file DMG phù hợp:
   - **Teacher**: `Screen-Sharing-Teacher_*_universal.dmg` (Dành cho giáo viên)
   - **Student**: `Screen-Sharing-Student_*_universal.dmg` (Dành cho học sinh)

### Từ GitHub Actions (Development builds)

1. Vào tab [Actions](../../actions)
2. Click vào workflow run mới nhất
3. Scroll xuống phần **Artifacts**
4. Download:
   - `ScreenSharing-Teacher-macOS-Universal` - Teacher app
   - `ScreenSharing-Student-macOS-Universal` - Student app

## Cài đặt trên macOS

### Bước 1: Mở file DMG

1. Double-click file DMG đã download
2. Một cửa sổ mới sẽ mở ra

### Bước 2: Kéo app vào Applications

1. Kéo app vào thư mục **Applications**
2. Đợi quá trình copy hoàn tất

### Bước 3: Mở app lần đầu tiên

#### Cách 1: Sử dụng Right-click (Khuyến nghị)

1. Mở **Finder** → **Applications**
2. Tìm app **Screen Sharing Teacher** hoặc **Screen Sharing Student**
3. **Right-click** (hoặc Control + Click) vào app
4. Chọn **Open**
5. Click **Open** trong dialog xác nhận

#### Cách 2: Sử dụng Terminal

```bash
# Cho Teacher app
xattr -cr "/Applications/Screen Sharing Teacher.app"

# Cho Student app
xattr -cr "/Applications/Screen Sharing Student.app"
```

Sau đó double-click app để mở bình thường.

### Bước 4: Cấp quyền (Nếu cần)

Khi mở app lần đầu, macOS có thể yêu cầu cấp quyền:

- **Screen Recording** (Teacher app): Cho phép chia sẻ màn hình
- **Microphone** (Teacher app): Cho phép chia sẻ giọng nói
- **Network** (Cả 2 app): Cho phép kết nối mạng

Click **OK** hoặc **Allow** để cấp quyền.

## Gỡ cài đặt

1. Mở **Finder** → **Applications**
2. Kéo app vào **Trash**
3. Empty Trash

## Troubleshooting

### "App is damaged and can't be opened"

Chạy lệnh sau trong Terminal:

```bash
xattr -cr "/Applications/Screen Sharing Teacher.app"
# hoặc
xattr -cr "/Applications/Screen Sharing Student.app"
```

### "App can't be opened because it is from an unidentified developer"

1. Mở **System Settings** → **Privacy & Security**
2. Scroll xuống phần **Security**
3. Click **Open Anyway** bên cạnh thông báo về app
4. Nhập password và click **Open**

### App không kết nối được

1. Kiểm tra firewall:
   - **System Settings** → **Network** → **Firewall**
   - Cho phép app kết nối mạng

2. Kiểm tra network:
   - Đảm bảo teacher và student cùng mạng (hoặc có thể kết nối với nhau)
   - Kiểm tra Server URL đúng định dạng: `ws://IP:PORT`

### App bị crash khi chia sẻ màn hình

1. Cấp quyền Screen Recording:
   - **System Settings** → **Privacy & Security** → **Screen Recording**
   - Bật cho app **Screen Sharing Teacher**

2. Restart app sau khi cấp quyền

## Yêu cầu hệ thống

### Teacher App
- **macOS**: 10.15 (Catalina) trở lên
- **CPU**: Intel hoặc Apple Silicon (M1/M2/M3)
- **RAM**: 4GB trở lên
- **Network**: 10Mbps upload trở lên

### Student App
- **macOS**: 10.15 (Catalina) trở lên
- **CPU**: Intel hoặc Apple Silicon (M1/M2/M3)
- **RAM**: 2GB trở lên
- **Network**: 2Mbps download trở lên

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Issues](../../issues) trên GitHub
2. Tạo issue mới với thông tin chi tiết về lỗi
