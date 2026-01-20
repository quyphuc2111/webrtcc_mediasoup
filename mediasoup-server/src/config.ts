import os from 'os';
import type { WorkerSettings, RouterOptions, WebRtcTransportOptions } from 'mediasoup/node/lib/types.js';

// Tối ưu cho máy cấu hình thấp
const numWorkers = Math.min(os.cpus().length, 2); // Max 2 workers

export const config = {
  // Server settings
  listenPort: 3016,
  
  // Mediasoup Worker settings - tối ưu cho máy yếu
  worker: {
    rtcMinPort: 40000,
    rtcMaxPort: 40100, // Giới hạn port range
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
  } as WorkerSettings,
  
  numWorkers,
  
  // Router settings với codecs tối ưu
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
        parameters: {
          'sprop-stereo': 1,
          'useinbandfec': 1, // Forward Error Correction
        },
      },
      {
        kind: 'video',
        mimeType: 'video/VP8', // VP8 nhẹ hơn VP9/H264
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 3000000, // Start bitrate cao hơn cho chất lượng tốt (3Mbps)
        },
      },
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f', // Baseline profile - nhẹ nhất
          'level-asymmetry-allowed': 1,
        },
      },
    ],
  } as RouterOptions,
  
  // WebRTC Transport settings - tối ưu cho nhiều clients
  webRtcTransport: {
    listenInfos: [
      { 
        protocol: 'udp' as const,
        ip: '0.0.0.0', 
        announcedAddress: undefined // Sẽ detect IP tự động
      },
      {
        protocol: 'tcp' as const,
        ip: '0.0.0.0',
        announcedAddress: undefined
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 5000000, // 5Mbps start - đủ cho 1080p chất lượng cao
  },
  
  maxIncomingBitrate: 8000000, // Max 8Mbps incoming - hỗ trợ 1080p@60fps
  
  // Tối ưu cho 30-50 clients
  maxClientsPerRoom: 50,
  
  // Video constraints cho teacher - 1080p
  videoConstraints: {
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
  },
};

// Detect local IP
export function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}
