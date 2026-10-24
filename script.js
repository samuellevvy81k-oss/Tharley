'use strict';
const app = window.JovemLatas;
const cart = new Map();
const byId = id => document.getElementById(id);
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(text, href, className = 'button blue small') {
  const node = element('a', text, className);
  node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer';
  return node;
}
function quantityInput(value, label) {
  const input = element('input');
  input.type = 'number'; input.min = '1'; input.max = '999'; input.step = '1'; input.value = value;
  input.setAttribute('aria-label', label); input.required = true;
  return input;
}
function validQuantity(input) {
  if (!input.reportValidity()) return null;
  return Number(input.value);
}
function renderProducts() {
  const products = app.search(byId('search').value, byId('sector-filter').value);
  byId('result-count').textContent = `${products.length} categorias encontradas`;
  byId('products').replaceChildren();
  if (!products.length) byId('products').append(element('p', 'Nenhum resultado. Tente outro termo ou selecione todos os setores.', 'empty'));
  for (const p of products) {
    const card = element('article', undefined, 'product');
    const symbol = element('span', p.sector === 'autopecas' ? '⚙︎' : '✳︎', 'product-symbol');
    symbol.setAttribute('aria-hidden', 'true');
    card.append(element('span', app.sectors[p.sector].name, 'badge'), symbol, element('h3', p.name), element('p', 'Aplicação e disponibilidade sob consulta.', 'muted'));
    const quantity = quantityInput(1, `Quantidade de ${p.name}`);
    const row = element('div', undefined, 'product-controls');
    const label = element('label', 'Quantidade'); label.append(quantity);
    const add = element('button', 'Adicionar à lista +', 'button blue small'); add.type = 'button';
    add.addEventListener('click', () => {
      const q = validQuantity(quantity); if (q === null) return;
      const total = (cart.get(p.id)?.quantity || 0) + q;
      if (total > 999) { byId('notice').textContent = 'O limite é de 999 unidades por produto.'; byId('notice').scrollIntoView({ block: 'center' }); return; }
      cart.set(p.id, { product: p, quantity: total }); renderCart();
      byId('notice').textContent = `${p.name} adicionado à lista de orçamento.`;
      byId('result-count').textContent = `${p.name} adicionado. ${products.length} categorias encontradas.`;
    });
    row.append(label, add);
    const direct = link('Orçar este produto ↗', app.productUrl(p, 1), 'text-link');
    direct.addEventListener('click', event => {
      const q = validQuantity(quantity);
      if (q === null) { event.preventDefault(); return; }
      direct.href = app.productUrl(p, q);
    });
    card.append(row, direct); byId('products').append(card);
  }
}
function renderCart() {
  byId('quote-count').textContent = [...cart.values()].reduce((n, i) => n + i.quantity, 0);
  byId('quote-items').replaceChildren(); byId('quote-send').replaceChildren();
  if (!cart.size) { byId('quote-items').append(element('p', 'Sua lista está vazia. Escolha os produtos no catálogo.', 'empty')); return; }
  for (const [id, item] of cart) {
    const row = element('div', undefined, 'quote-row');
    const description = element('div'); description.append(element('strong', item.product.name), element('small', app.sectors[item.product.sector].name));
    const quantity = quantityInput(item.quantity, `Quantidade de ${item.product.name} na lista`);
    quantity.addEventListener('change', () => {
      const q = validQuantity(quantity);
      if (q === null) { quantity.value = item.quantity; return; }
      item.quantity = q; renderCart();
    });
    const remove = element('button', 'Remover', 'remove'); remove.type = 'button';
    remove.setAttribute('aria-label', `Remover ${item.product.name}`);
    remove.addEventListener('click', () => { cart.delete(id); renderCart(); byId('notice').textContent = `${item.product.name} removido.`; });
    row.append(description, quantity, remove); byId('quote-items').append(row);
  }
  const groups = app.quoteGroups([...cart.values()]);
  for (const group of groups) byId('quote-send').append(link(groups.length === 1 ? 'Enviar lista pelo WhatsApp ↗' : `Enviar para ${group.label} ↗`, group.url, 'button blue'));
}
for (const node of document.querySelectorAll('[data-sector-contact]')) {
  const sector = node.dataset.sectorContact;
  node.href = app.general(sector); node.target = '_blank'; node.rel = 'noopener noreferrer';
  if (node.hasAttribute('data-contact-number')) {
    const phone = app.sectors[sector].phone;
    node.textContent = phone.length === 13 && phone.startsWith('55') ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : `+${phone}`;
  }
}
byId('search').addEventListener('input', renderProducts);
byId('sector-filter').addEventListener('change', renderProducts);
for (const node of document.querySelectorAll('[data-explore]')) node.addEventListener('click', () => {
  byId('sector-filter').value = node.dataset.explore; byId('search').value = ''; renderProducts();
});
const toggle = byId('whatsapp-toggle');
function closeOptions() { byId('whatsapp-options').hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); byId('whatsapp-options').hidden = !open; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !byId('whatsapp-options').hidden) { closeOptions(); toggle.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.whatsapp-widget')) closeOptions(); });
byId('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const sector = byId('contact-sector').value;
  const name = byId('customer').value.trim(), request = byId('request').value.trim();
  if (!name || !request) { (name ? byId('request') : byId('customer')).focus(); return; }
  const message = [`Olá, equipe Jovem Latas ${app.sectors[sector].name}! Vim pelo site e gostaria de solicitar um orçamento.`, `Nome: ${name}`, byId('vehicle').value.trim() ? `Veículo: ${byId('vehicle').value.trim()}` : '', `Pedido: ${request}`].filter(Boolean).join('\n\n');
  window.location.assign(app.url(app.sectors[sector].phone, message));
});
byId('year').textContent = new Date().getFullYear();
renderProducts(); renderCart();
