/* Small, single-pass motion. No pointer tilt or repeated entrance effects. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let observer;
  const animations = new Set();
  function settle() { animations.forEach(animation => animation.finish()); animations.clear(); }
  window.setSiteMotionPaused = value => {
    paused = value;
    document.body.classList.toggle('motion-paused', value);
    settle();
  };
  window.initSiteMotion = () => {
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    const app = document.querySelector('#app');
    if (!app) return;
    const button = app.querySelector('.motion-toggle');
    if (button && paused) {
      app.querySelector('.hero-media img').src = 'assets/khronic-banner.png';
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', 'Play site animations');
      button.textContent = 'Play motion';
    }
    if (preference.matches || paused || !('IntersectionObserver' in window)) return;
    const targets = app.querySelectorAll('.hero-copy, .hero-media, .section-head, .service-card, .product-card, .process-grid article, .about-panel, .closing-cta, .spotlight, .team .card, .partners .card, .contact-grid > *, .page-head');
    const seen = new WeakSet();
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        const element = entry.target;
        seen.add(element);
        observer.unobserve(element);
        if (!element.animate || preference.matches || paused) continue;
        const siblings = Array.from(element.parentElement.children);
        const index = siblings.indexOf(element);
        const rowIndex = element.matches('.product-card, .service-card') ? index % 3 : 0;
        const animation = element.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 560, delay: rowIndex * 45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      }
    }, { threshold: 0.04, rootMargin: '0px 0px 24px 0px' });
    targets.forEach(element => observer.observe(element));
  };
  preference.addEventListener('change', () => {
    settle();
    const image = document.querySelector('.hero-media img');
    const button = document.querySelector('.motion-toggle');
    if (image) image.src = preference.matches || paused ? 'assets/khronic-banner.png' : 'assets/khronic-animation.gif';
    if (button) button.hidden = preference.matches;
    window.initSiteMotion();
  });
})();
