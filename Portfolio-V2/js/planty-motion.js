(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const activeAnimations = new Set();
  const motionDisabled = () => reducedMotion.matches || root.classList.contains('motion-paused');
  const groups = new Map();

  const register = (selector, items, step, distance) => {
    document.querySelectorAll(selector).forEach((group) => {
      groups.set(group, { items: [...group.querySelectorAll(items)], step, distance });
    });
  };

  register('.planty-palette', '.planty-palette__swatch', 180, 8);
  register('.planty-icons__grid', 'li', 180, 8);
  register('.planty-logo__variations', 'img', 320, 0);
  register('.planty-logo__alternatives-grid', 'img', 280, 0);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motionDisabled()) return;
      const { items, step, distance } = groups.get(entry.target);
      items.forEach((item, index) => {
        // Elements remain visible without JavaScript or when motion is disabled.
        const animation = item.animate([
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 2000,
          delay: index * step,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'backwards'
        });
        activeAnimations.add(animation);
        const cleanUp = () => activeAnimations.delete(animation);
        animation.addEventListener('finish', cleanUp, { once: true });
        animation.addEventListener('cancel', cleanUp, { once: true });
      });
    });
  }, { threshold: 0.12 });

  groups.forEach((_, group) => observer.observe(group));

  const respectPreferences = () => {
    if (!motionDisabled()) return;
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  };
  reducedMotion.addEventListener('change', respectPreferences);
  new MutationObserver(respectPreferences).observe(root, {
    attributes: true,
    attributeFilter: ['class']
  });
})();
