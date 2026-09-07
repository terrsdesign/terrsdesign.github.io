(() => {
  const host = document.querySelector(".prototype-cta-callout");
  const image = host?.querySelector("img");
  if (!host || !image) return;

  const namespace = "http://www.w3.org/2000/svg";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mainGuide = "M6 134 C1 116 2 84 7 72 C17 41 44 30 67 29 C75 29 82 30 89 32 C100 36 107 42 110 50 C116 65 108 78 98 85 C93 89 87 90 83 89 C79 88 76 84 75 79 C72 61 79 45 90 33 C99 23 108 17 117 12 C140 1 165 -1 185 7 C191 9 196 12 199 15 C207 23 207 31 206 36 C205 46 197 54 191 55 C188 56 186 55 184 54 C178 49 180 39 187 29 C199 12 218 1 240 4 C259 6 276 15 292 23 C313 34 334 44 359 39";
  const accentGuides = [
    "M38 30 C43 27 49 25 56 24",
    "M62 23 C64 22 66 23 67 23",
    "M208 15 C213 19 216 25 216 30",
    "M214 42 C216 40 216 37 216 35",
    "M71 89 C66 86 64 81 65 76"
  ];

  const createGuide = (documentNode, pathData, width, duration, delay) => {
    const guide = documentNode.createElementNS(namespace, "path");
    guide.setAttribute("d", pathData);
    guide.setAttribute("pathLength", "1");
    guide.setAttribute("fill", "none");
    guide.setAttribute("stroke", "white");
    guide.setAttribute("stroke-width", String(width));
    guide.setAttribute("stroke-linecap", "round");
    guide.setAttribute("stroke-linejoin", "round");
    guide.classList.add("prototype-arrow-guide");
    guide.style.setProperty("--prototype-guide-duration", `${duration}ms`);
    guide.style.setProperty("--prototype-guide-delay", `${delay}ms`);
    return guide;
  };

  const revealWithoutMotion = (svg) => {
    svg.querySelectorAll(".prototype-arrow-guide").forEach((guide) => {
      guide.style.animation = "none";
      guide.style.strokeDashoffset = "0";
    });
  };

  const prepareArrow = async () => {
    const source = image.currentSrc || image.src;

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error("Prototype arrow unavailable");

      const parsed = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
      if (parsed.querySelector("parsererror")) throw new Error("Invalid prototype arrow SVG");

      const svg = document.importNode(parsed.documentElement, true);
      const artworkPaths = [...svg.querySelectorAll("g path")];
      if (artworkPaths.length < 6) throw new Error("Prototype arrow paths unavailable");

      svg.setAttribute("class", "prototype-cta-arrow-svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");

      const definitions = document.createElementNS(namespace, "defs");
      const viewBox = svg.viewBox.baseVal;

      artworkPaths.forEach((artworkPath, index) => {
        const mask = document.createElementNS(namespace, "mask");
        mask.id = `prototype-arrow-mask-${index}`;
        mask.setAttribute("maskUnits", "userSpaceOnUse");
        mask.setAttribute("x", String(viewBox.x - 20));
        mask.setAttribute("y", String(viewBox.y - 20));
        mask.setAttribute("width", String(viewBox.width + 40));
        mask.setAttribute("height", String(viewBox.height + 40));

        if (index === 0) {
          mask.append(createGuide(document, mainGuide, 10, 1800, 0));
          mask.append(createGuide(document, "M359 39 L339 51", 10, 300, 1500));
          mask.append(createGuide(document, "M359 39 L334 30", 10, 300, 1500));
        } else {
          mask.append(createGuide(document, accentGuides[index - 1], 8, 1800, 0));
        }

        definitions.append(mask);
        artworkPath.setAttribute("mask", `url(#${mask.id})`);
      });

      svg.prepend(definitions);
      image.replaceWith(svg);

      if (reducedMotion.matches || document.documentElement.classList.contains("motion-paused")) {
        revealWithoutMotion(svg);
      }
    } catch (error) {
      image.classList.add("prototype-cta-arrow-fallback");
    }
  };

  prepareArrow();
})();
