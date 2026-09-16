import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep dark slate (#09090b)
      let r = 9;
      let g = 9;
      let b = 11;
      let a = 255;

      // Outer badge circle
      if (dist < radius) {
        // Gradient between emerald green (#10b981) and amber (#f59e0b)
        const t = (x + y) / (width + height);
        r = Math.round(16 * (1 - t) + 245 * t);
        g = Math.round(185 * (1 - t) + 158 * t);
        b = Math.round(129 * (1 - t) + 11 * t);

        // Inner dark badge core
        const innerRadius = radius * 0.72;
        if (dist < innerRadius) {
          r = 15;
          g = 23;
          b = 42;

          // Center flame / skewer glow
          const flameDist = Math.sqrt(dx * dx + (dy - radius * 0.08) * (dy - radius * 0.08));
          if (flameDist < innerRadius * 0.5) {
            const ft = flameDist / (innerRadius * 0.5);
            r = Math.round(254 * (1 - ft) + 249 * ft);
            g = Math.round(240 * (1 - ft) + 115 * ft);
            b = Math.round(138 * (1 - ft) + 22 * ft);
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, makeChunk('IHDR', ihdr), idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));

console.log('Successfully generated PWA PNG icons in /public!');
