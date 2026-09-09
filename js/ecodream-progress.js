(() => {
  const progress = document.querySelector("[data-case-progress]");

  if (!progress) return;

  const links = [...progress.querySelectorAll("[data-case-progress-link]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.caseProgressLink))
    .filter(Boolean);

  if (sections.length !== links.length) return;

  let ticking = false;

  const updateProgress = () => {
    const probe = window.scrollY + window.innerHeight * 0.38;
    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (probe >= section.offsetTop) activeIndex = index;
    });

    const currentSection = sections[activeIndex];
    const nextSection = sections[activeIndex + 1];
    const segmentProgress = nextSection
      ? Math.min(1, Math.max(0, (probe - currentSection.offsetTop) / Math.max(1, nextSection.offsetTop - currentSection.offsetTop)))
      : 1;
    const amount = Math.min(1, (activeIndex + segmentProgress) / (sections.length - 1));

    progress.style.setProperty("--case-progress", amount);

    links.forEach((link, index) => {
      const isCurrent = index === activeIndex;
      link.toggleAttribute("aria-current", isCurrent);
      link.closest(".case-progress__step").classList.toggle("is-complete", index < activeIndex);
    });

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const section = document.getElementById(link.dataset.caseProgressLink);
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
      window.history.replaceState(null, "", link.hash);
    });
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  updateProgress();
})();
