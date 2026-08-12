const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
        Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle } = require('docx');
const fs = require('fs');

const SERIF = 'Georgia', SANS = 'Calibri';
const INK = '14171A', GREY = '6E7478', RULEC = 'DCD9D2';

const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.LEFT,
  spacing: { before: (o.before ?? 0) * 20, after: (o.after ?? 6) * 20, line: (o.line ?? 300) },
  border: o.rule ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULEC, space: 6 } } : undefined,
  children: [new TextRun({
    text, font: o.font || SERIF, size: (o.size || 10.5) * 2, bold: !!o.bold,
    italics: !!o.italic, color: o.color || INK,
    allCaps: !!o.caps, characterSpacing: o.track || 0,
  })],
});

const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 200 },
  children: [new TextRun({ text: t, font: SANS, size: 30, bold: true, color: INK, allCaps: true, characterSpacing: 40 })] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK, space: 4 } },
  children: [new TextRun({ text: t, font: SANS, size: 20, bold: true, color: INK, allCaps: true, characterSpacing: 30 })] });
const NOTE = t => P(t, { font: SANS, size: 8.5, italic: true, color: GREY, after: 10 });
const LABEL = t => P(t, { font: SANS, size: 8, bold: true, color: GREY, caps: true, track: 30, before: 8, after: 2 });
const HEADLINE = t => P(t, { size: 15, after: 8 });
const STAND = t => P(t, { size: 11, italic: true, after: 10 });
const BODY = t => P(t, { size: 10.5, after: 8 });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

const TOTAL = 9360; // DXA, A4 with 20mm margins
function specTable(rows) {
  return new Table({
    columnWidths: [2600, 6760],
    width: { size: TOTAL, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: RULEC },
    },
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({ width: { size: 2600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, right: 160 },
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
          children: [P(k, { font: SANS, size: 8, bold: true, color: GREY, caps: true, track: 30, after: 0 })] }),
        new TableCell({ width: { size: 6760, type: WidthType.DXA }, margins: { top: 100, bottom: 100 },
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
          children: [P(v, { font: SANS, size: 9.5, after: 0 })] }),
      ],
    })),
  });
}

function stepTable(steps) {
  return new Table({
    columnWidths: [1500, 6360, 1500],
    width: { size: TOTAL, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: RULEC },
    },
    rows: steps.map(([n, name, body, when]) => new TableRow({
      children: [
        new TableCell({ width: { size: 1500, type: WidthType.DXA }, margins: { top: 100, bottom: 100, right: 120 },
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
          children: [P(`${n}  ${name}`, { font: SANS, size: 8, bold: true, color: INK, caps: true, track: 30, after: 0 })] }),
        new TableCell({ width: { size: 6360, type: WidthType.DXA }, margins: { top: 100, bottom: 100 },
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
          children: [P(body, { size: 9.5, after: 0 })] }),
        new TableCell({ width: { size: 1500, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120 },
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
          children: [P(when, { font: SANS, size: 8.5, color: GREY, align: AlignmentType.RIGHT, after: 0 })] }),
      ],
    })),
  });
}

const data = JSON.parse(fs.readFileSync('/tmp/docx_content.json', 'utf8'));
const kids = [];

kids.push(P('RITUSHKA', { font: SANS, size: 20, color: INK, caps: true, track: 200, after: 4 }));
kids.push(P('Studio Profile — editable master', { size: 13, after: 12 }));
kids.push(P('All five audience versions. Text only — this file is for editing and handoff; the designed layout is in the PDF set and the specification in 02_Design_Specification.md.', { font: SANS, size: 9.5, color: GREY, after: 6 }));
kids.push(P('Anything inside ‹angle brackets› is a fact only Ritushka can supply. Check every one before sending — see 04_Fields_To_Complete.md.', { font: SANS, size: 9.5, color: GREY, after: 0 }));
kids.push(BREAK());

data.versions.forEach((v, vi) => {
  if (vi) kids.push(BREAK());
  kids.push(H1(v.name));
  kids.push(NOTE(`Cover title: ${v.coverTitle}`));
  v.pages.forEach(pg => {
    kids.push(H2(`Page ${pg.n} — ${pg.title}`));
    if (pg.purpose) kids.push(NOTE(`Purpose: ${pg.purpose}`));
    if (pg.headline) { kids.push(LABEL('Headline')); kids.push(HEADLINE(pg.headline)); }
    if (pg.standfirst) { kids.push(LABEL('Standfirst')); kids.push(STAND(pg.standfirst)); }
    if (pg.body) { kids.push(LABEL('Body')); pg.body.forEach(b => kids.push(BODY(b))); }
    if (pg.items) { kids.push(LABEL('Numbered points'));
      pg.items.forEach((it, i) => {
        kids.push(P(`${String(i + 1).padStart(2, '0')} — ${it[0]}`, { font: SANS, size: 9.5, bold: true, after: 2 }));
        kids.push(BODY(it[1]));
      }); }
    if (pg.panelTitle) { kids.push(LABEL(pg.panelTitle)); kids.push(specTable(pg.panel)); }
    if (pg.steps) { kids.push(LABEL('Process')); kids.push(stepTable(pg.steps)); }
    if (pg.blocks) pg.blocks.forEach(b => { kids.push(LABEL(b[0])); kids.push(specTable(b[1])); });
    if (pg.terms) { kids.push(LABEL(pg.terms[0])); kids.push(P(pg.terms[1], { font: SANS, size: 9.5, after: 8 })); }
    if (pg.contact) { kids.push(LABEL('Contact block')); pg.contact.forEach(l => kids.push(P(l, { font: SANS, size: 9.5, after: 2 }))); }
    if (pg.qr) kids.push(NOTE(`QR label: ${pg.qr}`));
    if (pg.caption) kids.push(NOTE(`Caption: ${pg.caption}`));
  });
});

const doc = new Document({
  creator: 'Ritushka', title: 'Ritushka — Studio Profile, editable master',
  styles: { default: { document: { run: { font: SERIF, size: 21, color: INK } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(process.argv[2], b);
  console.log('written', process.argv[2], (b.length / 1024).toFixed(0) + 'KB');
});
