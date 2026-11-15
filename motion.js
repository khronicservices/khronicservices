/* Progressive enhancement: content stays readable without animations. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let cleanup = () => {};
  let paused = false;
  const enabled = () => !preference.matches && !paused;
  const activeAnimations = new Set();
  const play = (element, frames, options) => {
    if (!enabled() || !element.animate) return;
    const animation = element.animate(frames, options);
    activeAnimations.add(animation);
    animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
    return animation;
  };
  window.setSiteMotionPaused = value => {
    paused = value;
    document.body.classList.toggle('motion-paused', value);
    activeAnimations.forEach(animation => animation.finish());
    document.querySelectorAll('.motion-pending').forEach(el => el.classList.remove('motion-pending'));
    document.querySelectorAll('.tilt-surface').forEach(el => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    });
  };
  preference.addEventListener('change', () => {
    window.setSiteMotionPaused(preference.matches);
    window.initSiteMotion();
  });
  window.initSiteMotion = () => {
    cleanup();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    const scope = document.querySelector('#app');
    if (!scope) return;
    scope.querySelectorAll('.energy-field').forEach(el => el.remove());
    scope.querySelectorAll('[data-motion-original]').forEach(el => { el.innerHTML = el.dataset.motionOriginal; });
    const events = new AbortController();
    const signal = events.signal;
    let observer;
    let pointerFrame = 0;
    const reveal = element => {
      element.classList.remove('motion-pending');
      play(element, [
        { opacity: 0, transform: 'translate3d(0,28px,0)', filter: 'blur(5px)' },
        { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0)' }
      ], { duration: 780, delay: Number(element.dataset.motionDelay || 0), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    };
    if (enabled()) {
      scope.querySelectorAll('.hero h1, .page-head h1').forEach(heading => {
        heading.dataset.motionOriginal = heading.dataset.motionOriginal || heading.innerHTML;
        heading.innerHTML = heading.dataset.motionOriginal.split(/<br\s*\/?\s*>/i).map((line, index) =>
          `<span class="title-mask"><span class="title-line" style="--line-delay:${index * 95}ms">${line}</span></span>`
        ).join('');
      });
      const heroMedia = scope.querySelector('.hero-media');
      if (heroMedia) {
        heroMedia.insertAdjacentHTML('afterbegin', '<div class="energy-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>');
        const image = heroMedia.querySelector('img');
        if (image && paused) image.src = 'assets/khronic-banner.png';
      }
      const targets = scope.querySelectorAll('.hero-copy > .eyebrow, .hero-copy > p, .hero-copy > .actions, .hero-footnote, .hero-media, .page-head > p, .section-head, .service-card, .benefit-strip > div, .spotlight-copy > *, .spotlight-art, .process-grid article, .about-panel > div, .closing-cta > *, .team .card, .partners .card, .contact-grid > *, .pricing .card, .note');
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
        targets.forEach(element => {
          const siblings = Array.from(element.parentElement.children);
          element.dataset.motionDelay = Math.min(siblings.indexOf(element) * 65, 195);
          element.classList.add('motion-pending');
          observer.observe(element);
        });
      }
      scope.querySelectorAll('.service-card, .pricing .card, .hero-media').forEach(surface => {
        surface.classList.add('tilt-surface');
        surface.addEventListener('pointermove', event => {
          if (!enabled() || !finePointer.matches || event.pointerType === 'touch') return;
          cancelAnimationFrame(pointerFrame);
          pointerFrame = requestAnimationFrame(() => {
            const rect = surface.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
            surface.style.setProperty('--light-x', `${x * 100}%`);
            surface.style.setProperty('--light-y', `${y * 100}%`);
            surface.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
            surface.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
          });
        }, { signal });
        surface.addEventListener('pointerleave', () => {
          cancelAnimationFrame(pointerFrame);
          surface.style.setProperty('--tilt-x', '0deg');
          surface.style.setProperty('--tilt-y', '0deg');
        }, { signal });
      });
      scope.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
          if (!enabled()) return;
          const previous = new Map();
          scope.querySelectorAll('.service-card:not([hidden])').forEach(card => previous.set(card, card.getBoundingClientRect()));
          requestAnimationFrame(() => {
            scope.querySelectorAll('.service-card:not([hidden])').forEach((card, index) => {
              const old = previous.get(card);
              const rect = card.getBoundingClientRect();
              if (observer) observer.unobserve(card);
              card.classList.remove('motion-pending');
              play(card, old ? [
                { transform: `translate(${old.left - rect.left}px,${old.top - rect.top}px)` },
                { transform: 'translate(0,0)' }
              ] : [
                { opacity: 0, transform: 'translateY(22px) scale(.96)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
              ], { duration: 520, delay: index * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
            });
          });
        }, { capture: true, signal });
      });
    }
    const toggle = scope.querySelector('.motion-toggle');
    if (toggle && paused) {
      const image = scope.querySelector('.hero-media img');
      if (image) image.src = 'assets/khronic-banner.png';
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Play site animations');
      toggle.textContent = 'Play motion ▷';
    }
    cleanup = () => {
      events.abort();
      observer?.disconnect();
      cancelAnimationFrame(pointerFrame);
    };
  };
})();
