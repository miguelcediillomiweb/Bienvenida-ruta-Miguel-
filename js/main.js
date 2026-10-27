(() => {
  "use strict";
  const config = window.RUTA_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const catalogLink = $("#catalog-link");
  const contactLink = $("#contact-link");
  const campaignPanel = $("#campaign-panel");
  const openVideoButton = $("#open-video");
  const modal = $("#video-modal");
  const closeVideoButton = $("#close-video");
  const closeBackdrop = $("#close-video-backdrop");
  const playerHost = $("#youtube-player");
  const toast = $("#toast");
  const welcomeShell = $(".welcome-shell");
  const exitScreen = $("#exit-screen");
  const exitButton = $("#exit-page");
  const returnButton = $("#return-home");
  const contactPrompt = $("#contact-prompt");
  const closePromptButton = $("#close-contact-prompt");
  const promptBackdrop = $("#prompt-backdrop");
  const downloadAgainButton = $("#download-contact-again");
  const continuePageButton = $("#continue-page");

  const SESSION_KEY = "ruta1371-campana-vista";
  let player = null, apiReady = false, pendingPlay = false, toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3800);
  }

  function configureLinks() {
    const phone = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const message = encodeURIComponent(config.WHATSAPP_MESSAGE || "Hola Miguel, necesito conocer los productos de Grupo Peñafiel.");
    if (phone) catalogLink.href = "https://wa.me/" + phone + "?text=" + message;
    else catalogLink.addEventListener("click", (event) => { event.preventDefault(); showToast("Configura el número de WhatsApp en js/config.js."); });
  }

  function buildContactCard() {
    const number = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const name = config.CONTACT_NAME || "Miguel Ángel";
    const role = config.CONTACT_ROLE || "Preventa de Ruta";
    const catalog = config.CATALOG_URL || "";
    const pageUrl = window.location.href.split("#")[0];
    const escapeVCard = (value) => String(value || "")
      .replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
      .replace(/,/g, "\\,").replace(/;/g, "\\;");
    return [
      "BEGIN:VCARD", "VERSION:3.0", "N:" + escapeVCard(name) + ";;;;",
      "FN:" + escapeVCard(name), "ORG:Peñafiel", "TITLE:" + escapeVCard(role),
      "TEL;TYPE=CELL,VOICE:+" + number, "URL:" + (catalog || pageUrl),
      "NOTE:" + escapeVCard("Contacto comercial Peñafiel. " + role + ". Catálogo digital: " + catalog + " | Página de bienvenida: " + pageUrl),
      "END:VCARD"
    ].join("\r\n") + "\r\n";
  }

  function downloadContactFile() {
    const blob = new Blob([buildContactCard()], {type:"text/vcard;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Miguel-Angel-Preventa-de-Ruta.vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast("Tarjeta descargada. Abre el archivo y confirma Guardar contacto en tu teléfono.");
  }

  function showContactPrompt() {
    contactPrompt.hidden = false;
    contactPrompt.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closePromptButton.focus({preventScroll:true});
  }
  function closeContactPrompt() {
    contactPrompt.classList.remove("is-open");
    contactPrompt.hidden = true;
    document.body.style.overflow = "";
  }
  function prepareContactDownload(event) {
    event.preventDefault();
    downloadContactFile();
    window.setTimeout(showContactPrompt, 350);
  }
  function showExitScreen() {
    if (modal.classList.contains("is-open")) closeModal();
    welcomeShell.hidden = true;
    exitScreen.hidden = false;
    window.scrollTo({top:0,behavior:"smooth"});
    document.title = "Gracias por visitarnos | Grupo Peñafiel";
  }
  function returnHome() {
    exitScreen.hidden = true;
    welcomeShell.hidden = false;
    window.scrollTo({top:0,behavior:"smooth"});
    document.title = "Bienvenido | Ruta 1371";
  }
  function campaignAlreadySeen() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (_) { return false; }
  }
  function hideCampaignButton() {
    if (config.HIDE_CAMPAIGN_AFTER_PLAY !== false) {
      campaignPanel.classList.add("is-hidden");
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (_) {}
    }
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
    if (player && typeof player.stopVideo === "function") player.stopVideo();
    if (openVideoButton) openVideoButton.focus({preventScroll:true});
  }
  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    if (!config.YOUTUBE_VIDEO_ID) {
      playerHost.innerHTML = '<div class="video-placeholder"><span>▶</span><strong>Próximamente, nuevas tendencias</strong><p>Este espacio se actualizará con las campañas y novedades que se compartan.</p></div>';
      const placeholder = playerHost.querySelector(".video-placeholder");
      Object.assign(placeholder.style,{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px",padding:"24px",textAlign:"center",color:"#eef7ff",fontFamily:"DM Sans, sans-serif"});
      placeholder.querySelector("span").style.cssText = "font-size:30px;color:#ffd58a";
      placeholder.querySelector("p").style.cssText = "max-width:430px;color:#aebed2;font-size:12px;line-height:1.6;margin:0";
      placeholder.querySelector("strong").style.cssText = "font-size:18px";
      return;
    }
    if (apiReady) createAndPlay();
    else {
      pendingPlay = true;
      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => { apiReady = true; if (pendingPlay) createAndPlay(); };
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }
  function openCampaign() {
    if (config.CAMPAIGN_TYPE === "link" && config.CAMPAIGN_URL) {
      window.open(config.CAMPAIGN_URL,"_blank","noopener,noreferrer");
      return;
    }
    openModal();
  }
  function createAndPlay() {
    pendingPlay = false;
    if (player && typeof player.loadVideoById === "function") { player.loadVideoById(config.YOUTUBE_VIDEO_ID); return; }
    player = new YT.Player("youtube-player", {
      videoId:config.YOUTUBE_VIDEO_ID,
      playerVars:{autoplay:1,controls:1,rel:0,playsinline:1},
      events:{
        onReady:(event)=>event.target.playVideo(),
        onStateChange:(event)=>{ if(event.data===YT.PlayerState.ENDED){closeModal();hideCampaignButton();} },
        onError:()=>showToast("No se pudo reproducir el video. Revisa la configuración de campaña.")
      }
    });
  }
  configureLinks();
  contactLink.addEventListener("click",prepareContactDownload);
  downloadAgainButton.addEventListener("click",downloadContactFile);
  closePromptButton.addEventListener("click",closeContactPrompt);
  promptBackdrop.addEventListener("click",closeContactPrompt);
  continuePageButton.addEventListener("click",closeContactPrompt);

  exitButton.addEventListener("click",showExitScreen);
  returnButton.addEventListener("click",returnHome);
  if (campaignAlreadySeen()) campaignPanel.classList.add("is-hidden");
  openVideoButton.addEventListener("click",openCampaign);
  closeVideoButton.addEventListener("click",closeModal);
  closeBackdrop.addEventListener("click",closeModal);
  document.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&modal.classList.contains("is-open"))closeModal();});
})();