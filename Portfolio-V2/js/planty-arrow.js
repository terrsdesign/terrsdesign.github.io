// Reveal the original filled artwork through narrow, animated stroke masks.
// The visible SVG paths are never replaced by the mask guide paths.
(() => {
  const host = document.querySelector(".planty-hero__arrow");
  const image = host?.querySelector("img");
  if (!image) return;
  if (document.documentElement.classList.contains("motion-paused")
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  image.style.visibility = "hidden";

  const ns = "http://www.w3.org/2000/svg";
  const guides = [
    { d: "M291.3 71.8 C268 93.5 235 105 202.5 102 C169 99 140 80 121 55 C113 44 109.7 34.5 109.8 26 C109.9 15 116 5 127 2 C138 -1 155 13 152.7 30 C151 45 138 57 126 64 C92 85 44 79 2 46", duration: 1450, delay: 0 },
    { d: "M16.3 73.5 C14.7 63 9.7 53.5 1.5 46 C11 53 22 57 33 56.2", duration: 240, delay: 1450 },
    { d: "M150.5 3.3 C156.5 7.5 160.6 15 159.3 22.7", duration: 140, delay: 650 },
    { d: "M159.1 28 C159.3 31 158.5 34 157 36", duration: 80, delay: 790 },
    { d: "M243.5 105.8 C237 108 230 109 223 107.8", duration: 140, delay: 260 },
    { d: "M254 101.1 C252.5 102.3 250.8 103.1 248.5 103.4", duration: 80, delay: 180 }
  ];

  fetch(image.src)
    .then((response) => {
      if (!response.ok) throw new Error("Arrow asset unavailable");
      return response.text();
    })
    .then((source) => {
      const doc = new DOMParser().parseFromString(source, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("Invalid SVG");
      const svg = document.importNode(doc.documentElement, true);
      const artwork = svg.querySelector("g");
      if (!artwork) throw new Error("Missing arrow artwork");
      const defs = document.createElementNS(ns, "defs");
      const mask = document.createElementNS(ns, "mask");
      mask.id = "planty-moodboard-drawing-mask";
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", "-8");
      mask.setAttribute("y", "-8");
      mask.setAttribute("width", "310");
      mask.setAttribute("height", "126");
      guides.forEach(({ d, duration, delay }) => {
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "7");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("pathLength", "1");
        path.classList.add("planty-ink-guide");
        path.style.setProperty("--ink-duration", (duration * 1000 / 1690) + "ms");
        path.style.setProperty("--ink-delay", (delay * 1000 / 1690) + "ms");
        mask.append(path);
      });
      defs.append(mask);
      svg.prepend(defs);
      artwork.classList.add("planty-ink-artwork");
      // Each original filled path gets its own mask, so neighboring decorative
      // marks cannot be revealed by the main stroke's mask.
      [...artwork.querySelectorAll('path')].forEach((part, index) => {
        const isolated = mask.cloneNode(true);
        isolated.id = `planty-moodboard-part-${index}`;
        [...isolated.children].forEach((guide, guideIndex) => {
          if (index === 0 ? guideIndex > 1 : guideIndex !== index + 1) guide.remove();
        });
        defs.append(isolated);
        part.setAttribute('mask', `url(#${isolated.id})`);
      });
      svg.classList.add("planty-ink-svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      image.replaceWith(svg);
    })
    .catch(() => {
      // Keep the original image if loading fails.
      image.style.visibility = "";
    });
})();

// Animate the remaining original SVGs inside their existing image elements.
// This preserves all positioning, rotation and sizing rules (and nearby text).
(() => {
  if (!('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const disabled = () => reduced.matches || root.classList.contains('motion-paused');
  const originals = new Map();
  const selector = '.planty-benchmark__callout img, .planty-direction__callout img, .planty-social__arrow img, .footer-social-arrow';
  const ns = 'http://www.w3.org/2000/svg';
  const observer = new IntersectionObserver(entries => {
    entries.forEach(async entry => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      observer.unobserve(image);
      if (disabled()) return;
      const original = image.src;
      try {
        const response = await fetch(original);
        if (!response.ok) throw new Error('Arrow unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        if (doc.querySelector('parsererror')) throw new Error('Invalid arrow');
        const svg = doc.documentElement;
        const artwork = svg.querySelector('g');
        if (!artwork || disabled()) return;
        const horizontal = original.includes('hero-arrow.svg');
        const guides = horizontal ? [
          'M291 72 C268 94 235 105 202 102 C169 99 140 80 121 55 C113 44 110 35 110 26 C110 15 116 5 127 2 C138 -1 155 13 153 30 C151 45 138 57 126 64 C92 85 44 79 2 46',
          'M16 74 C15 63 10 54 2 46 C11 53 22 57 33 56',
          'M150 3 C156 7 161 15 159 23',
          'M159 28 Q160 32 157 36',
          'M244 106 Q233 110 223 108',
          'M254 101 Q251 103 248 104'
        ] : [
          'M1 2 C27 13 49 39 60 69 C70 100 69 135 58 165 C53 177 47 186 40 190 C31 196 21 191 15 185 C9 177 12 161 20 154 C31 141 47 147 61 157 C92 179 111 226 100 279',
          'M94 246 Q104 266 100 279 Q104 263 115 253',
          'M7 164 C7 157 12 149 18 146',
          'M22 144 Q25 141 29 142',
          'M47 29 Q54 37 57 47',
          'M39 22 Q42 23 43 26'
        ];
        const defs = doc.createElementNS(ns, 'defs');
        const mask = doc.createElementNS(ns, 'mask');
        mask.id = 'ink-reveal';
        mask.setAttribute('maskUnits', 'userSpaceOnUse');
        mask.setAttribute('x', '-16');
        mask.setAttribute('y', '-16');
        mask.setAttribute('width', '360');
        mask.setAttribute('height', '330');
        guides.forEach((d, index) => {
          const path = doc.createElementNS(ns, 'path');
          Object.entries({ d, fill: 'none', stroke: 'white', 'stroke-width': '7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: '1' }).forEach(([key, value]) => path.setAttribute(key, value));
          path.setAttribute('style', `stroke-dasharray:1;stroke-dashoffset:1;animation:ink ${index === 0 ? 800 : index === 1 ? 200 : 120}ms linear ${index === 0 ? 0 : index === 1 ? 800 : 400 + (index - 2) * 120}ms forwards`);
          mask.append(path);
        });
        defs.append(mask);
        const style = doc.createElementNS(ns, 'style');
        style.textContent = '@keyframes ink{to{stroke-dashoffset:0}}';
        svg.prepend(defs, style);
        [...artwork.querySelectorAll('path')].forEach((part, index) => {
          const isolated = mask.cloneNode(true);
          isolated.id = `ink-part-${index}`;
          [...isolated.children].forEach((guide, guideIndex) => {
            if (index === 0 ? guideIndex > 1 : guideIndex !== index + 1) guide.remove();
          });
          defs.append(isolated);
          part.setAttribute('mask', `url(#${isolated.id})`);
        });
        originals.set(image, original);
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
      } catch {
        image.src = original;
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(selector).forEach(image => observer.observe(image));
  const stop = () => {
    if (!disabled()) return;
    originals.forEach((src, image) => { image.src = src; });
    originals.clear();
  };
  reduced.addEventListener('change', stop);
  new MutationObserver(stop).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
