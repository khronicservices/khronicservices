# Khronic Services

A static website ready for GitHub Pages. No build, Node.js installation, or secret keys are needed.

## Publish with GitHub Pages

1. Create a public GitHub repository (for example, khronic-services).
2. Upload index.html, style.css, app.js, and .nojekyll, plus the complete assets/ folder, directly to the repository root. Keep these files together, not inside another folder. README.md is optional.
3. In the repository, open Settings → Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Select main and / (root), then Save.
6. Wait for deployment and use the website URL displayed in Pages settings, typically https://YOUR-USERNAME.github.io/khronic-services/.

If the repository uses another default branch, choose that branch instead. Future commits to it publish your updates.

Official setup instructions: https://docs.github.com/en/pages/quickstart

## Editing

- index.html: site shell and slide-out navigation.
- style.css: typography, colors, layouts and motion.
- app.js: page content, pricing, links and navigation behavior.

Hash navigation works on GitHub Pages and with a repository subpath. Refreshing a page keeps its route without requiring a server rewrite.

The contact form sends directly to https://formspree.io/f/mgaaybjl. The endpoint owner must activate/configure the form in Formspree. Test a submission after deployment. Google Fonts supplies Manrope, with system sans-serif fallback.

Sidebar supports Escape, backdrop click, focus trapping via the browser dialog, and automatic closing after navigation. Animations respect reduced-motion preferences. Partner copy buttons remain intentionally blank and disabled until partner codes exist.

## Brand assets

Keep assets/khronic-logo.png and assets/khronic-banner.png in the repository. The logo is used in the header, sidebar, footer, hero, and favicon. The original banner appears on the home page. All asset paths are relative for GitHub project Pages.
