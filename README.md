# Khronic Services

A complete static website. No build tools, package installation, or secret keys are required.

## Files

- index.html — site shell, slide-out navigation, footer
- style.css — responsive storefront styling
- app.js — page content, pricing, filters, form and navigation
- motion.js — scroll reveals, reactive cards and animation controls
- assets/khronic-logo.png — original logo
- assets/khronic-banner.png — original banner and reduced-motion fallback
- assets/khronic-animation.gif — supplied animated brand banner
- .nojekyll — optional static-host configuration

## Deploy

Upload the contents of this folder to a static web host. index.html must be at the root; keep the assets folder intact. All links use relative paths and hash routes, so no server rewrites are required. The source can be stored in a GitHub repository. GitHub Pages restricts sites primarily intended to facilitate commercial transactions; choose hosting that permits this service storefront.

## Configuration

The contact form submits to https://formspree.io/f/mgaaybjl. Ensure the endpoint is activated in Formspree, then test a real submission after hosting. Order buttons open your Discord invite. Prices and service details are in app.js. The external font service is Google Fonts, with system fallbacks.

## Interactions

The sidebar closes using its close button, Escape, backdrop click, or a navigation selection. The browser dialog manages keyboard focus. Home-page category buttons filter the service catalog. Pricing categories show each service and its add-ons. The GIF has a pause/play control and a static fallback for reduced-motion preferences. Partner cards remain placeholders and copy buttons remain disabled until codes exist.

To update an existing hosted copy, replace index.html, style.css, app.js, motion.js and the entire assets folder together.

## Motion update

Includes staggered heading entrances, one-time scroll reveals, fine-pointer card tilt and lighting, animated category rearrangement, sidebar link sequencing, and a layered hero glow. Pause motion stops the GIF and ambient effects. Reduced-motion preferences disable those enhancements automatically. No animation libraries or additional downloads are needed.
