# Bienvenida Ruta 1371

Página de entrada para compartir mediante QR o enlace. Desde aquí el cliente puede guardar tu contacto comercial, iniciar una conversación por WhatsApp, abrir el catálogo digital existente o consultar una campaña de marca.

## Estructura

- \`index.html\`: estructura de la página.
- \`css/styles.css\`: diseño adaptable, animaciones y estilos.
- \`js/config.js\`: número, nombre comercial, catálogo y configuración de campaña.
- \`js/main.js\`: navegación, tarjeta de contacto descargable, modal de video y comportamiento.
- \`assets/favicon.svg\`: icono del sitio.

## Tarjeta de contacto

El botón genera una tarjeta \`.vcf\` con el nombre \`Miguel Ángel\`, el cargo \`Preventa de Ruta\`, el teléfono comercial y los enlaces al catálogo y a la página. Por seguridad, Android/iPhone normalmente requiere que el usuario abra el archivo y confirme guardar el contacto; una página web no puede insertarlo silenciosamente en la agenda.

## Cambiar el comercial o campaña

Hay dos opciones:

1. **Reproductor emergente de YouTube:** configura \`CAMPAIGN_TYPE: "youtube"\` y pega el ID del video en \`YOUTUBE_VIDEO_ID\`.
2. **Enlace a una campaña externa:** configura \`CAMPAIGN_TYPE: "link"\` y pega la dirección completa en \`CAMPAIGN_URL\`. Puede ser un video, una imagen o una página de campaña.

Con el reproductor de YouTube, al terminar el video se cierra la ventana y el panel de campaña se oculta durante esa sesión del navegador. Si el cliente cierra el video antes de que termine, el botón permanece disponible.

## Cambiar enlaces o mensaje

Edita únicamente \`js/config.js\`. El catálogo existente se abre en otra pestaña para mantener separadas ambas páginas.

## Publicación

En GitHub, activa GitHub Pages desde **Settings → Pages**, seleccionando la rama \`main\` y la carpeta raíz (\`/ (root)\`). La dirección del sitio dependerá del nombre del repositorio.
