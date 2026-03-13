// PNG 아이콘 생성 스크립트 (외부 의존성 없음)
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// CRC32 계산
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (~crc) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// 단색 배경 + 중앙 흰색 원 아이콘 PNG 생성
function createIcon(size) {
  const r = 22, g = 163, b = 74; // forest green #16a34a
  const cx = size / 2, cy = size / 2, radius = size * 0.28;
  const leafR = 5, g2 = 200, b2 = 200; // 흰색 원

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // 픽셀 데이터 (filter byte 0 + RGB per row)
  const stride = 1 + size * 3;
  const raw = Buffer.allocUnsafe(size * stride);

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const offset = y * stride + 1 + x * 3;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // 흰색 원 (나뭇잎 느낌)
        raw[offset] = 255;
        raw[offset + 1] = 255;
        raw[offset + 2] = 255;
      } else {
        // green 배경
        raw[offset] = r;
        raw[offset + 1] = g;
        raw[offset + 2] = b;
      }
    }
  }

  const compressed = deflateSync(raw);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });

writeFileSync("public/icons/icon-192.png", createIcon(192));
writeFileSync("public/icons/icon-512.png", createIcon(512));
writeFileSync("public/icons/apple-touch-icon.png", createIcon(180));

console.log("✅ Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png");
