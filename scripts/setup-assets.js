import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const mapping = {
  '1.': 'prod-001',
  '2.': 'prod-002',
  '3.': 'prod-003',
  '4.': 'prod-004',
  '5.': 'prod-005',
  '6.': 'prod-006',
  '7.': 'prod-007',
  '8.': 'prod-008',
  '9.': 'prod-009',
  '10.': 'prod-010',
  '11.': 'prod-011',
  '12.': 'prod-012',
  '13.': 'prod-013',
  '14.': 'prod-014',
};

const sourceDir = path.join(rootDir, 'Assetes', 'HHD Collections');
const targetProductsDir = path.join(rootDir, 'public', 'products');
const targetAssetsDir = path.join(rootDir, 'public', 'assets');

if (!fs.existsSync(targetProductsDir)) {
  fs.mkdirSync(targetProductsDir, { recursive: true });
}
if (!fs.existsSync(targetAssetsDir)) {
  fs.mkdirSync(targetAssetsDir, { recursive: true });
}

// Copy Logo
const logoSrc = path.join(rootDir, 'Assetes', 'HHD Collections Logo.png');
const logoDest = path.join(targetAssetsDir, 'logo.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, logoDest);
  console.log('Copied logo to public/assets/logo.png');
}

// Copy Products
if (fs.existsSync(sourceDir)) {
  const dirs = fs.readdirSync(sourceDir);
  for (const dir of dirs) {
    const fullDirPath = path.join(sourceDir, dir);
    if (!fs.statSync(fullDirPath).isDirectory()) continue;

    let targetId = null;
    for (const prefix of Object.keys(mapping)) {
      if (dir.startsWith(prefix)) {
        targetId = mapping[prefix];
        break;
      }
    }

    if (targetId) {
      const prodDir = path.join(targetProductsDir, targetId);
      if (!fs.existsSync(prodDir)) {
        fs.mkdirSync(prodDir, { recursive: true });
      }

      const files = fs.readdirSync(fullDirPath).sort();
      let imgIdx = 1;
      for (const file of files) {
        const ext = path.extname(file);
        const srcFile = path.join(fullDirPath, file);
        if (fs.statSync(srcFile).isFile()) {
          const destFile = path.join(prodDir, `image-${imgIdx}${ext}`);
          fs.copyFileSync(srcFile, destFile);
          imgIdx++;
        }
      }
      console.log(`Organized ${targetId}: ${imgIdx - 1} images copied.`);
    }
  }
}

console.log('All product assets successfully organized.');
