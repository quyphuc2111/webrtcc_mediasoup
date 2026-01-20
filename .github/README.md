# GitHub Configuration

Thư mục này chứa cấu hình cho GitHub Actions và tài liệu build.

## 📁 Cấu trúc

```
.github/
├── workflows/
│   ├── build-macos.yml          # Build với code signing
│   ├── build-macos-unsigned.yml # Build không cần signing ⭐
│   └── test-build.yml           # Test nhanh cho PR
├── BUILD_INSTRUCTIONS.md        # Hướng dẫn build chi tiết
├── WORKFLOWS.md                 # So sánh các workflows
└── README.md                    # File này
```

## 🚀 Quick Start

### Để build app ngay (Không cần Apple Developer account):

1. Vào tab [Actions](../../actions)
2. Chọn **Build macOS Apps (Unsigned)**
3. Click **Run workflow** → Chọn `both`
4. Đợi ~20 phút
5. Download artifacts

### Để setup CI/CD tự động:

1. Đọc [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)
2. Cấu hình GitHub Secrets (nếu có Apple Dev account)
3. Push code hoặc tạo tag để trigger build

## 📚 Tài liệu

- **[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)** - Hướng dẫn build chi tiết, setup secrets
- **[WORKFLOWS.md](WORKFLOWS.md)** - So sánh và hướng dẫn sử dụng workflows
- **[../INSTALLATION.md](../INSTALLATION.md)** - Hướng dẫn cài đặt cho người dùng cuối

## 🎯 Workflows có sẵn

| Workflow | Mục đích | Chạy khi | Output |
|----------|----------|----------|--------|
| **Build macOS Apps (Unsigned)** ⭐ | Build production không cần signing | Thủ công | DMG files |
| **Build macOS Apps** | Build production với signing | Push/Tag | DMG + Release |
| **Test Build** | Test compile nhanh | Pull Request | Không có |

## 💡 Khuyến nghị

- **Lần đầu**: Dùng **Build macOS Apps (Unsigned)**
- **Development**: Dùng **Test Build** để test nhanh
- **Production**: Setup signing và dùng **Build macOS Apps**

## 🔧 Cấu hình

### Không cần cấu hình gì

Workflows **Unsigned** và **Test Build** chạy ngay không cần setup.

### Cần cấu hình (Optional)

Để enable **Build macOS Apps** với code signing:

```
GitHub Settings → Secrets → Actions → New secret
```

Thêm các secrets:
- `APPLE_CERTIFICATE` - Base64 của .p12 file
- `APPLE_CERTIFICATE_PASSWORD` - Password của certificate
- `APPLE_SIGNING_IDENTITY` - Identity string
- `APPLE_ID` - Apple ID email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID

Chi tiết xem [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)

## 🆘 Troubleshooting

Xem chi tiết trong [WORKFLOWS.md](WORKFLOWS.md#troubleshooting)

## 📝 Notes

- Workflows build **Universal Binary** (Intel + Apple Silicon)
- Cache được enable để build nhanh hơn
- Teacher và Student build song song
- Artifacts tự động upload sau mỗi build
