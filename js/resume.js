(() => {
  const buttons = [...document.querySelectorAll("[data-lang-button]")];
  const panels = [...document.querySelectorAll("[data-lang-panel]")];
  const selectLanguage = (language) => {
    buttons.forEach((button) => {
      const active = button.dataset.langButton === language;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.langPanel !== language; });
    try { sessionStorage.setItem("resume-language", language); } catch {}
  };
  buttons.forEach((button) => button.addEventListener("click", () => selectLanguage(button.dataset.langButton)));
  try { if (sessionStorage.getItem("resume-language") === "it") selectLanguage("it"); } catch {}
})();
