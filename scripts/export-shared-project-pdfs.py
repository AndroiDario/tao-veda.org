"""Export the proposal (2 pages) and canonical charter (1 page) from Markdown.

Run with the bundled Python runtime (reportlab + pypdf), from the repository.
PDFs are for personal sharing, not copied to the website's public directory.
"""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path('/System/Library/Fonts/Supplemental')
for name, filename in [('Body', 'Arial.ttf'), ('BodyBold', 'Arial Bold.ttf'),
                       ('Display', 'Georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold')

INK = colors.HexColor('#1d2726')
MUTED = colors.HexColor('#5c625d')
ACCENT = colors.HexColor('#746342')

def styles(compact=False):
    return {
        'title': ParagraphStyle('title', fontName='Display', fontSize=23,
                                leading=28, textColor=INK, spaceAfter=12),
        'subtitle': ParagraphStyle('subtitle', fontName='Body', fontSize=9,
                                   leading=12, textColor=MUTED, spaceAfter=14),
        'heading': ParagraphStyle('heading', fontName='BodyBold', fontSize=11,
                                  leading=14, textColor=INK, spaceBefore=8,
                                  spaceAfter=5, keepWithNext=True),
        'body': ParagraphStyle('body', fontName='Body', fontSize=10.2 if compact else 10.4,
                               leading=13.4 if compact else 13.6, textColor=INK,
                               spaceAfter=5, alignment=TA_LEFT),
        'bullet': ParagraphStyle('bullet', fontName='Body', fontSize=10.2,
                                 leading=13.5, textColor=INK, leftIndent=12,
                                 firstLineIndent=-12, spaceAfter=3),
    }

def inline(text):
    text = escape(text).replace('–', '-').replace('—', '-')
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    return text

def blocks(source):
    """Join Markdown wrapped lines, keeping headings and individual list items."""
    current = []
    for line in source.splitlines():
        boundary = not line.strip() or re.match(r'^(#{1,3} |\d+\. |\- )', line)
        if boundary and current:
            yield ' '.join(current)
            current = []
        if line.strip():
            current.append(line.strip())
    if current:
        yield ' '.join(current)

def footer(total):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFont('Body', 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(46, 27, 'Tao Veda  |  Documento di confronto  |  7 settembre 2026')
        canvas.drawRightString(A4[0]-46, 27, f'{doc.page} / {total}')
        canvas.restoreState()
    return draw

def export(name, source, title, subtitle, pages, compact=False, page_break=None):
    st = styles(compact)
    story = [Paragraph(inline(title), st['title']), Paragraph(inline(subtitle), st['subtitle'])]
    for text in blocks(source):
        if text.startswith('# ') or text.startswith('**Documento di confronto'):
            continue
        if page_break and text == page_break:
            story.append(PageBreak())
        if text.startswith('##'):
            story.append(Paragraph(inline(re.sub(r'^#+ ', '', text)), st['heading']))
        elif re.match(r'^(\d+\. |\- )', text):
            story.append(Paragraph(inline(text), st['bullet']))
        else:
            story.append(Paragraph(inline(text), st['body']))
    if compact:
        story.extend([Spacer(1, 8), Paragraph(
            'La sottoscrizione formale non è ancora aperta. Per osservazioni e proposte: '
            '<link href="mailto:info@tao-veda.org" color="#746342">info@tao-veda.org</link>. '
            'Versione pubblica: <link href="https://www.tao-veda.org/partecipare#carta-di-affinita" '
            'color="#746342">www.tao-veda.org/partecipare</link>.', st['subtitle'])])
    target = OUT / name
    doc = SimpleDocTemplate(str(target), pagesize=A4, leftMargin=46, rightMargin=46,
                            topMargin=43, bottomMargin=43, title=title,
                            author='Tao Veda - Dario Pagnoni')
    doc.build(story, onFirstPage=footer(pages), onLaterPages=footer(pages))
    reader = PdfReader(target)
    if len(reader.pages) != pages:
        raise RuntimeError(f'{name}: expected {pages} pages, got {len(reader.pages)}')
    print(f'{target}: {len(reader.pages)} pagine, {sum(len(p.extract_text()) for p in reader.pages)} caratteri')

proposal = (ROOT / 'docs/progetto-condiviso/proposta-gruppo-promotore.md').read_text()
export('tao-veda-proposta-progetto-condiviso.pdf', proposal,
       'Tao Veda come progetto condiviso',
       'Proposta per un gruppo promotore a Brescia e dintorni · Versione 7 settembre 2026',
       2, page_break='## Come lavoreremo insieme')
charter = (ROOT / 'src/data/carta-affinita.md').read_text().split('---', 2)[2]
export('tao-veda-carta-affinita.pdf', charter,
       'Carta di affinità Tao Veda', 'Versione 7 settembre 2026 · Una base per il confronto',
       1, compact=True)
