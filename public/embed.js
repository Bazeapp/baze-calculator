(function () {
  const IFRAME_ID = "baze-calculator";

  function handleResize(event) {
    if (!event.data || event.data.type !== "baze-calculator:resize") {
      return;
    }

    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe) return;

    const height = Number(event.data.height);
    if (!Number.isFinite(height)) return;

    iframe.style.height = `${height}px`;
  }

  window.addEventListener("message", handleResize);

  window.BazeCalculatorEmbed = {
    mount(options = {}) {
      const {
        selector = `#${IFRAME_ID}`,
        src = "https://bazeapp.github.io/baze-calculator/",
        attributes = {},
      } = options;

      const target = document.querySelector(selector);
      if (!target) {
        throw new Error(`Elemento non trovato per selector ${selector}`);
      }

      const iframe = document.createElement("iframe");
      iframe.id = IFRAME_ID;
      iframe.src = src;
      iframe.title = attributes.title || "Calcolatore Baze";
      iframe.width = attributes.width || "100%";
      iframe.style.border = "0";
      iframe.style.borderRadius = attributes.borderRadius || "24px";
      iframe.style.width = attributes.width || "100%";
      iframe.style.height = attributes.height || "0px";
      iframe.loading = "lazy";
      iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");

      Object.entries(attributes).forEach(([key, value]) => {
        if (value != null) {
          iframe.setAttribute(key, String(value));
        }
      });

      target.replaceChildren(iframe);
    },
  };
})();
