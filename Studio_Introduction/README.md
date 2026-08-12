# Studio Introduction — the art introduction document

**What this is.** Research into what art buyers actually want to receive, a determination of the single highest-converting introductory document, and that document built five ways.

**The finding in one line:** not a portfolio — an 8-page A4 Studio Profile built on capability-statement logic, whose page 2 works as a standalone one-pager.

---

## Files

| File | What it is |
|---|---|
| `00_Executive_Summary.md` | The finding and the reasoning, in two minutes |
| `01_Research_Report.md` | Full evidence-graded research with sources; section-by-section include/exclude verdicts |
| `02_Design_Specification.md` | Format, grid, type scale, colour, imagery, white space, page-by-page wireframes with purpose and psychology, print and digital production specs |
| `03_Finished_Copy_All_Versions.md` | Every word of all five versions, plus the covering email |
| `04_Fields_To_Complete.md` | **Read this before sending anything.** Every unverified fact, tiered by risk |
| `PDF/` | Five finished, print-ready, text-searchable PDFs |
| `Ritushka-Studio-Profile-EDITABLE-MASTER.docx` | All five versions as editable text for handoff or self-editing |
| `build/` | The scripts that generated the PDFs and the DOCX — rerun to regenerate after edits |

## The five versions

| Audience | File | Cover title |
|---|---|---|
| Interior designers | `Ritushka-Studio-Profile-Interior-Designers-2026.pdf` | Studio Profile |
| Art consultants | `Ritushka-Studio-Profile-Art-Consultants-2026.pdf` | Studio Profile |
| Corporate buyers | `Ritushka-Capability-Statement-Corporate-2026.pdf` | Capability Statement |
| Luxury hotels | `Ritushka-Studio-Profile-Hospitality-2026.pdf` | Studio Profile — Hospitality |
| Galleries | `Ritushka-Studio-Introduction-Galleries-2026.pdf` | Studio Introduction |

Pages 1, 4, 5 and 8 are near-identical across versions. Pages 2, 3, 6 and 7 carry the audience-specific argument. That is what makes maintaining five versions practical.

## How to use it

**Do not attach this to a first cold email.** Cold-email data across large samples shows attachments cut reply rates by roughly a third and hurt deliverability. Send four sentences, one inline image and a link — the covering email is written at the end of `03_Finished_Copy_All_Versions.md`. Attach the PDF when they reply. Hand over the printed version at meetings, site visits and fairs.

## Regenerating

```bash
cd build
python3 build_pdfs.py                                    # rebuilds all five PDFs
node build_docx.js ../Ritushka-Studio-Profile-EDITABLE-MASTER.docx
```

Paths inside the scripts point at `Artwork/` for images. Edit the content dictionaries in `build_pdfs.py` — one per version — to change copy, swap images or fill in the bracketed fields.
