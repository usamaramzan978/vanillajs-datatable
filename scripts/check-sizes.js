import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// For ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Correct import for gzip-size v7+ (it exports gzipSize as named)
import * as gzipModule from "gzip-size";
import { default as brotliSize } from "brotli-size";

// Use named function
const gzipSize = gzipModule.gzipSize;

const files = ["dist/index.esm.js", "dist/index.cjs.js", "dist/index.min.js"];

for (const file of files) {
  const filePath = join(__dirname, "..", file);
  const content = await fs.readFile(filePath);

  const gzip = await gzipSize(content);
  const brotli = brotliSize.sync(content); // brotli-size still has sync

  console.log(`📦 ${file}`);
  console.log(`  Gzip:    ${(gzip / 1024).toFixed(2)} kB`);
  console.log(`  Brotli:  ${(brotli / 1024).toFixed(2)} kB\n`);
}
