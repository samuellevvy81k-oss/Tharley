# Jovem Latas — Autopeças e Acessórios

Site estático responsivo em português, com identidade azul e amarelo, catálogo por setor, busca sem distinção de acentos, lista de orçamento, formulário e atendimento pelo WhatsApp. Inclui apresentação da mecânica personalizada.

## Desenvolvimento

Na raiz do repositório, execute:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Verifique com `curl --fail http://127.0.0.1:3000/`. Não há dependências para instalar.

## Configuração e catálogo

Em `catalog.js`, configure `WHATSAPP_AUTOPECAS` e `WHATSAPP_ACESSORIOS` com código do país, DDD e número, apenas dígitos. Ambos usam inicialmente o número informado pelo proprietário: `5561993732218`. Podem ser diferentes. Os botões, o formulário e o rodapé usam essa fonte única.

Cada produto em `products` tem `id`, `name` e `sector` obrigatório (`autopecas` ou `acessorios`). Os campos `code` e `application` são opcionais e, quando cadastrados, entram na mensagem do produto. O catálogo inicial apresenta as linhas de produtos informadas, sem inventar códigos, preços, fotos ou disponibilidade.

A lista agrupa os itens pelo contato configurado: números iguais produzem uma mensagem com o setor de cada item; números diferentes produzem botões separados. Quantidades de 1 a 999. A lista existe apenas durante a sessão da página e é apagada ao recarregar. A mensagem é revisada e enviada pelo cliente no WhatsApp; não há envio automático, backend ou armazenamento de dados do formulário.

## Validação

```sh
node --check catalog.js
node --check script.js
node --test catalog.test.cjs
```

## Publicação

Publique `index.html`, `style.css`, `catalog.js` e `script.js` em uma hospedagem estática. Endereço, horários, logo oficial, fotos e aplicações específicas podem ser adicionados quando fornecidos.
