import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function generateLogos() {
  const svgPath = path.join(rootDir, 'logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Root logo.png
  await sharp(svgBuffer).resize(128, 128).png().toFile(path.join(rootDir, 'logo.png'));

  // Extension logo.png
  const extLogoPath = path.join(rootDir, 'packages', 'slack-mcp-vscode-extension', 'logo.png');
  await sharp(svgBuffer).resize(128, 128).png().toFile(extLogoPath);

  console.log('✅ Logo PNGs generated');
}

generateLogos().catch(console.error);
