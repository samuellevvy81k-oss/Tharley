(function (root) {
  'use strict';
  // Contato informado pelo proprietário. Altere cada setor independentemente.
  const WHATSAPP_AUTOPECAS = '5561993732218';
  const WHATSAPP_ACESSORIOS = '5561993732218';
  const sectors = {
    autopecas: { name: 'Autopeças', phone: WHATSAPP_AUTOPECAS },
    acessorios: { name: 'Acessórios', phone: WHATSAPP_ACESSORIOS }
  };
  // Categorias apresentadas pelo proprietário; disponibilidade sob consulta.
  const products = [
    ['latarias', 'Latarias', 'autopecas'], ['vidros', 'Vidros', 'autopecas'],
    ['farois', 'Faróis', 'autopecas'], ['lanternas', 'Lanternas', 'autopecas'],
    ['para-choques', 'Para-choques', 'autopecas'], ['grades', 'Grades', 'autopecas'],
    ['retrovisores', 'Retrovisores', 'autopecas'], ['reposicao', 'Demais peças de reposição', 'autopecas'],
    ['alarmes', 'Alarmes', 'acessorios'], ['vidro-eletrico', 'Kits de vidro elétrico', 'acessorios'],
    ['travas', 'Travas elétricas', 'acessorios'], ['palhetas', 'Palhetas', 'acessorios'],
    ['lampadas', 'Lâmpadas', 'acessorios'], ['calhas', 'Calhas de chuva', 'acessorios'],
    ['capotas', 'Capotas marítimas', 'acessorios'], ['outros', 'Outros acessórios', 'acessorios']
  ].map(([id, name, sector]) => ({ id, name, sector }));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function search(query, sector = '') {
    const terms = normalize(query).trim().split(/\s+/);
    return products.filter(p => (!sector || p.sector === sector) && terms.every(t => normalize([p.name, p.code || '', p.application || '', sectors[p.sector].name].join(' ')).includes(t)));
  }
  function url(phone, message) {
    if (!/^\d{10,15}$/.test(phone)) throw new Error('Configure um WhatsApp válido com código do país e DDD.');
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  }
  function general(sector) {
    return url(sectors[sector].phone, `Olá, equipe Jovem Latas ${sectors[sector].name}! Vim pelo site e gostaria de solicitar um orçamento.`);
  }
  function details(item, labelSector = false) {
    const p = item.product;
    return [labelSector ? `Setor: ${sectors[p.sector].name}` : '', `Produto: ${p.name}`, p.code ? `Código: ${p.code}` : '', `Quantidade: ${item.quantity}`, p.application ? `Aplicação: ${p.application}` : ''].filter(Boolean).join('\n');
  }
  function productUrl(product, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Quantidade inválida.');
    return url(sectors[product.sector].phone, `Olá, equipe Jovem Latas ${sectors[product.sector].name}! Vim pelo site e gostaria de um orçamento:\n\n${details({ product, quantity })}\n\nPoderiam confirmar o valor e a disponibilidade?`);
  }
  function quoteGroups(items, contacts = sectors) {
    const groups = new Map();
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) throw new Error('Quantidade inválida.');
      const phone = contacts[item.product.sector].phone;
      if (!groups.has(phone)) groups.set(phone, []);
      groups.get(phone).push(item);
    }
    return [...groups].map(([phone, entries]) => {
      const names = [...new Set(entries.map(i => sectors[i.product.sector].name))];
      const label = names.join(' e ');
      return { label, url: url(phone, `Olá, equipe Jovem Latas ${label}! Vim pelo site e gostaria de um orçamento:\n\n${entries.map(i => details(i, true)).join('\n\n')}\n\nPoderiam confirmar o valor e a disponibilidade?`) };
    });
  }
  const api = { sectors, products, search, general, productUrl, quoteGroups, url };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JovemLatas = api;
})(typeof window !== 'undefined' ? window : globalThis);
