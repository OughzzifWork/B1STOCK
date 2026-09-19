import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw pixel scanlines
  // Each line starts with 1 filter byte (0) + width * 4 bytes RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.40 : 0.46);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: deep slate (#0f172a / #1e293b)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Inner Red emblem or central circle
      if (dist < radius) {
        // Red badge
        const t = (y / height);
        r = Math.round(220 - t * 40); // 220 to 180
        g = Math.round(38 - t * 10);  // 38 to 28
        b = Math.round(38 - t * 10);  // 38 to 28

        // Central white box accent
        const boxSize = radius * 0.45;
        if (Math.abs(dx) < boxSize && Math.abs(dy) < boxSize) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const png192 = generatePNG(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512
const png512 = generatePNG(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate 512x512 Maskable (with safe zone margins)
const pngMaskable = generatePNG(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// Apple touch icon (180x180)
const appleIcon = generatePNG(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Favicon 32x32
const favicon = generatePNG(32, 32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated PWA PNG icons!');
