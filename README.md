# Terrs Design Portfolio V2

Independent development workspace for the new portfolio and its case studies.

## Local preview

1. Open this folder—not the parent portfolio—in VS Code.
2. Install the recommended **Live Sass Compiler** extension when prompted.
3. Select **Watch Sass** in the VS Code status bar.
4. Run `index.html` with Live Server.

Every SCSS change is compiled from `scss/styles.scss` into `css/styles.css`.
The compiled CSS must remain in Git because GitHub Pages does not compile SCSS.

## Structure

- `index.html`: semantic page markup
- `design-system.html`: internal component reference used during development
- `progetti/`: individual case-study pages
- `scss/`: source files for the V2 design system and page styles
- `css/styles.css`: compiled stylesheet used by the browser and GitHub Pages
- `js/main.js`: V2-only interactions
- `assets/`: V2-only fonts, images, icons and videos
- `.vscode/`: project-level Sass compilation settings

The V2 does not import the current portfolio stylesheet, scripts, Bootstrap or existing fonts.
