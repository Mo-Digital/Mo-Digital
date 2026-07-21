/* Kontakt-Seite: reiner Auswahl-Flow (keine Texteingabe) - 2 Fragen, dann Calendly */

const CALENDLY_URL = "https://calendly.com/mo-digital/30min";
const CALENDLY_CONSENT_KEY = "calendlyConsent";

function hasCalendlyConsent() {
  try {
    return sessionStorage.getItem(CALENDLY_CONSENT_KEY) === "true";
  } catch (e) {
    return false;
  }
}

function rememberCalendlyConsent() {
  try {
    sessionStorage.setItem(CALENDLY_CONSENT_KEY, "true");
  } catch (e) {
    /* sessionStorage nicht verfügbar (z. B. Privatmodus) - Zustimmung gilt dann nur für diesen Aufruf */
  }
}

function loadCalendlyWidget(container) {
  const widget = document.createElement("div");
  widget.className = "calendly-inline-widget";
  widget.setAttribute("data-url", CALENDLY_URL);
  widget.style.minWidth = "280px";
  widget.style.height = "650px";

  container.innerHTML = "";
  container.appendChild(widget);
  container.classList.remove("hidden");

  if (window.Calendly) {
    window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: widget });
    return;
  }

  const script = document.createElement("script");
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  const flow = document.querySelector("[data-contact-flow]");
  if (!flow) return;

  const steps = flow.querySelectorAll("[data-flow-step]");
  const progress = flow.querySelector("[data-flow-progress]");
  const next1 = flow.querySelector('[data-flow-next="1"]');
  const next2 = flow.querySelector('[data-flow-next="2"]');
  const back2 = flow.querySelector('[data-flow-back="2"]');

  const calendlyConsent = flow.querySelector("[data-calendly-consent]");
  const calendlyLoadButton = flow.querySelector("[data-calendly-load]");
  const calendlyContainer = flow.querySelector("[data-calendly-container]");

  if (calendlyLoadButton && calendlyConsent && calendlyContainer) {
    calendlyLoadButton.addEventListener("click", () => {
      rememberCalendlyConsent();
      calendlyConsent.classList.add("hidden");
      loadCalendlyWidget(calendlyContainer);
    });

    if (hasCalendlyConsent()) {
      calendlyConsent.classList.add("hidden");
      loadCalendlyWidget(calendlyContainer);
    }
  }

  goToStep(1);

  steps.forEach((step) => {
    const multiButtons = step.querySelectorAll("[data-flow-multi]");
    multiButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const pressed = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!pressed));
        button.classList.toggle("is-selected", !pressed);
        next1.disabled = step.querySelectorAll('[data-flow-multi][aria-pressed="true"]').length === 0;
      });
    });

    const singleButtons = step.querySelectorAll("[data-flow-single]");
    singleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        singleButtons.forEach((b) => {
          b.setAttribute("aria-pressed", "false");
          b.classList.remove("is-selected");
        });
        button.setAttribute("aria-pressed", "true");
        button.classList.add("is-selected");
        next2.disabled = false;
      });
    });
  });

  next1.addEventListener("click", () => goToStep(2));
  back2.addEventListener("click", () => goToStep(1));
  next2.addEventListener("click", () => goToStep(3));

  function goToStep(stepNumber) {
    steps.forEach((step) => {
      const isActive = Number(step.getAttribute("data-flow-step")) === stepNumber;
      step.classList.toggle("hidden", !isActive);
    });
    if (progress) {
      progress.classList.toggle("hidden", stepNumber === 3);
      progress.textContent = `Schritt ${stepNumber} von 2`;
    }
  }
});
