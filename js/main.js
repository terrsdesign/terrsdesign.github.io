(() => {
  const navigationToggle = document.querySelector(".navigation-toggle");
  const primaryNavigation = document.querySelector("#primary-navigation");

  if (navigationToggle && primaryNavigation) {
    const setNavigationState = (isOpen) => {
      navigationToggle.setAttribute("aria-expanded", String(isOpen));
      navigationToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      primaryNavigation.classList.toggle("is-open", isOpen);
    };

    navigationToggle.addEventListener("click", () => {
      setNavigationState(navigationToggle.getAttribute("aria-expanded") !== "true");
    });

    primaryNavigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setNavigationState(false);
    });

    document.addEventListener("click", (event) => {
      if (
        navigationToggle.getAttribute("aria-expanded") === "true"
        && !primaryNavigation.contains(event.target)
        && !navigationToggle.contains(event.target)
      ) {
        setNavigationState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigationToggle.getAttribute("aria-expanded") === "true") {
        setNavigationState(false);
        navigationToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) setNavigationState(false);
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  const motionToggle = document.querySelector("[data-motion-toggle]");

  if (motionToggle) {
    const motionLabel = motionToggle.querySelector("[data-motion-toggle-label]");
    const motionIcon = motionToggle.querySelector(".motion-toggle__icon");
    let motionIsPaused = false;

    try {
      motionIsPaused = window.localStorage.getItem("portfolio-motion-paused") === "true";
    } catch (error) {
      motionIsPaused = false;
    }

    const setMotionState = (isPaused) => {
      motionIsPaused = isPaused;
      document.documentElement.classList.toggle("motion-paused", isPaused);
      motionToggle.setAttribute("aria-pressed", String(isPaused));
      motionLabel.textContent = isPaused ? "Play animations" : "Pause animations";
      motionIcon.textContent = isPaused ? "▶" : "Ⅱ";

      document.querySelectorAll("video[autoplay]").forEach((video) => {
        if (isPaused) {
          video.pause();
          return;
        }

        video.play().catch(() => {
          // Autoplay restrictions can still require direct user interaction.
        });
      });

      try {
        window.localStorage.setItem("portfolio-motion-paused", String(isPaused));
      } catch (error) {
        // The preference remains active for the current page when storage is unavailable.
      }
    };

    motionToggle.addEventListener("click", () => {
      setMotionState(!motionIsPaused);
    });

    setMotionState(motionIsPaused);
  }

  const projectTabs = [...document.querySelectorAll("[data-project-tab]")];
  const projectPanels = [...document.querySelectorAll("[data-project-panel]")];
  const projectMarker = document.querySelector(".projects-tabs__marker");
  const projectsShowcase = document.querySelector(".projects-showcase");
  const projectsPanelsContainer = document.querySelector(".projects-panels");

  if (projectTabs.length && projectPanels.length) {
    let activeProjectTab = projectTabs[0];

    const positionProjectMarker = (tab) => {
      if (!projectMarker) return;

      const markerTop = tab.offsetTop + ((tab.offsetHeight - projectMarker.offsetHeight) / 2);
      projectMarker.style.top = `${markerTop}px`;
    };

    const syncProjectsHeight = (panel) => {
      if (!projectsShowcase || !projectsPanelsContainer || !panel) return;

      const panelHeight = Math.max(panel.offsetHeight, panel.scrollHeight);
      const showcaseBreathingRoom = 131;

      projectsPanelsContainer.style.height = `${panelHeight}px`;
      projectsShowcase.style.height = `${panelHeight + showcaseBreathingRoom}px`;
    };

    const activateProjectTab = (nextTab, shouldFocus = false) => {
      activeProjectTab = nextTab;

      projectTabs.forEach((tab) => {
        const isSelected = tab === nextTab;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });

      projectPanels.forEach((panel) => {
        panel.hidden = panel.dataset.projectPanel !== nextTab.dataset.projectTab;
      });

      const activePanel = projectPanels.find((panel) => !panel.hidden);
      syncProjectsHeight(activePanel);

      positionProjectMarker(nextTab);

      if (shouldFocus) nextTab.focus();
    };

    projectTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateProjectTab(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          nextIndex = (index + 1) % projectTabs.length;
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = projectTabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateProjectTab(projectTabs[nextIndex], true);
      });
    });

    const selectedProjectTab = projectTabs.find((tab) => tab.getAttribute("aria-selected") === "true") || projectTabs[0];
    activateProjectTab(selectedProjectTab);
    window.addEventListener("resize", () => {
      positionProjectMarker(activeProjectTab);
      syncProjectsHeight(projectPanels.find((panel) => !panel.hidden));
    });
  }

  const processCarousel = document.querySelector("[data-process-carousel]");

  if (processCarousel) {
    const processMenu = processCarousel.querySelector("[data-process-menu]");
    const processCardsContainer = processCarousel.querySelector("[data-process-cards]");
    const processOpenButtons = [...processCarousel.querySelectorAll("[data-process-open]")];
    const processCards = [...processCarousel.querySelectorAll("[data-process-card]")];
    const processPreviousButton = processCarousel.querySelector("[data-process-previous]");
    const processNextButton = processCarousel.querySelector("[data-process-next]");
    const processCounter = processCarousel.querySelector("[data-process-counter]");
    let activeProcessIndex = 0;
    let processIsOpen = false;
    let lastProcessTrigger = null;
    let processTouchStartX = null;
    let ignoreNextProcessCardClick = false;

    const getCardPosition = (index) => {
      const offset = (index - activeProcessIndex + processCards.length) % processCards.length;

      if (offset === 0) return "active";
      if (offset === 1) return "next";
      if (offset === processCards.length - 1) return "previous";
      if (offset === 2) return "far-next";
      return "far-previous";
    };

    const updateProcessCards = () => {
      processCards.forEach((card, index) => {
        const position = getCardPosition(index);
        const isInteractive = position === "active" || position === "next" || position === "previous";

        card.dataset.position = position;
        card.disabled = !isInteractive;
        card.tabIndex = isInteractive ? 0 : -1;
        card.setAttribute("aria-hidden", String(!isInteractive));

        if (position === "active") {
          card.setAttribute("aria-current", "step");
        } else {
          card.removeAttribute("aria-current");
        }
      });

      if (processCounter) {
        processCounter.textContent = `${activeProcessIndex + 1} / ${processCards.length}`;
      }
    };

    const moveProcessCarousel = (direction, shouldFocus = true) => {
      activeProcessIndex = (activeProcessIndex + direction + processCards.length) % processCards.length;
      updateProcessCards();
      if (shouldFocus) processCards[activeProcessIndex].focus({ preventScroll: true });
    };

    const openProcessCarousel = (index, trigger) => {
      activeProcessIndex = index;
      processIsOpen = true;
      lastProcessTrigger = trigger;
      processCarousel.classList.add("is-open");
      processMenu.hidden = true;
      processCardsContainer.hidden = false;
      updateProcessCards();
      processCards[activeProcessIndex].focus({ preventScroll: true });
    };

    const closeProcessCarousel = (restoreFocus = true) => {
      if (!processIsOpen) return;

      processIsOpen = false;
      processCarousel.classList.remove("is-open");
      processCardsContainer.hidden = true;
      processMenu.hidden = false;

      if (restoreFocus && lastProcessTrigger) lastProcessTrigger.focus({ preventScroll: true });
    };

    processOpenButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openProcessCarousel(Number(button.dataset.processOpen), button);
      });
    });

    processCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (ignoreNextProcessCardClick) {
          event.preventDefault();
          ignoreNextProcessCardClick = false;
          return;
        }

        const selectedIndex = Number(card.dataset.processCard);

        if (selectedIndex === activeProcessIndex) {
          closeProcessCarousel();
          return;
        }

        activeProcessIndex = selectedIndex;
        updateProcessCards();
        card.focus({ preventScroll: true });
      });

      card.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        moveProcessCarousel(direction);
      });
    });

    processPreviousButton?.addEventListener("click", () => moveProcessCarousel(-1));
    processNextButton?.addEventListener("click", () => moveProcessCarousel(1));

    processCardsContainer.addEventListener("touchstart", (event) => {
      processTouchStartX = event.touches[0]?.clientX ?? null;
    }, { passive: true });

    processCardsContainer.addEventListener("touchend", (event) => {
      if (processTouchStartX === null) return;

      const touchEndX = event.changedTouches[0]?.clientX ?? processTouchStartX;
      const distance = touchEndX - processTouchStartX;
      processTouchStartX = null;

      if (Math.abs(distance) < 48) return;

      ignoreNextProcessCardClick = true;
      moveProcessCarousel(distance < 0 ? 1 : -1, false);
      window.setTimeout(() => {
        ignoreNextProcessCardClick = false;
      }, 400);
    }, { passive: true });

    document.addEventListener("click", (event) => {
      if (processIsOpen && !processCarousel.contains(event.target)) {
        closeProcessCarousel(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (processIsOpen && event.key === "Escape") {
        closeProcessCarousel();
      }
    });
  }

  const aboutOptions = [...document.querySelectorAll("[data-about-option]")];
  const aboutCopy = document.querySelector("[data-about-copy]");

  if (aboutOptions.length && aboutCopy) {
    let aboutCopyTimer;
    let activeAboutOption = null;
    const defaultAboutCopy = aboutCopy.innerHTML;
    const aboutMessages = {
      hobby: "<strong>When I’m not designing, I’m usually making something with my hands.</strong><br><br>I jump between crochet, embroidery, drawing, painting, paper crafts, beads and whatever new thing has managed to convince me that I absolutely need another hobby.<br><br>I like slow, tactile processes, tiny details and the satisfaction of turning a pile of materials into something that actually exists.<br><br><strong>Apparently, one creative outlet was never going to be enough.</strong>",
      pastry: "<strong>Before UX, I worked in pastry. For years.</strong><br><br>Working professionally in pastry taught me very quickly that creativity is only half of the job. Precision, timing and attention to detail are not optional when everything has to work, look right and be ready on time.<br><br>I learned to work fast, stay precise, solve problems on the spot and keep going even when everything was slightly on fire. It also taught me discipline, resilience and how to stay calm when everything is happening at once.<br><br><strong>Different field, same brain: make it work, make it look good, don’t miss the details.</strong>",
      virgo: "<strong>Yes, I’m a Virgo.</strong> No, my life is not perfectly organized and my bookshelf is not organized by color.<br><br>I analyse everything, question my own decisions twice, notice details other people happily ignore and somehow still feel like I could have done it better. But I'm learning to be less demanding.<br><br>I care a lot about details, aesthetics and doing things properly, but I’m also curious, stubborn and very capable of overthinking something that probably needed five minutes.<br><br><strong>Basically: composed on the outside, twelve tabs open on the inside.</strong>",
      asia: "<strong>I’ve always been drawn to Asian culture, mostly through the things I watch, listen to and discover online.</strong><br><br>Movies, music, social media, people, food, everyday habits, visual details. I like noticing how culture shows up in small things and how different places express identity in completely different ways.<br><br>Food is probably the easiest way to get me interested in a place, though. Give me a dish I’ve never tried and I’ll immediately want to know what it is, where it comes from and why people love it.<br><br><strong>Apparently, curiosity has a very strong appetite.</strong>"
    };

    const selectAboutOption = (selectedOption) => {
      const shouldReset = selectedOption === activeAboutOption;
      activeAboutOption = shouldReset ? null : selectedOption;

      aboutOptions.forEach((option) => {
        option.setAttribute("aria-pressed", String(option === activeAboutOption));
      });

      window.clearTimeout(aboutCopyTimer);
      aboutCopy.classList.add("is-changing");

      aboutCopyTimer = window.setTimeout(() => {
        if (shouldReset) {
          aboutCopy.innerHTML = defaultAboutCopy;
        } else {
          aboutCopy.innerHTML = aboutMessages[selectedOption.dataset.aboutOption];
        }
        aboutCopy.classList.remove("is-changing");
      }, 140);
    };

    aboutOptions.forEach((option, index) => {
      option.addEventListener("click", () => selectAboutOption(option));
      option.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;

        event.preventDefault();
        const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + aboutOptions.length) % aboutOptions.length;
        aboutOptions[nextIndex].focus();
        selectAboutOption(aboutOptions[nextIndex]);
      });
    });
  }

  const caseAccordions = [...document.querySelectorAll("[data-case-accordion]")];

  document.querySelectorAll(".heuristic-accordion__callout, [data-draw-callout]").forEach((callout) => {
    if (!("IntersectionObserver" in window)) {
      callout.classList.add("is-drawn");
      return;
    }

    const arrowObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-drawn");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    arrowObserver.observe(callout);
  });

  caseAccordions.forEach((accordion) => {
    const trigger = accordion.querySelector("[aria-controls]");
    const panel = trigger
      ? document.getElementById(trigger.getAttribute("aria-controls"))
      : null;
    const summary = accordion.querySelector("[data-accordion-summary]");

    if (!trigger || !panel) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let transitionFallback;

    const finishClosedState = () => {
      panel.hidden = true;
      panel.style.height = "0px";
    };

    const setAccordionState = (isOpen) => {
      window.clearTimeout(transitionFallback);
      trigger.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));

      const skipTransition = prefersReducedMotion.matches
        || document.documentElement.classList.contains("motion-paused");

      if (isOpen) {
        if (summary) summary.hidden = false;
        panel.hidden = false;
        panel.style.height = "0px";
        accordion.classList.add("is-open");

        if (skipTransition) {
          panel.style.height = "auto";
          return;
        }

        window.requestAnimationFrame(() => {
          panel.style.height = `${panel.scrollHeight}px`;
        });

        transitionFallback = window.setTimeout(() => {
          panel.style.height = "auto";
        }, 400);
        return;
      }

      if (skipTransition) {
        accordion.classList.remove("is-open");
        if (summary) summary.hidden = true;
        finishClosedState();
        return;
      }

      panel.style.height = `${panel.scrollHeight}px`;
      window.requestAnimationFrame(() => {
        accordion.classList.remove("is-open");
        if (summary) summary.hidden = true;
        panel.style.height = "0px";
      });

      transitionFallback = window.setTimeout(finishClosedState, 400);
    };

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height") return;

      window.clearTimeout(transitionFallback);
      if (trigger.getAttribute("aria-expanded") === "true") {
        panel.style.height = "auto";
      } else {
        finishClosedState();
      }
    });

    trigger.addEventListener("click", () => {
      setAccordionState(trigger.getAttribute("aria-expanded") !== "true");
    });
  });

  const personasSection = document.querySelector("[data-personas-section]");

  if (personasSection) {
    const personaCards = [...personasSection.querySelectorAll("[data-persona-card]")];
    const personaTriggers = personaCards
      .map((card) => card.querySelector(".persona-card__trigger"))
      .filter(Boolean);
    const journeyContainer = personasSection.querySelector(".persona-journeys");
    const reducedJourneyMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeJourney = null;
    let journeyTransitionFallback;

    const shouldReduceJourneyMotion = () => reducedJourneyMotion.matches
      || document.documentElement.classList.contains("motion-paused");

    const resetPersonaCards = () => {
      personaCards.forEach((card) => card.classList.remove("is-active"));
      personaTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    };

    const closePersonaJourneys = () => {
      window.clearTimeout(journeyTransitionFallback);
      resetPersonaCards();
      personasSection.classList.remove("has-active-journey");

      if (!activeJourney || !journeyContainer) return;

      const closingJourney = activeJourney;
      activeJourney = null;

      if (shouldReduceJourneyMotion()) {
        closingJourney.classList.remove("is-visible");
        closingJourney.hidden = true;
        journeyContainer.style.height = "0px";
        return;
      }

      journeyContainer.style.height = `${journeyContainer.getBoundingClientRect().height}px`;
      closingJourney.classList.remove("is-visible");

      window.requestAnimationFrame(() => {
        journeyContainer.style.height = "0px";
      });

      journeyTransitionFallback = window.setTimeout(() => {
        closingJourney.hidden = true;
      }, 700);
    };

    personaTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
        const card = trigger.closest("[data-persona-card]");

        if (!shouldOpen || !panel || !card || !journeyContainer) {
          closePersonaJourneys();
          return;
        }

        window.clearTimeout(journeyTransitionFallback);
        const previousJourney = activeJourney;
        const currentHeight = previousJourney
          ? journeyContainer.getBoundingClientRect().height
          : 0;

        resetPersonaCards();
        if (previousJourney && previousJourney !== panel) {
          previousJourney.classList.remove("is-visible");
          previousJourney.hidden = true;
        }

        trigger.setAttribute("aria-expanded", "true");
        card.classList.add("is-active");
        panel.hidden = false;
        personasSection.classList.add("has-active-journey");

        activeJourney = panel;

        if (shouldReduceJourneyMotion()) {
          panel.classList.add("is-visible");
          journeyContainer.style.height = "auto";
          return;
        }

        panel.classList.remove("is-visible");
        journeyContainer.style.height = `${currentHeight}px`;

        window.requestAnimationFrame(() => {
          panel.classList.add("is-visible");
          journeyContainer.style.height = `${panel.scrollHeight}px`;
        });

        journeyTransitionFallback = window.setTimeout(() => {
          if (activeJourney === panel) journeyContainer.style.height = "auto";
        }, 700);
      });

      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closePersonaJourneys();
        trigger.focus();
      });
    });
  }

  const uiComparison = document.querySelector("[data-ui-comparison]");

  if (uiComparison) {
    const track = uiComparison.querySelector(".ui-comparison__track");
    const slides = [...uiComparison.querySelectorAll(".ui-comparison__slide")];
    const previousButton = uiComparison.querySelector("[data-ui-comparison-prev]");
    const nextButton = uiComparison.querySelector("[data-ui-comparison-next]");
    const count = uiComparison.querySelector("[data-ui-comparison-count]");
    const progress = uiComparison.querySelector("[data-ui-comparison-progress]");
    const visibleSlides = 2;
    const maximumIndex = Math.max(0, slides.length - visibleSlides);
    let currentIndex = 0;

    const updateComparison = () => {
      if (!track || !slides.length) return;

      const offset = slides[currentIndex]?.offsetLeft || 0;
      const firstVisible = currentIndex + 1;
      const lastVisible = Math.min(currentIndex + visibleSlides, slides.length);

      track.style.transform = `translateX(-${offset}px)`;
      if (count) count.textContent = `${String(firstVisible).padStart(2, "0")}–${String(lastVisible).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (progress) progress.style.width = `${(lastVisible / slides.length) * 100}%`;
      if (previousButton) previousButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex === maximumIndex;
    };

    previousButton?.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateComparison();
    });

    nextButton?.addEventListener("click", () => {
      currentIndex = Math.min(maximumIndex, currentIndex + 1);
      updateComparison();
    });

    window.addEventListener("resize", updateComparison);
    updateComparison();
  }

  const uiLightbox = document.querySelector("[data-ui-lightbox]");

  if (uiLightbox) {
    const lightboxImage = uiLightbox.querySelector("img");
    const closeButton = uiLightbox.querySelector("[data-ui-lightbox-close]");

    document.querySelectorAll("[data-lightbox-image]").forEach((button) => {
      button.addEventListener("click", () => {
        const sourceImage = button.querySelector("img");
        if (!sourceImage || !lightboxImage) return;

        lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
        lightboxImage.alt = sourceImage.alt;
        uiLightbox.showModal();
      });
    });

    closeButton?.addEventListener("click", () => uiLightbox.close());
    uiLightbox.addEventListener("click", (event) => {
      if (event.target === uiLightbox) uiLightbox.close();
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  const hero = document.querySelector(".home-hero");

  if (backToTop) {
    const updateBackToTop = () => {
      const heroIsVisible = hero
        ? hero.getBoundingClientRect().bottom > 0
        : window.scrollY < window.innerHeight;

      backToTop.classList.toggle("is-visible", !heroIsVisible);
    };

    window.addEventListener("scroll", updateBackToTop, { passive: true });
    window.addEventListener("resize", updateBackToTop);
    updateBackToTop();
  }

  const sectionLinks = [...document.querySelectorAll("[data-nav-section]")];

  if (!sectionLinks.length) return;

  const sections = sectionLinks
    .filter((link) => link.dataset.navSection !== "top")
    .map((link) => document.getElementById(link.dataset.navSection))
    .filter(Boolean);

  const setCurrentSection = (sectionId) => {
    sectionLinks.forEach((link) => {
      const isCurrent = link.dataset.navSection !== "top" && link.dataset.navSection === sectionId;
      link.classList.toggle("is-active", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateCurrentSection = () => {
    const activationLine = window.innerHeight * 0.35;
    let currentSection = "top";

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) {
        currentSection = section.id;
      }
    });

    setCurrentSection(currentSection);
  };

  let updatePending = false;

  window.addEventListener("scroll", () => {
    if (updatePending) return;

    updatePending = true;
    window.requestAnimationFrame(() => {
      updateCurrentSection();
      updatePending = false;
    });
  });

  updateCurrentSection();
})();
