# Khronic Services — complete editable source

## Files

- index.html: page shell, sidebar, footer and script loading.
- style.css: base layout and responsive styles.
- theme.css: current light-blue theme and product-card styles.
- app.js: all pages, product descriptions, prices, payment links, images and interactions.
- motion.js: scroll entrances and motion controls.
- assets/: all brand images, the original animated GIF and 20 optimized product images.

## Use

Open index.html to view locally. To deploy, upload this folder’s contents together with index.html at your host’s root. Keep the assets folder and file names intact. No installation or build is required.

The separate single-file version embeds these dependencies for easier uploading. This editable version keeps them separate for convenient changes.

## Editing

Product prices and features are in the data object in app.js. Stripe links and image mappings are in productConfig. The contact form uses the supplied Formspree endpoint.

The site uses external Google Fonts with system fallbacks. Stripe handles linked checkout pages. No secret keys are included or needed.
