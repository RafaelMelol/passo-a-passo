// Gera os ícones PNG (celular / tela inicial) a partir de app/icon.svg.
// Uso: npm run icons
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const svg = await readFile(new URL("../app/icon.svg", import.meta.url), "utf8");

// Versão "sangrada" (fundo até a borda): o celular aplica a própria máscara arredondada.
const fullBleed = svg.replace('rx="112"', 'rx="0"');

await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });

const outputs = [
  { source: svg, size: 192, file: "../public/icons/icon-192.png" },
  { source: svg, size: 512, file: "../public/icons/icon-512.png" },
  { source: fullBleed, size: 512, file: "../public/icons/maskable-512.png" },
  { source: fullBleed, size: 180, file: "../app/apple-icon.png" },
];

for (const { source, size, file } of outputs) {
  await sharp(Buffer.from(source), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(file, import.meta.url)));
  console.log(`ok  ${file.replace("../", "")} (${size}x${size})`);
}
