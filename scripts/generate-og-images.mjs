import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "assets", "og");

const cards = [
  {
    file: "diario-cinque-movimenti.png",
    title: "I cinque movimenti",
    subtitle: "Leggere il corpo come si legge la natura",
    source: "piede-caviglia-1600.jpg",
    position: "centre",
  },
  {
    file: "diario-dosha.png",
    title: "Vata, Pitta, Kapha",
    subtitle: "Le tre costituzioni dell’Ayurveda",
    source: "preparazione-olio-1600.jpg",
    position: "centre",
  },
  {
    file: "diario-presenza.png",
    title: "Presenza prima della tecnica",
    subtitle: "Il fondamento della pratica Tao Veda",
    source: "mani-dorso-1600.jpg",
    position: "centre",
  },
  {
    file: "diario-drago-kundalini.png",
    title: "La via del Drago e la Kundalini",
    subtitle: "Un parallelo fra Oriente e Occidente",
    source: "percorso-dario-1600.jpg",
    position: "centre",
  },
  {
    file: "diario-yoni-lingam.png",
    title: "Yoni massage e lingam massage",
    subtitle: "Significato, equivoci e confini",
    source: "mani-dorso-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-tao.png",
    title: "Tao e Medicina Cinese",
    subtitle: "Tradizioni · Tao Veda",
    source: "piede-caviglia-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-veda.png",
    title: "Ayurveda e Yoga",
    subtitle: "Tradizioni · Tao Veda",
    source: "preparazione-olio-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-kundalini.png",
    title: "Kundalini, chakra e via del Drago",
    subtitle: "Tradizioni · Tao Veda",
    source: "percorso-dario-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-occidente.png",
    title: "Occidente e Oriente in dialogo",
    subtitle: "Tradizioni · Tao Veda",
    source: "home-pratica-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-tarocchi.png",
    title: "Tarocchi, archetipi e simbolo",
    subtitle: "Tradizioni · Tao Veda",
    source: "home-pratica-1600.jpg",
    position: "centre",
  },
  {
    file: "tradizione-pratica.png",
    title: "Pratica del corpo e meditazione",
    subtitle: "Tradizioni · Tao Veda",
    source: "mani-dorso-1600.jpg",
    position: "centre",
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapTitle(title, maxLength = 31) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function overlay(card) {
  const lines = wrapTitle(card.title);
  const title = lines
    .map(
      (line, index) =>
        `<text x="82" y="${330 + index * 74}" class="title">${escapeXml(line)}</text>`,
    )
    .join("");
  const subtitleY = 362 + lines.length * 74;

  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#10100e" stop-opacity="0.94"/>
          <stop offset="0.62" stop-color="#10100e" stop-opacity="0.66"/>
          <stop offset="1" stop-color="#10100e" stop-opacity="0.28"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <rect x="82" y="82" width="64" height="3" fill="#c5a55a"/>
      <text x="82" y="137" class="brand">TAO VEDA</text>
      ${title}
      <text x="82" y="${subtitleY}" class="subtitle">${escapeXml(card.subtitle)}</text>
      <text x="82" y="574" class="url">www.tao-veda.org</text>
      <style>
        .brand { fill: #c5a55a; font: 600 24px Arial, sans-serif; letter-spacing: 7px; }
        .title { fill: #f7f2e8; font: 600 58px Georgia, serif; }
        .subtitle { fill: #e5ddcd; font: 400 25px Arial, sans-serif; letter-spacing: 1px; }
        .url { fill: #c8c0b2; font: 400 18px Arial, sans-serif; letter-spacing: 2px; }
      </style>
    </svg>
  `);
}

await mkdir(outputDir, { recursive: true });

for (const card of cards) {
  const source = path.join(root, "public", "assets", "photos", "tao-veda", card.source);
  const output = path.join(outputDir, card.file);
  await sharp(source)
    .rotate()
    .resize(1200, 630, { fit: "cover", position: card.position })
    .composite([{ input: overlay(card) }])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(output);
}

console.log(`Generate ${cards.length} immagini Open Graph in ${outputDir}`);
