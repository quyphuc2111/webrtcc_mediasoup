# Mediasoup - Các Vấn Đề Được Xử Lý

## 🎯 Tổng Quan

Mediasoup là một **Selective Forwarding Unit (SFU)** - một server trung gian xử lý WebRTC streams. Trong hệ thống screen sharing này, mediasoup giải quyết nhiều vấn đề quan trọng.

---

## 📡 1. **SFU Architecture - Giảm Tải Băng Thông**

### Vấn đề:
- **P2P (Peer-to-Peer)**: Mỗi student phải nhận stream trực tiếp từ teacher
  - Teacher upload: `1.5Mbps × 50 students = 75Mbps` ❌ (Không khả thi!)
  - Mỗi student download: `1.5Mbps` ✅

### Giải pháp Mediasoup:
- **SFU (Selective Forwarding Unit)**: Teacher chỉ upload 1 lần đến server
  - Teacher upload: `1.5Mbps` ✅
  - Server forward đến 50 students: `1.5Mbps × 50 = 75Mbps` (server xử lý)
  - Mỗi student download: `1.5Mbps` ✅

**Code:**
```typescript
// Teacher tạo 1 producer
const producer = await transport.produce({ kind, rtpParameters });

// 50 students tạo 50 consumers từ cùng 1 producer
const consumer = await transport.consume({ producerId: producer.id });
```

---

## 🔄 2. **Codec Negotiation - Tương Thích Đa Nền Tảng**

### Vấn đề:
- Mỗi browser/device hỗ trợ codec khác nhau:
  - Chrome: VP8, VP9, H264
  - Safari: H264, VP8 (hạn chế)
  - Firefox: VP8, VP9
  - Mobile: H264 (phổ biến)

### Giải pháp Mediasoup:
- **Router RTP Capabilities**: Mediasoup router quản lý codec được hỗ trợ
- **Auto-negotiation**: Tự động chọn codec phù hợp nhất

**Code:**
```typescript
// config.ts - Định nghĩa codecs
router: {
  mediaCodecs: [
    { kind: 'video', mimeType: 'video/VP8' },  // Nhẹ, tương thích tốt
    { kind: 'video', mimeType: 'video/H264' },  // Phổ biến, hardware decode
    { kind: 'audio', mimeType: 'audio/opus' }, // Chất lượng tốt, băng thông thấp
  ],
}

// Tự động chọn codec phù hợp
if (!room.router.canConsume({ producerId, rtpCapabilities })) {
  return null; // Codec không tương thích
}
```

---

## 🌐 3. **NAT Traversal - Kết Nối Qua Firewall**

### Vấn đề:
- Hầu hết devices đều ở sau NAT/Firewall
- Không thể kết nối trực tiếp P2P
- Cần STUN/TURN servers

### Giải pháp Mediasoup:
- **ICE (Interactive Connectivity Establishment)**:
  - Tự động detect network topology
  - Tìm đường kết nối tốt nhất (UDP → TCP → TURN)
- **Transport Options**:
  ```typescript
  listenInfos: [
    { protocol: 'udp', ip: '0.0.0.0' },  // Ưu tiên UDP (nhanh)
    { protocol: 'tcp', ip: '0.0.0.0' },  // Fallback TCP
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  ```

---

## 🔐 4. **DTLS Encryption - Bảo Mật**

### Vấn đề:
- WebRTC streams cần được mã hóa
- Cần certificate và key exchange

### Giải pháp Mediasoup:
- **Tự động xử lý DTLS handshake**
- **Certificate generation**: Tự động tạo certificate cho mỗi transport
- **Secure RTP (SRTP)**: Mã hóa media streams

**Code:**
```typescript
// Tự động xử lý DTLS
await transport.connect({ dtlsParameters });
// Mediasoup tự động:
// - Generate certificate
// - Exchange keys
// - Encrypt SRTP streams
```

---

## 📊 5. **Bitrate Management - Tối Ưu Băng Thông**

### Vấn đề:
- 50 students với băng thông khác nhau
- Cần điều chỉnh bitrate động
- Tránh buffer overflow

### Giải pháp Mediasoup:
- **Max Incoming Bitrate**: Giới hạn bitrate cho mỗi consumer
- **Adaptive Bitrate**: Tự động điều chỉnh dựa trên network conditions
- **Simulcast**: Gửi nhiều layer quality (low/medium/high)

**Code:**
```typescript
// Giới hạn bitrate incoming
await transport.setMaxIncomingBitrate(1500000); // 1.5Mbps max

// Simulcast trong client
encodings: [
  { maxBitrate: 800000, scaleResolutionDownBy: 4 },   // Low ~480p
  { maxBitrate: 1500000, scaleResolutionDownBy: 2 },  // Medium ~720p
  { maxBitrate: 4000000 },                             // High 1080p
]
```

---

## 🎛️ 6. **Transport Management - Quản Lý Kết Nối**

### Vấn đề:
- Mỗi peer cần 2 transports:
  - **Send Transport**: Gửi media (teacher)
  - **Recv Transport**: Nhận media (students)
- Cần quản lý lifecycle (create, connect, close)

### Giải pháp Mediasoup:
- **Transport Pooling**: Tái sử dụng transports
- **Auto-cleanup**: Tự động đóng khi peer disconnect
- **Connection State Management**: Track trạng thái kết nối

**Code:**
```typescript
// Teacher: Tạo send transport
const sendTransport = await createWebRtcTransport(room);

// Student: Tạo recv transport
const recvTransport = await createWebRtcTransport(room);

// Auto cleanup khi disconnect
peer.transport?.close();
peer.recvTransport?.close();
```

---

## 🎬 7. **Producer/Consumer Pattern - Quản Lý Streams**

### Vấn đề:
- Teacher có thể có nhiều streams:
  - Screen video
  - System audio
  - Microphone
- Students cần consume từng stream riêng biệt

### Giải pháp Mediasoup:
- **Producer**: Teacher tạo producer cho mỗi track
- **Consumer**: Student tạo consumer cho mỗi producer
- **Independent Control**: Có thể pause/resume từng stream

**Code:**
```typescript
// Teacher: Produce screen + audio
const videoProducer = await transport.produce({ kind: 'video', ... });
const audioProducer = await transport.produce({ kind: 'audio', ... });

// Student: Consume từng producer
const videoConsumer = await transport.consume({ producerId: videoProducer.id });
const audioConsumer = await transport.consume({ producerId: audioProducer.id });

// Có thể pause/resume riêng
await videoConsumer.pause();
await videoConsumer.resume();
```

---

## ⚡ 8. **Performance Optimization - Tối Ưu Hiệu Suất**

### Vấn đề:
- 50 students = 50 consumers
- Cần xử lý song song, không block
- Tối ưu cho máy cấu hình thấp

### Giải pháp Mediasoup:
- **Worker Pool**: Phân tải qua nhiều workers
- **Codec Selection**: Chọn codec nhẹ (VP8 thay vì VP9)
- **Port Range Limitation**: Giới hạn port range để giảm overhead

**Code:**
```typescript
// Worker pool - load balancing
const numWorkers = Math.min(os.cpus().length, 2); // Max 2 workers
for (let i = 0; i < numWorkers; i++) {
  const worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 40100, // Giới hạn port range
  });
}

// Round-robin worker selection
private getNextWorker(): Worker {
  const worker = this.workers[this.nextWorkerIndex];
  this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
  return worker;
}
```

---

## 🔄 9. **Event Handling - Xử Lý Sự Kiện**

### Vấn đề:
- Cần biết khi nào:
  - Producer đóng (teacher dừng share)
  - Transport đóng (network issue)
  - Consumer ready (có thể play)

### Giải pháp Mediasoup:
- **Event Emitters**: Mediasoup emit events cho mọi thay đổi
- **Auto-cleanup**: Tự động cleanup khi producer/transport đóng

**Code:**
```typescript
// Listen to events
producer.on('transportclose', () => {
  console.log('Producer transport closed');
});

consumer.on('producerclose', () => {
  console.log('Producer closed - cleanup consumer');
});

consumer.on('transportclose', () => {
  console.log('Consumer transport closed');
});
```

---

## 🛡️ 10. **Error Handling & Recovery**

### Vấn đề:
- Network issues
- Codec không tương thích
- Transport failures

### Giải pháp Mediasoup:
- **Graceful Degradation**: Fallback codec nếu không tương thích
- **Transport Retry**: Có thể tạo transport mới nếu fail
- **Error Events**: Emit errors để client xử lý

**Code:**
```typescript
// Check compatibility trước khi consume
if (!room.router.canConsume({ producerId, rtpCapabilities })) {
  console.warn('Cannot consume - codec mismatch');
  return null; // Graceful failure
}

// Handle transport errors
transport.on('icestatechange', (state) => {
  if (state === 'failed') {
    // Retry logic
  }
});
```

---

## 📈 11. **Scalability - Khả Năng Mở Rộng**

### Vấn đề:
- 1 room có thể có 50 students
- Nhiều rooms đồng thời
- Cần scale theo CPU cores

### Giải pháp Mediasoup:
- **Room-based Routing**: Mỗi room có router riêng
- **Worker Distribution**: Phân rooms qua nhiều workers
- **Resource Isolation**: Rooms không ảnh hưởng lẫn nhau

**Code:**
```typescript
// Mỗi room có router riêng
async createRoom(roomId?: string): Promise<Room> {
  const worker = this.getNextWorker(); // Load balance
  const router = await worker.createRouter(config.router);
  return new Room(router, roomId);
}

// Rooms độc lập
const room1 = await manager.createRoom('class-1');
const room2 = await manager.createRoom('class-2');
```

---

## 🎯 Tóm Tắt

Mediasoup trong hệ thống này xử lý:

1. ✅ **SFU Architecture** - Giảm tải băng thông teacher
2. ✅ **Codec Negotiation** - Tương thích đa nền tảng
3. ✅ **NAT Traversal** - Kết nối qua firewall
4. ✅ **DTLS Encryption** - Bảo mật streams
5. ✅ **Bitrate Management** - Tối ưu băng thông
6. ✅ **Transport Management** - Quản lý kết nối
7. ✅ **Producer/Consumer** - Quản lý streams độc lập
8. ✅ **Performance** - Tối ưu cho máy yếu
9. ✅ **Event Handling** - Xử lý sự kiện real-time
10. ✅ **Error Recovery** - Xử lý lỗi gracefully
11. ✅ **Scalability** - Scale theo số rooms/students

**Kết quả**: Hệ thống có thể hỗ trợ **30-50 students** đồng thời với **1 teacher**, trên máy cấu hình thấp! 🚀
