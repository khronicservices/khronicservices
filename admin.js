(() => {
  // Change this code to rotate the editor lock. GitHub authorizes all publishing.
  const ADMIN_CODE = '109248';
  const dialog = document.querySelector('#site-admin');
  const unlock = document.querySelector('#admin-unlock');
  const connect = document.querySelector('#admin-connect');
  const editor = document.querySelector('#admin-edit');
  const status = document.querySelector('#admin-status');
  const fields = document.querySelector('#admin-fields');
  const selection = editor.elements.section;
  const publish = editor.querySelector('[type=submit]');
  const close = document.querySelector('#close-admin');
  const products = Object.values(data).flat();
  const pages = { home, foundation, partners, contact, policies, purchase: () => purchase('All') };

  let github;
  let draft;
  let currentSection;
  let inputs = [];
  let busy = false;

  function setBusy(value) {
    busy = value;
    close.disabled = value;
    connect.querySelector('button').disabled = value;
    publish.disabled = value;
    selection.disabled = value;
  }

  dialog.addEventListener('cancel', event => {
    if (busy) event.preventDefault();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    github = draft = currentSection = undefined;
    inputs = [];
    fields.replaceChildren();
    unlock.reset();
    connect.reset();
  });

  document.querySelector('#open-admin').addEventListener('click', () => {
    status.textContent = '';
    unlock.hidden = false;
    connect.hidden = editor.hidden = true;
    dialog.showModal();
    unlock.elements.code.focus();
  });

  unlock.addEventListener('submit', event => {
    event.preventDefault();
    if (unlock.elements.code.value !== ADMIN_CODE) {
      status.textContent = 'Incorrect admin code.';
      unlock.elements.code.select();
      return;
    }
    unlock.reset();
    status.textContent = '';
    unlock.hidden = true;
    connect.hidden = false;
    if (location.hostname.endsWith('.github.io')) {
      const owner = location.hostname.split('.')[0];
      const repo = location.pathname.split('/')[1] || location.hostname;
      connect.elements.repository.value = owner + '/' + repo;
    }
    (connect.elements.repository.value ? connect.elements.token : connect.elements.repository).focus();
  });

  function githubRequest(credentials, method, body) {
    const url = new URL(credentials.endpoint);
    if (method === 'GET' && credentials.branch) url.searchParams.set('ref', credentials.branch);
    return fetch(url, {
      method,
      cache: 'no-store',
      redirect: 'error',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + credentials.token,
        'Content-Type': 'application/json'
      },
      body: body && JSON.stringify(body)
    });
  }

  function encodeContent(content) {
    const bytes = new TextEncoder().encode(JSON.stringify(content, null, 2) + '\n');
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function decodeContent(content) {
    return new TextDecoder().decode(Uint8Array.from(atob(content), letter => letter.charCodeAt(0)));
  }

  for (const [key, label] of Object.entries({
    home: 'Home', purchase: 'Services page', foundation: 'Foundation',
    partners: 'Partners', contact: 'Contact', policies: 'Policies', shell: 'Navigation and footer'
  })) selection.add(new Option(label, key));
  products.forEach(([name], index) => selection.add(new Option('Product – ' + name, 'product/' + index)));

  connect.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const { repository, branch, folder, token } = Object.fromEntries(new FormData(connect));
    const repo = repository.trim();
    const path = folder.trim().replace(/^\/+|\/+$/g, '');
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) ||
        (path && !path.split('/').every(part => /^[\w.-]+$/.test(part) && !['.', '..'].includes(part)))) {
      status.textContent = 'Enter the repository as owner/repository and use a valid site folder.';
      return;
    }
    const credentials = {
      endpoint: 'https://api.github.com/repos/' + repo + '/contents/' + (path ? path + '/' : '') + contentFile,
      branch: branch.trim(),
      token: token.trim()
    };
    setBusy(true);
    status.textContent = 'Loading the latest content from GitHub…';
    try {
      const response = await githubRequest(credentials, 'GET');
      if (!response.ok) {
        throw new Error('GitHub returned ' + response.status + '. Check the repository, branch, site folder, and token access.');
      }
      const file = await response.json();
      draft = parseSiteContent(decodeContent(file.content));
      github = { ...credentials, sha: file.sha };
      connect.elements.token.value = '';
      connect.hidden = true;
      editor.hidden = false;
      const page = location.hash.slice(1).split('/')[0];
      selection.value = Object.hasOwn(pages, page) ? page : 'home';
      showFields();
      status.textContent = '';
      selection.focus();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      setBusy(false);
    }
  });

  function addField(label, original, value, key, multiline = false) {
    const wrapper = document.createElement('label');
    const field = document.createElement(multiline ? 'textarea' : 'input');
    if (multiline) field.rows = Math.min(6, Math.max(2, value.split('\n').length));
    field.value = value;
    wrapper.append(label, field);
    fields.append(wrapper);
    inputs.push({ field, original, key });
    return field;
  }

  function showFields() {
    currentSection = selection.value;
    fields.replaceChildren();
    inputs = [];
    if (currentSection.startsWith('product/')) {
      const [name, price, features, unit = ''] = products[Number(currentSection.split('/')[1])];
      const { image, payment } = productConfig[name];
      const edit = draft.products[name] || {};
      addField('Name', name, edit.name ?? name, 'name').required = true;
      addField('Price (USD)', price, edit.price ?? price, 'price').required = true;
      addField('Billing unit', unit, edit.unit ?? unit, 'unit');
      const lines = features.join('\n');
      addField('Features (one per line)', lines, edit.features?.join('\n') ?? lines, 'features', true).required = true;
      addField('Image (asset path or HTTPS URL)', image, edit.image ?? image, 'image').required = true;
      addField('Stripe checkout URL (blank for direct payment)', payment || '', edit.payment ?? payment ?? '', 'payment');
      return;
    }

    const section = currentSection;
    const edits = draft.copy[section] || {};
    let originals;
    if (section === 'shell') {
      originals = new Set([...shellCopyNodes.values()].flat().map(([, text]) => text.trim()));
      originals.delete('Admin');
    } else {
      const template = document.createElement('template');
      template.innerHTML = pages[section]();
      originals = pageCopyNodes(template.content).keys();
    }
    for (const original of originals) {
      addField(original, original, edits[original] ?? original, original, original.length > 65);
    }
  }

  function storeFields() {
    if (!currentSection) return true;
    const isProduct = currentSection.startsWith('product/');
    const edits = Object.create(null);
    for (const { field, original, key } of inputs) {
      field.setCustomValidity('');
      const value = isProduct ? field.value.trim() : field.value;
      if (key === 'image' && isProduct && !validProductImage(value)) {
        field.setCustomValidity('Enter an image asset path or HTTPS URL.');
      }
      if (key === 'payment' && isProduct && value && !validPayment(value)) {
        field.setCustomValidity('Enter a https://buy.stripe.com checkout URL.');
      }
      if (isProduct && field.required && !value) {
        field.setCustomValidity('Enter a value.');
      }
      if (!field.reportValidity()) return false;
      if (value !== original) edits[key] = isProduct && key === 'features'
        ? value.split('\n').map(line => line.trim()).filter(Boolean) : value;
    }
    const target = isProduct ? draft.products : draft.copy;
    const key = isProduct ? products[Number(currentSection.split('/')[1])][0] : currentSection;
    if (Object.keys(edits).length) target[key] = edits;
    else delete target[key];
    return true;
  }

  fields.addEventListener('input', event => event.target.setCustomValidity(''));
  selection.addEventListener('change', () => {
    if (storeFields()) showFields();
    else selection.value = currentSection;
  });

  editor.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !github || !storeFields()) return;
    const body = {
      message: 'Update Khronic Services site content',
      content: encodeContent(draft),
      sha: github.sha
    };
    if (github.branch) body.branch = github.branch;
    setBusy(true);
    status.textContent = 'Publishing to GitHub…';
    try {
      const response = await githubRequest(github, 'PUT', body);
      if ([409, 422].includes(response.status)) {
        throw new Error('GitHub rejected the update. If another edit was published, copy your draft, then reopen the editor to load the latest version.');
      }
      if (!response.ok) {
        throw new Error('GitHub returned ' + response.status + '. Check the token’s Contents write access and the branch rules.');
      }
      const result = await response.json();
      github.sha = result.content.sha;
      await publishedContent;
      siteContent = structuredClone(draft);
      refreshSiteContent();
      status.textContent = 'Committed to GitHub. Visitors will see your edits after GitHub Pages deploys.';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      setBusy(false);
    }
  });
})();

