(() => {
  "use strict";

  const config = window.RUTA_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const whatsappLink = $("#whatsapp-link");
  const catalogLink = $("#catalog-link");
  const contactLink = $("#contact-link");
  const campaignPanel = $("#campaign-panel");
  const openVideoButton = $("#open-video");
  const modal = $("#video-modal");
  const closeVideoButton = $("#close-video");
  const closeBackdrop = $("#close-video-backdrop");
  const playerHost = $("#youtube-player");
  const toast = $("#toast");
  const SESSION_KEY = "ruta1371-campana-vista";

  let player = null;
  let apiReady = false;
  let pendingPlay = false;
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3800);
  }

  function configureLinks() {
    const number = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const message = encodeURIComponent(config.WHATSAPP_MESSAGE || "Hola, soy Miguel Ángel. ¿En qué puedo ayudarte?");
    if (number) whatsappLink.href = "https://wa.me/" + number + "?text=" + message;
    else whatsappLink.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("Configura el número de WhatsApp en js/config.js.");
    });

    if (config.CATALOG_URL) catalogLink.href = config.CATALOG_URL;
    else catalogLink.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("Configura el enlace del catálogo en js/config.js.");
    });
  }

  function buildContactCard() {
    const number = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const name = config.CONTACT_NAME || "Miguel Ángel";
    const role = config.CONTACT_ROLE || "Preventa de Ruta";
    const catalog = config.CATALOG_URL || "";
    const pageUrl = window.location.href.split("#")[0];
    const escapeVCard = (value) => String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + escapeVCard(name) + ";;;;",
      "FN:" + escapeVCard(name),
      "ORG:Peñafiel",
      "TITLE:" + escapeVCard(role),
      "TEL;TYPE=CELL,VOICE:+" + number,
      "URL:" + (catalog || pageUrl),
      "NOTE:" + escapeVCard("Contacto comercial Peñafiel. " + role + ". Catálogo digital: " + catalog + " | Página de bienvenida: " + pageUrl),
      "END:VCARD"
    ];
    return lines.join("\r\n") + "\r\n";
  }

  function prepareContactDownload(event) {
    event.preventDefault();
    const vcard = buildContactCard();
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Miguel-Angel-Preventa-de-Ruta.vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast("Tarjeta lista. Abre el archivo descargado y elige Guardar contacto.");
  }

  function campaignAlreadySeen() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; }
    catch (_) { return false; }
  }

  function hideCampaignButton() {
    if (config.HIDE_CAMPAIGN_AFTER_PLAY !== false) {
      campaignPanel.classList.add("is-hidden");
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (_) {}
    }
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (player && typeof player.stopVideo === "function") player.stopVideo();
    if (openVideoButton) openVideoButton.focus({ preventScroll: true });
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!config.YOUTUBE_VIDEO_ID) {
      playerHost.innerHTML = '<div class="video-placeholder"><span>▶</span><strong>Tu contenido aparecerá aquí</strong><p>Agrega el ID de YouTube en <b>js/config.js</b>, o configura una campaña con enlace externo.</p></div>';
      const placeholder = playerHost.querySelector(".video-placeholder");
      Object.assign(placeholder.style, {height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px",padding:"24px",textAlign:"center",color:"#eef7ff",fontFamily:"DM Sans, sans-serif"});
      placeholder.querySelector("span").style.cssText = "font-size:30px;color:#ffd58a";
      placeholder.querySelector("p").style.cssText = "max-width:430px;color:#aebed2;font-size:12px;line-height:1.6;margin:0";
      placeholder.querySelector("strong").style.cssText = "font-size:18px";
      return;
    }
    if (apiReady) createAndPlay();
    else {
      pendingPlay = true;
      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {
          apiReady = true;
          if (pendingPlay) createAndPlay();
        };
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }

  function openCampaign() {
    if (config.CAMPAIGN_TYPE === "link" && config.CAMPAIGN_URL) {
      window.open(config.CAMPAIGN_URL, "_blank", "noopener,noreferrer");
      return;
    }
    openModal();
  }

  function createAndPlay() {
    pendingPlay = false;
    if (player && typeof player.loadVideoById === "function") {
      player.loadVideoById(config.YOUTUBE_VIDEO_ID);
      return;
    }
    player = new YT.Player("youtube-player", {
      videoId: config.YOUTUBE_VIDEO_ID,
      playerVars: {autoplay: 1, controls: 1, rel: 0, playsinline: 1},
      events: {
        onReady: (event) => event.target.playVideo(),
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            closeModal();
            hideCampaignButton();
          }
        },
        onError: () => showToast("No se pudo reproducir el video. Revisa el ID en js/config.js.")
      }
    });
  }

  configureLinks();
  contactLink.addEventListener("click", prepareContactDownload);
  if (campaignAlreadySeen()) campaignPanel.classList.add("is-hidden");

  openVideoButton.addEventListener("click", openCampaign);
  closeVideoButton.addEventListener("click", closeModal);
  closeBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Si se cierra antes de terminar, el botón de campaña permanece disponible.
})();
