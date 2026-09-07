// Reveal the original filled arrow through animated stroke masks, preserving
// the hand-drawn artwork while making it appear to be drawn in real time.
(() => {
  const host = document.querySelector("[data-contact-draw-arrow]");
  const image = host?.querySelector("img");
  if (!host || !image) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || root.classList.contains("motion-paused")) return;

  const ns = "http://www.w3.org/2000/svg";
  const guides = [
    {
      d: "M5 138 C0 112 1 78 9 55 C17 36 33 29 49 30 C69 30 82 44 82 61 C82 78 73 91 63 93 C53 95 49 84 49 73 C49 49 68 25 84 13 C102 1 124 0 141 10 C153 18 157 35 151 48 C147 57 138 61 133 56 C126 50 128 35 137 23 C147 9 161 2 177 3 C203 5 225 33 263 37",
      duration: 1800,
      delay: 0
    },
    { d: "M26 32 C30 28 35 26 41 25", duration: 260, delay: 360 },
    { d: "M45 25 Q47 24 48 25", duration: 160, delay: 470 },
    { d: "M153 15 C157 20 159 25 158 30", duration: 260, delay: 1080 },
    { d: "M158 35 Q159 39 157 42", duration: 160, delay: 1210 },
    { d: "M52 92 C48 88 47 83 48 79", duration: 240, delay: 820 }
  ];

  image.style.visibility = "hidden";

  fetch(image.src)
    .then((response) => {
      if (!response.ok) throw new Error("Arrow asset unavailable");
      return response.text();
    })
    .then((source) => {
      const documentSvg = new DOMParser().parseFromString(source, "image/svg+xml");
      if (documentSvg.querySelector("parsererror")) throw new Error("Invalid SVG");

      const svg = document.importNode(documentSvg.documentElement, true);
      const artwork = svg.querySelector("g");
      const parts = artwork ? [...artwork.querySelectorAll("path")] : [];
      if (!artwork || !parts.length) throw new Error("Missing arrow artwork");

      const defs = document.createElementNS(ns, "defs");

      parts.forEach((part, index) => {
        const mask = document.createElementNS(ns, "mask");
        mask.id = `contact-start-arrow-mask-${index}`;
        mask.setAttribute("maskUnits", "userSpaceOnUse");
        mask.setAttribute("x", "-12");
        mask.setAttribute("y", "-12");
        mask.setAttribute("width", "292");
        mask.setAttribute("height", "164");

        const guideData = guides[index] || guides[0];
        const guide = document.createElementNS(ns, "path");
        guide.setAttribute("d", guideData.d);
        guide.setAttribute("fill", "none");
        guide.setAttribute("stroke", "white");
        guide.setAttribute("stroke-width", "10");
        guide.setAttribute("stroke-linecap", "round");
        guide.setAttribute("stroke-linejoin", "round");
        guide.setAttribute("pathLength", "1");
        guide.classList.add("contact-start-arrow__guide");
        guide.style.setProperty("--contact-arrow-duration", `${guideData.duration}ms`);
        guide.style.setProperty("--contact-arrow-delay", `${guideData.delay}ms`);

        mask.append(guide);
        defs.append(mask);
        part.setAttribute("mask", `url(#${mask.id})`);
      });

      svg.prepend(defs);
      svg.classList.add("contact-start-arrow__svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      image.replaceWith(svg);

      const draw = () => host.classList.add("is-drawn");
      if (!("IntersectionObserver" in window)) {
        draw();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        draw();
        observer.disconnect();
      }, { threshold: 0.35 });
      observer.observe(host);
    })
    .catch(() => {
      image.style.visibility = "";
    });
})();
