/**
 * Genera icone PNG e splash screen per la PWA SanScore.
 * Usa: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_SVG = path.join(ROOT, 'public', 'icons', 'icon.svg');
const OUT_DIR = path.join(ROOT, 'public', 'icons');

mkdirSync(OUT_DIR, { recursive: true });

const svgBuffer = readFileSync(SRC_SVG);

// ─── Icone quadrate ────────────────────────────────────────────────────────────
const ICON_SIZES = [16, 32, 72, 96, 120, 128, 144, 152, 167, 180, 192, 256, 384, 512];

console.log('Generazione icone...');
for (const size of ICON_SIZES) {
  const outPath = path.join(OUT_DIR, `icon-${size}.png`);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`  ✓ icon-${size}.png`);
}

// ─── Splash screen ─────────────────────────────────────────────────────────────
// Sfondo scuro SanScore (#05051a) + icona centrata (20% della dimensione minore)
const SPLASHES = [
  { name: 'splash-750x1334',   w: 750,  h: 1334  },
  { name: 'splash-1242x2208',  w: 1242, h: 2208  },
  { name: 'splash-1125x2436',  w: 1125, h: 2436  },
  { name: 'splash-828x1792',   w: 828,  h: 1792  },
  { name: 'splash-1242x2688',  w: 1242, h: 2688  },
  { name: 'splash-1170x2532',  w: 1170, h: 2532  },
  { name: 'splash-1284x2778',  w: 1284, h: 2778  },
  { name: 'splash-1179x2556',  w: 1179, h: 2556  },
  { name: 'splash-1290x2796',  w: 1290, h: 2796  },
  { name: 'splash-1536x2048',  w: 1536, h: 2048  },
  { name: 'splash-1668x2388',  w: 1668, h: 2388  },
  { name: 'splash-2048x2732',  w: 2048, h: 2732  },
];

console.log('\nGenerazione splash screen...');
for (const { name, w, h } of SPLASHES) {
  const iconSize = Math.round(Math.min(w, h) * 0.25);
  const left = Math.round((w - iconSize) / 2);
  const top  = Math.round((h - iconSize) / 2);

  // Icona ridimensionata
  const iconBuf = await sharp(svgBuffer)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, `${name}.png`);
  await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 5, g: 5, b: 26, alpha: 1 }, // #05051a
    },
  })
    .composite([{ input: iconBuf, left, top }])
    .png()
    .toFile(outPath);

  console.log(`  ✓ ${name}.png`);
}

console.log('\nDone! Tutti i file sono in public/icons/');
