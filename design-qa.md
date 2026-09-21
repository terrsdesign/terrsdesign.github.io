# Design QA — Rossotono x Speasy homepage card

## Evidence

- Source visual truth: `C:\Users\terrs\Downloads\Senza titolo.webp`
- Sidebar logo source: `C:\Users\terrs\AppData\Local\Temp\codex-clipboard-e5d84b58-18dc-4f91-9001-ad7b7f1d18b3.png`
- Implementation: `http://127.0.0.1:5500/index.html#work`
- Implementation evidence: Codex in-app browser captures at the default desktop viewport and at `390 × 844 px`
- State tested: homepage, `UX/UI` project category selected
- Target checked: Rossotono x Speasy card, project ordering, responsive stacking, and case-study link

## Comparison

- **Content fidelity:** the supplied Rossotono x Speasy mockup is used directly, without cropping or recreating its internal UI.
- **Layout:** Rossotono x Speasy is the first card, EcoDream is second, and Chocolate for Family starts the following row as requested.
- **Typography and colour:** the new card reuses the existing homepage card hierarchy, typography variables, accent colour, body colour, and link treatment.
- **Responsive behaviour:** the two-column desktop grid becomes a single-column mobile stack without clipped text or horizontal overflow.
- **Interaction:** `View case study` opens `Progetti/rossotono-x-speasy.html` successfully.

## Sidebar logo verification

- Implementation route: `http://127.0.0.1:5500/Progetti/rossotono-x-speasy.html`
- State: initial page load at the default desktop browser viewport.
- The supplied transparent logo is used directly below the project title and case-study label; it is not recreated or altered.
- The browser reports the source and rendered asset at `180 × 65 px`, preserving its original ratio and sharpness.
- The asset loaded successfully with descriptive alternative text and no browser warnings or errors.
- A focused comparison was sufficient because the implementation uses the exact supplied raster asset at its natural dimensions.

## Findings by severity

- P0: none
- P1: none
- P2: none
- P3: the empty second column beside Chocolate for Family is intentionally retained until a fourth project is added, per the product decision.

## Result

Final result: passed
