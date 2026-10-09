(() => {
  const prototype = document.querySelector('[data-prototype-src]');
  if (!prototype) return;

  const loadPrototype = () => {
    prototype.src = prototype.dataset.prototypeSrc;
    prototype.removeAttribute('data-prototype-src');
  };

  if (!('IntersectionObserver' in window)) {
    loadPrototype();
    return;
  }

  // Keep Figma's controls and starting screen; defer only its network requests.
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    loadPrototype();
  }, { rootMargin: '300px 0px' });

  observer.observe(prototype);
})();
