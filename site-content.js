const contentFile = 'site-content.json';
let siteContent = { copy: {}, products: {} };

function parseSiteContent(json) {
  const value = JSON.parse(json);
  if (!value || !['copy', 'products'].every(key =>
    value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]))) {
    throw new Error('The site content file has an invalid format.');
  }
  return value;
}

function pageCopyNodes(root) {
  const nodes = new Map();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (!/\p{L}|\$/u.test(text) || node.parentElement.closest(
      'svg, .product-card, #form-status, .motion-toggle, #year, button[data-category], .catalog-count'
    )) continue;
    if (!nodes.has(text)) nodes.set(text, []);
    nodes.get(text).push(node);
  }
  return nodes;
}

function applyCopy(root, edits) {
  for (const [original, nodes] of pageCopyNodes(root)) {
    if (!Object.hasOwn(edits, original) || typeof edits[original] !== 'string') continue;
    for (const node of nodes) node.textContent = node.textContent.replace(original, () => edits[original]);
  }
}

function validProductImage(value) {
  if (/^assets\/(?:[\w-]+\/)*[\w.-]+\.(?:png|jpg|jpeg|gif|webp|avif)$/i.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function validPayment(value) {
  try {
    const url = new URL(value);
    return url.origin === 'https://buy.stripe.com' && !url.username && !url.password;
  } catch { return false; }
}

function applyPageEdits() {
  const page = location.hash.slice(1).split('/')[0] || 'home';
  const main = document.querySelector('#app');
  applyCopy(main, siteContent.copy[page] || {});
  for (const card of main.querySelectorAll('.product-card')) {
    const title = card.querySelector('h3');
    const product = title.textContent;
    if (!Object.hasOwn(siteContent.products, product)) continue;
    const edit = siteContent.products[product];
    if (!edit || typeof edit !== 'object') continue;
    const image = card.querySelector('img');
    if (typeof edit.name === 'string') title.textContent = image.alt = edit.name;
    if (typeof edit.image === 'string' && validProductImage(edit.image)) image.src = edit.image;
    const price = card.querySelector('.price');
    if (typeof edit.price === 'string') price.firstChild.textContent = '$' + edit.price;
    if (typeof edit.unit === 'string') price.querySelector('small').textContent = ' USD ' + edit.unit;
    if (Array.isArray(edit.features) && edit.features.every(feature => typeof feature === 'string')) {
      const items = edit.features.map(feature => {
        const item = document.createElement('li');
        item.textContent = feature;
        return item;
      });
      card.querySelector('ul').replaceChildren(...items);
    }
    if (edit.payment === '' || (typeof edit.payment === 'string' && validPayment(edit.payment))) {
      const payment = Boolean(edit.payment);
      const link = card.querySelector('.product-action a');
      link.href = payment ? edit.payment : discord;
      link.firstChild.textContent = payment
        ? (product === 'PC Care Plan' ? 'Subscribe with Stripe' : 'Pay with Stripe')
        : 'Contact service provider';
      link.classList.toggle('outline', !payment);
      card.querySelector('.payment-badge').textContent = payment ? 'Stripe checkout' : 'Direct payment';
      card.querySelector('.payment-note').textContent = payment
        ? 'Complete your payment securely on Stripe.'
        : 'Payment needs to be completed directly with your service provider.';
    }
  }
}

function refreshSiteContent() {
  const scroll = window.scrollY;
  window.pendingCatalogScroll = scroll;
  render();
  for (const root of document.querySelectorAll('footer, #sidebar nav')) {
    // Restore the original text before applying a newer version.
    for (const [node, original] of shellCopyNodes.get(root)) node.textContent = original;
    applyCopy(root, siteContent.copy.shell || {});
  }
}

const shellCopyNodes = new Map(
  [...document.querySelectorAll('footer, #sidebar nav')].map(root => [
    root, [...pageCopyNodes(root).values()].flat().map(node => [node, node.textContent])
  ])
);
const publishedContent = location.protocol === 'file:' ? Promise.resolve() :
  fetch(contentFile, { cache: 'no-cache' }).then(async response => {
    if (!response.ok) return;
    siteContent = parseSiteContent(await response.text());
    if (Object.keys(siteContent.copy).length || Object.keys(siteContent.products).length) refreshSiteContent();
  }).catch(error => console.warn('Could not load published site edits.', error));

