(() => {
  const root = document.documentElement;
  const namespace = "http://www.w3.org/2000/svg";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const arrows = [
    {
      selector: ".projects-section__arrow",
      mainIndex: 0,
      strokeWidth: 9
    },
    {
      selector: ".how-work__arrow",
      mainIndex: 0,
      strokeWidth: 10
    },
    {
      selector: ".about-section__pick img",
      replacementClass: "about-section__pick-arrow",
      mainIndex: 1,
      strokeWidth: 8,
      mainGuidePath: "M198 117 C214 118 229 109 231 98 C236 81 215 65 192 60 C168 54 142 57 119 60 C98 62 71 64 47 59 C28 54 12 42 10 28 L2 38",
      mainGuideWidth: 24
    },
    {
      selector: ".footer-social-arrow",
      mainIndex: 0,
      strokeWidth: 9
    }
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
    guide.classList.add("home-arrow-guide");
    guide.style.setProperty("--home-arrow-duration", `${duration}ms`);
    guide.style.setProperty("--home-arrow-delay", `${delay}ms`);
    return guide;
  };

  const revealWithoutMotion = (svg) => {
    svg.classList.add("is-drawing");
    svg.querySelectorAll(".home-arrow-guide").forEach((guide) => {
      guide.style.animation = "none";
      guide.style.strokeDashoffset = "0";
    });
  };

  const drawWhenVisible = (svg) => {
    if (reducedMotion.matches || root.classList.contains("motion-paused")) {
      revealWithoutMotion(svg);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      svg.classList.add("is-drawing");
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-drawing");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    observer.observe(svg);
  };

  const prepareArrow = async (image, config, arrowIndex) => {
    const source = image.currentSrc || image.src;
    image.style.visibility = "hidden";

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error("Arrow asset unavailable");

      const parsed = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
      if (parsed.querySelector("parsererror")) throw new Error("Invalid SVG");

      const svg = document.importNode(parsed.documentElement, true);
      const paths = [...svg.querySelectorAll("g path")];
      if (!paths.length || !paths[config.mainIndex]) throw new Error("Arrow paths unavailable");

      const classes = [...image.classList, "home-drawn-arrow"];
      if (config.replacementClass) classes.push(config.replacementClass);
      svg.setAttribute("class", classes.join(" "));
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.style.visibility = "visible";

      const viewBox = svg.viewBox.baseVal;
      const definitions = document.createElementNS(namespace, "defs");

      paths.forEach((artworkPath, pathIndex) => {
        const mask = document.createElementNS(namespace, "mask");
        mask.id = `home-arrow-mask-${arrowIndex}-${pathIndex}`;
        mask.setAttribute("maskUnits", "userSpaceOnUse");
        mask.setAttribute("x", String(viewBox.x - 20));
        mask.setAttribute("y", String(viewBox.y - 20));
        mask.setAttribute("width", String(viewBox.width + 40));
        mask.setAttribute("height", String(viewBox.height + 40));

        if (pathIndex === config.mainIndex) {
          mask.append(createGuide(
            document,
            config.mainGuidePath || artworkPath.getAttribute("d"),
            config.mainGuideWidth || config.strokeWidth * 1.5,
            1800,
            0
          ));
        } else {
          mask.append(createGuide(
            document,
            artworkPath.getAttribute("d"),
            Math.max(4, config.strokeWidth * 0.65),
            1800,
            0
          ));
        }

        definitions.append(mask);
        artworkPath.setAttribute("mask", `url(#${mask.id})`);
      });

      svg.prepend(definitions);
      image.replaceWith(svg);
      drawWhenVisible(svg);
    } catch (error) {
      image.style.visibility = "visible";
    }
  };

  arrows.forEach((config, arrowIndex) => {
    const image = document.querySelector(config.selector);
    if (image) prepareArrow(image, config, arrowIndex);
  });
})();
