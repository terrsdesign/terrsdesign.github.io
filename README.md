# Mariateresa Busco — UX/UI Portfolio

Responsive portfolio and case-study website built with semantic HTML, SCSS and JavaScript.

## Local preview

1. Open this repository folder in VS Code.
2. Install the recommended **Live Sass Compiler** extension when prompted.
3. Select **Watch Sass** in the VS Code status bar.
4. Run `index.html` with Live Server.

Every SCSS change is compiled from `scss/styles.scss` into `css/styles.css`.
The compiled CSS must remain in Git because GitHub Pages does not compile SCSS.

## Structure

- `index.html`: semantic page markup
- `design-system.html`: internal component reference used during development
- `Progetti/`: individual case-study pages
- `scss/`: source files for the V2 design system and page styles
- `css/styles.css`: compiled stylesheet used by the browser and GitHub Pages
- `js/main.js`: V2-only interactions
- `assets/`: fonts, images, icons and videos
- `.vscode/`: project-level Sass compilation settings
- `portfolio-v1/`: preserved, non-indexed copy of the previous portfolio

The current portfolio does not import the V1 stylesheet, scripts, Bootstrap or legacy fonts.
