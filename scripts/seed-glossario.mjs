// One-shot: genera le voci iniziali del glossario in src/content/glossario/<slug>.md.
// I .md sono poi la fonte di verità (a mano o via CMS). Eseguire una volta, poi rimuovere.
import { mkdirSync, writeFileSync } from 'node:fs';

const DIR = 'src/content/glossario';
mkdirSync(DIR, { recursive: true });

const terms = [
  // TAO
  { slug: 'tao', termine: 'Tao', tradizione: 'tao', ordine: 10,
    definizione: 'La «Via»: il principio originario, indicibile e in continuo fluire, da cui ogni cosa nasce e a cui ogni cosa ritorna.',
    vediAnche: ['wu-wei', 'yin-yang', 'qi'] },
  { slug: 'qi', termine: 'Qi', tradizione: 'tao', ordine: 20, sinonimi: ['Chi', 'Ki'],
    definizione: 'L’energia vitale che anima e attraversa ogni cosa. Nella Medicina Cinese scorre nel corpo lungo i meridiani.',
    vediAnche: ['meridiani', 'yin-yang', 'prana'] },
  { slug: 'yin-yang', termine: 'Yin e Yang', tradizione: 'tao', ordine: 30,
    definizione: 'I due principi complementari e interdipendenti — ombra e luce, quiete e movimento — la cui alternanza genera ogni mutamento.',
    vediAnche: ['tao', 'cinque-movimenti'] },
  { slug: 'wu-wei', termine: 'Wu wei', tradizione: 'tao', ordine: 40,
    definizione: 'Il «non-agire»: agire senza forzare, assecondando la natura delle cose invece di imporsi ad essa.',
    vediAnche: ['tao'] },
  { slug: 'cinque-movimenti', termine: 'Cinque movimenti', tradizione: 'tao', ordine: 50, sinonimi: ['Cinque elementi', 'Wu Xing'],
    definizione: 'Legno, Fuoco, Terra, Metallo e Acqua: le cinque qualità dinamiche con cui la Medicina Cinese legge i cicli di trasformazione, nel corpo e in natura.',
    vediAnche: ['qi', 'meridiani', 'yin-yang'] },
  { slug: 'meridiani', termine: 'Meridiani', tradizione: 'tao', ordine: 60,
    definizione: 'I canali in cui circola il qi nel corpo. Sono la mappa su cui lavorano agopuntura, shiatsu e tuina.',
    vediAnche: ['qi', 'shiatsu', 'cinque-movimenti'] },

  // VEDA
  { slug: 'ayurveda', termine: 'Ayurveda', tradizione: 'veda', ordine: 70,
    definizione: 'La «scienza della vita»: il sistema medico e filosofico dell’India antica, fondato sull’equilibrio dei dosha e sulla cura della persona nel suo insieme.',
    vediAnche: ['dosha', 'prana'] },
  { slug: 'dosha', termine: 'Dosha', tradizione: 'veda', ordine: 80,
    definizione: 'Le tre energie costituzionali dell’Ayurveda — vata, pitta, kapha — che descrivono corpo, mente e temperamento di ciascuno.',
    vediAnche: ['vata', 'pitta', 'kapha', 'ayurveda'] },
  { slug: 'vata', termine: 'Vata', tradizione: 'veda', ordine: 90,
    definizione: 'Il dosha di aria ed etere: movimento, leggerezza, creatività. In eccesso porta dispersione e bisogno di radicamento.',
    vediAnche: ['dosha'] },
  { slug: 'pitta', termine: 'Pitta', tradizione: 'veda', ordine: 100,
    definizione: 'Il dosha di fuoco e acqua: trasformazione, intensità, focalizzazione. In eccesso porta calore e bisogno di morbidezza.',
    vediAnche: ['dosha'] },
  { slug: 'kapha', termine: 'Kapha', tradizione: 'veda', ordine: 110,
    definizione: 'Il dosha di terra e acqua: stabilità, struttura, calma. In eccesso porta stagnazione e bisogno di stimolo.',
    vediAnche: ['dosha'] },
  { slug: 'prana', termine: 'Prana', tradizione: 'veda', ordine: 120,
    definizione: 'Il respiro-energia vitale della tradizione indiana: l’equivalente del qi cinese, che scorre nei canali sottili (nadi).',
    vediAnche: ['qi', 'nadi'] },

  // KUNDALINI
  { slug: 'kundalini', termine: 'Kundalini', tradizione: 'kundalini', ordine: 130,
    definizione: 'L’energia potenziale raffigurata come un serpente avvolto alla base della colonna, che può risalire risvegliando i centri energetici.',
    vediAnche: ['chakra', 'nadi', 'via-del-drago'] },
  { slug: 'chakra', termine: 'Chakra', tradizione: 'kundalini', ordine: 140,
    definizione: 'I centri energetici allineati lungo la colonna: snodi in cui si incontrano corpo, emozione e coscienza.',
    vediAnche: ['kundalini', 'nadi'] },
  { slug: 'nadi', termine: 'Nadi', tradizione: 'kundalini', ordine: 150,
    definizione: 'I canali sottili in cui scorre il prana. I tre principali sono ida, pingala e sushumna, il canale centrale.',
    vediAnche: ['prana', 'chakra'] },
  { slug: 'via-del-drago', termine: 'Via del Drago', tradizione: 'kundalini', ordine: 160,
    definizione: 'Immagine occidentale ed esoterica dell’energia che sale lungo la colonna: un parallelo simbolico della kundalini orientale.',
    vediAnche: ['kundalini'] },
  { slug: 'tantra', termine: 'Tantra', tradizione: 'kundalini', ordine: 170,
    definizione: 'Corrente spirituale che considera corpo, energia e desiderio come vie di consapevolezza, non come ostacoli da reprimere.',
    vediAnche: ['kundalini'] },

  // OCCIDENTE
  { slug: 'archetipo', termine: 'Archetipo', tradizione: 'occidente', ordine: 180,
    definizione: 'Immagine o schema universale dell’inconscio collettivo (Jung) che si esprime in miti, sogni, simboli e tarocchi.',
    vediAnche: ['individuazione', 'arcani-maggiori'] },
  { slug: 'individuazione', termine: 'Individuazione', tradizione: 'occidente', ordine: 190,
    definizione: 'In Jung, il processo di diventare pienamente se stessi integrando le parti inconsce della psiche.',
    vediAnche: ['archetipo'] },
  { slug: 'sincronicita', termine: 'Sincronicità', tradizione: 'occidente', ordine: 200,
    definizione: 'Concetto junghiano di coincidenza significativa fra eventi interni ed esterni, non legata da causa: ponte fra psiche e mondo.',
    vediAnche: ['archetipo'] },

  // TAROCCHI
  { slug: 'arcani-maggiori', termine: 'Arcani Maggiori', tradizione: 'tarocchi', ordine: 210,
    definizione: 'Le 22 carte simboliche del Tarot che raffigurano le tappe di un cammino interiore, dal Matto al Mondo.',
    vediAnche: ['archetipo'] },

  // PRATICA
  { slug: 'shiatsu', termine: 'Shiatsu', tradizione: 'pratica', ordine: 220,
    definizione: 'Tecnica manuale giapponese che lavora con pressioni lungo i meridiani: un dialogo energetico con il corpo, non una manipolazione meccanica.',
    vediAnche: ['meridiani', 'qi'] },
  { slug: 'orbita-microcosmica', termine: 'Orbita microcosmica', tradizione: 'pratica', ordine: 230,
    definizione: 'Nell’alchimia taoista, la circolazione consapevole del qi lungo i canali centrale anteriore e posteriore del corpo.',
    vediAnche: ['qi'] },
  { slug: 'meditazione', termine: 'Meditazione', tradizione: 'pratica', ordine: 240,
    definizione: 'Pratica di presenza e di quiete della mente. Nel trattamento Tao Veda prepara l’ascolto e l’apertura.',
    vediAnche: [] },
];

const yamlVal = (v) => JSON.stringify(v);
const yamlArr = (a) => `[${a.map((s) => JSON.stringify(s)).join(', ')}]`;

for (const t of terms) {
  const lines = [
    `termine: ${yamlVal(t.termine)}`,
    `tradizione: ${yamlVal(t.tradizione)}`,
    `definizione: ${yamlVal(t.definizione)}`,
    `ordine: ${t.ordine}`,
  ];
  if (t.sinonimi && t.sinonimi.length) lines.push(`sinonimi: ${yamlArr(t.sinonimi)}`);
  if (t.vediAnche && t.vediAnche.length) lines.push(`vediAnche: ${yamlArr(t.vediAnche)}`);
  const md = `---\n${lines.join('\n')}\n---\n`;
  writeFileSync(`${DIR}/${t.slug}.md`, md);
  console.log(`✓ ${DIR}/${t.slug}.md  [${t.tradizione}] ${t.termine}`);
}
console.log(`\nTotale: ${terms.length} voci.`);
