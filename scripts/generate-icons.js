import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
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

// Smoothstep utility for clean anti-aliasing
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function generatePng(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // 8 bits per channel
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: Deep dark slate (#09090b)
      let r = 9, g = 9, b = 11, a = 255;

      // Outer ring / badge boundary with smooth antialiasing
      if (dist < maxRadius + 1.5) {
        const edgeAlpha = 1 - smoothstep(maxRadius - 1, maxRadius + 1.2, dist);

        // Gradient theme mixing Emerald (#10b981) & Amber (#f59e0b)
        const angle = Math.atan2(dy, dx);
        const t = (x + y) / (width + height);
        
        let bgR = Math.round(16 * (1 - t) + 245 * t);
        let bgG = Math.round(185 * (1 - t) + 158 * t);
        let bgB = Math.round(129 * (1 - t) + 11 * t);

        r = bgR; g = bgG; b = bgB;
        a = Math.round(255 * edgeAlpha);

        // Inner core container card (#0f172a - Slate 900)
        const innerRadius = maxRadius * 0.78;
        if (dist < innerRadius + 1.5) {
          const innerAlpha = 1 - smoothstep(innerRadius - 1, innerRadius + 1.2, dist);
          
          let coreR = 15;
          let coreG = 23;
          let coreB = 42;

          // Central Food/Quest Pin / Flame graphic element
          const pinDy = dy + maxRadius * 0.05;
          const pinDist = Math.sqrt(dx * dx + pinDy * pinDy);
          const pinRadius = innerRadius * 0.42;

          if (pinDist < pinRadius) {
            const pinAlpha = 1 - smoothstep(pinRadius - 1.5, pinRadius, pinDist);
            // Glowing vibrant gradient for the pin center
            const pt = pinDist / pinRadius;
            const pR = Math.round(250 * (1 - pt) + 16 * pt);
            const pG = Math.round(204 * (1 - pt) + 185 * pt);
            const pB = Math.round(21 * (1 - pt) + 129 * pt);

            coreR = Math.round(coreR * (1 - pinAlpha) + pR * pinAlpha);
            coreG = Math.round(coreG * (1 - pinAlpha) + pG * pinAlpha);
            coreB = Math.round(coreB * (1 - pinAlpha) + pB * pinAlpha);
          }

          r = Math.round(r * (1 - innerAlpha) + coreR * innerAlpha);
          g = Math.round(g * (1 - innerAlpha) + coreG * innerAlpha);
          b = Math.round(b * (1 - innerAlpha) + coreB * innerAlpha);
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

console.log('Successfully generated modern anti-aliased PWA PNG icons in /public!');