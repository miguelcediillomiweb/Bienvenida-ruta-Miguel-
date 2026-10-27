# Bienvenida Ruta 1371

Página de entrada para compartir mediante QR o enlace. Desde aquí el cliente puede iniciar una conversación por WhatsApp, abrir el catálogo digital existente o ver un comercial de YouTube.

## Estructura

- `index.html`: estructura de la página.
- `css/styles.css`: diseño adaptable, animaciones y estilos.
- `js/config.js`: enlaces, mensaje de WhatsApp e ID del comercial.
- `js/main.js`: navegación, modal de video y comportamiento.
- `assets/favicon.svg`: icono del sitio.

## Cambiar el comercial

1. Sube el comercial a YouTube.
2. Copia el ID del video (lo que aparece después de `v=` en la URL).
3. Abre `js/config.js` y pega el ID en `YOUTUBE_VIDEO_ID`.
4. Guarda los cambios.

El video se abre en una ventana emergente. Al terminar, la ventana se cierra y el panel de campaña se oculta durante esa sesión del navegador. Si el cliente cierra el video antes de que termine, el botón permanece disponible.

## Cambiar enlaces o mensaje

Edita únicamente `js/config.js`. El catálogo existente se abre en otra pestaña para mantener separadas ambas páginas.

## Publicación

En GitHub, activa GitHub Pages desde **Settings → Pages**, seleccionando la rama `main` y la carpeta raíz (`/ (root)`). La dirección del sitio dependerá del nombre del repositorio.