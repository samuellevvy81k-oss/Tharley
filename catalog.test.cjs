const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./catalog.js');
const message = url => new URL(url).searchParams.get('text');
test('todos os produtos têm setor e ids únicos', () => {
 assert.equal(new Set(app.products.map(p => p.id)).size, app.products.length);
 assert.equal(app.products.length, 16);
 assert.ok(app.products.every(p => app.sectors[p.sector]));
});
test('busca geral cobre ambos os setores e ignora acentos', () => {
 assert.deepEqual(new Set(app.search('vidro').map(p => p.sector)), new Set(['autopecas', 'acessorios']));
 assert.equal(app.search('lampadas')[0].name, 'Lâmpadas');
 assert.equal(app.search('vidro', 'autopecas').length, 1);
 assert.equal(app.search('nada encontrado').length, 0);
});
test('mensagem de produto preenche quantidade, código e aplicação sem inventar campos', () => {
 const p = { ...app.products[0], code: 'TESTE-01', application: 'Veículo de teste' };
 const text = message(app.productUrl(p, 3));
 for (const value of ['Jovem Latas Autopeças', 'Produto: Latarias', 'Código: TESTE-01', 'Quantidade: 3', 'Aplicação: Veículo de teste', 'Poderiam confirmar o valor e a disponibilidade?']) assert.ok(text.includes(value));
 const basic = message(app.productUrl(app.products[0], 1));
 assert.ok(!basic.includes('Código:')); assert.ok(!basic.includes('Aplicação:'));
 for (const q of [0, -1, 1.5, 1000, NaN]) assert.throws(() => app.productUrl(p, q));
});
const items = [{ product: app.products[0], quantity: 2 }, { product: app.products[8], quantity: 1 }];
test('contatos iguais unificam e identificam o setor de cada item', () => {
 const groups = app.quoteGroups(items); assert.equal(groups.length, 1);
 assert.ok(message(groups[0].url).includes('Setor: Autopeças\nProduto: Latarias'));
 assert.ok(message(groups[0].url).includes('Setor: Acessórios\nProduto: Alarmes'));
});
test('contatos diferentes separam itens e destinos', () => {
 // Números sintéticos exclusivamente para este teste, nunca exibidos no site.
 const groups = app.quoteGroups(items, { autopecas: { phone: '5511000000000' }, acessorios: { phone: '5522000000000' } });
 assert.equal(groups.length, 2);
 assert.equal(new URL(groups[0].url).pathname, '/5511000000000');
 assert.equal(new URL(groups[1].url).pathname, '/5522000000000');
 assert.ok(!message(groups[0].url).includes('Alarmes'));
 assert.ok(!message(groups[1].url).includes('Latarias'));
});
test('mensagens gerais usam o setor correto e números inválidos são rejeitados', () => {
 for (const key of Object.keys(app.sectors)) assert.ok(message(app.general(key)).includes(`Jovem Latas ${app.sectors[key].name}!`));
 assert.throws(() => app.url('55DDDNÚMERO', 'teste'));
});
