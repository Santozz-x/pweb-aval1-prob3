# Livro de Receitas

Aplicação web para pesquisa e consulta de receitas culinárias. O projeto foi desenvolvido para a 1ª avaliação da disciplina de Programação Web da Universidade Estadual do Piauí (UESPI), atendendo ao Problema 3 — Catálogo de Receitas.

## Integrantes

- Jeiel
- [Renan Santos](https://github.com/RenanSantos7)

## Funcionalidades

- Pesquisa de receitas pelo nome.
- Consulta de receitas por tipo: doce, salgado ou agridoce.
- Exibição dos resultados em cartões com nome, imagem e classificação.
- Visualização dos detalhes de uma receita selecionada.
- Apresentação de ingredientes, quantidades e modo de preparo.
- Tratamento de imagens ou informações que não estejam disponíveis.
- Feedback visual para carregamento, resultados vazios e erros de comunicação.
- Layout responsivo para diferentes tamanhos de tela.

## API utilizada

Os dados exibidos pela aplicação são obtidos em tempo de execução da [API-receitas](https://github.com/DenilsonRabelo/API-receitas), disponibilizada
em:

```text
https://api-receitas-pi.vercel.app
```

A aplicação utiliza somente as rotas públicas de consulta da API. Não há banco de dados local, dados copiados para substituir a API ou backend próprio.

### Rotas consumidas

| Finalidade | Método e rota |
| --- | --- |
| Listar receitas | `GET /receitas/todas?page=1&limit=100` |
| Pesquisar por nome ou descrição | `GET /receitas/descricao?descricao=bolo&page=1&limit=100` |
| Consultar por tipo (doce, salgado ou agridoce) | `GET /receitas/tipo/:tipo` |
| Detalhar uma receita | `GET /receitas/:id` |

As rotas paginadas retornam os resultados no campo `items` e a paginação em `meta`; a rota por tipo retorna uma lista simples. Cada receita contém `id`, `receita`, `ingredientes` (texto com quantidades), `modo_preparo`, `link_imagem` e `tipo`. Quando pesquisa por nome e tipo são usados juntos, o tipo filtra no navegador o resultado da pesquisa.

A API não fornece região/origem da receita, portanto a classificação exibida é o tipo (categoria).

Exemplo de requisição:

```js
const response = await fetch(
  'https://api-receitas-pi.vercel.app/receitas/descricao?descricao=bolo&page=1&limit=100'
);

if (!response.ok) {
  throw new Error('Não foi possível consultar as receitas.');
}

const result = await response.json();
```

As rotas de login, criação, exclusão e geração de receitas com IA não fazem parte desta aplicação, pois exigem autenticação ou não são necessárias para o escopo do catálogo.

## Tecnologias

- HTML5 semântico.
- CSS3, incluindo layout responsivo.
- JavaScript executado no navegador.
- `fetch` para requisições HTTP assíncronas.
- API REST pública de receitas.

Não são utilizados React, Vue, Angular, Svelte, backend próprio, banco de dados, Firebase, Supabase ou autenticação.

## Estrutura do projeto

```text
.
├── assets/
│   ├── icon_142001.svg
│   ├── no-image.svg
│   └── lu-search.svg
├── pages/
│   └── recipe.html
├── scripts/
│   ├── api.js
│   ├── dom.js
│   ├── home.js
│   └── recipe.js
├── styles/
│   ├── home.css
│   ├── recipe.css
│   └── reset.css
├── index.html
└── README.md
```

## Como executar

Como o projeto é uma aplicação estática, não é necessário instalar dependências.

### Opção 1 — abrir diretamente (pode falhar)

Os scripts usam módulos ES, que não funcionam via `file://` em alguns navegadores; prefira a opção 2.

### Opção 2 — servidor local

Recomenda-se utilizar a extensão Live Server do Visual Studio Code.

## Tratamento de estados

As consultas assíncronas devem informar ao usuário quando:

- uma requisição está em andamento;
- a API retornou receitas;
- não foram encontrados resultados;
- o termo de busca é inválido ou está vazio;
- ocorreu uma falha de comunicação ou processamento.

Campos ausentes são tratados antes da renderização para que valores como `null` e `undefined` não sejam apresentados na interface. Quando uma imagem não estiver disponível, a aplicação utiliza uma apresentação alternativa sem quebrar o cartão da receita.

## Acessibilidade e responsividade

- A interface utiliza elementos HTML semânticos.
- Campos de pesquisa possuem rótulo e controles acionáveis por teclado.
- O foco dos controles permanece visível.
- As imagens possuem texto alternativo.
- As cores foram escolhidas considerando contraste e legibilidade.
- O conteúdo se adapta a telas menores sem exigir rolagem horizontal.

## Referências

- [Enunciado da avaliação](./pweb-aval1-prob03.pdf)
- [Repositório da API](https://github.com/DenilsonRabelo/API-receitas)
- [API em produção](https://api-receitas-pi.vercel.app)
