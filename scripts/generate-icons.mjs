const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePNG(width, height, outputPath) {
  const chunks = [];

  chunks.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0d]),
    Buffer.from('IHDR'),
    ihdr,
  ]);
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdr]));
  ihdrChunk.writeUInt32BE(ihdrCrc, ihdrChunk.length - 4);
  chunks.push(ihdrChunk);

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 3 + 1);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      row[x * 3 + 1] = 79;
      row[x * 3 + 2] = 70;
      row[x * 3 + 3] = 229;
    }
    scanlines.push(row);
  }

  const imageData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(imageData);

  const idatLenBuf = Buffer.alloc(4);
  idatLenBuf.writeUInt32BE(compressed.length, 0);

  const idatData = Buffer.concat([Buffer.from('IDAT'), compressed]);
  const idatCrc = crc32(idatData);

  const idatChunk = Buffer.concat([idatLenBuf, idatData, Buffer.alloc(4)]);
  idatChunk.writeUInt32BE(idatCrc, idatChunk.length - 4);
  chunks.push(idatChunk);

  const iendChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from('IEND'),
    Buffer.from([0xae, 0x42, 0x60, 0x82]),
  ]);

  chunks.push(iendChunk);

  const png = Buffer.concat(chunks);
  fs.writeFileSync(outputPath, png);
  console.log(`Generated ${path.basename(outputPath)}`);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

makePNG(192, 192, path.join(publicDir, 'icon-192.png'));
makePNG(512, 512, path.join(publicDir, 'icon-512.png'));
makePNG(512, 512, path.join(publicDir, 'maskable-512.png'));
makePNG(180, 180, path.join(publicDir, 'apple-touch-icon.png'));

console.log('All PNG icons generated successfully');
