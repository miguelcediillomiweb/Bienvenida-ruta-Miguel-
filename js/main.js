(() => {
  "use strict";

  const config = window.RUTA_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const whatsappLink = $("#whatsapp-link");
  const catalogLink = $("#catalog-link");
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
    const message = encodeURIComponent(config.WHATSAPP_MESSAGE || "Hola, soy Miguel. ¿En qué puedo ayudarte?");
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
    openVideoButton.focus({ preventScroll: true });
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!config.YOUTUBE_VIDEO_ID) {
      playerHost.innerHTML = '<div class="video-placeholder"><span>▶</span><strong>Tu comercial aparecerá aquí</strong><p>Agrega el ID del video de YouTube en <b>js/config.js</b> para activar esta sección.</p></div>';
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
  if (campaignAlreadySeen()) campaignPanel.classList.add("is-hidden");

  openVideoButton.addEventListener("click", openModal);
  closeVideoButton.addEventListener("click", closeModal);
  closeBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Cuando el usuario cierra antes de terminar, el botón permanece disponible.
})();