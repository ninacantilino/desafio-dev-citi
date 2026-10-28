# Folhagem & Cia — Documentação da API

**Desafio de Back-end — Processo Trainee CITi 26.2**  
**Responsável:** Nina Cantilino

## 1. Visão geral

A **Folhagem & Cia** é uma API REST para administrar o catálogo e o estoque de uma loja de plantas. Permite cadastrar, consultar, atualizar e excluir plantas, aplicar filtros, registrar vendas com baixa de estoque e calcular o valor total do inventário.

**Stack:** Node.js, TypeScript, Express, Prisma ORM, PostgreSQL e Docker Compose.

A implementação preserva a arquitetura do projeto-base, com separação entre rotas, controllers, repositories e acesso ao banco. As validações de plantas foram centralizadas em `src/validators/planta.ts`.

## 2. Como executar

**Pré-requisitos:** Docker Desktop, Node.js 20+ e Yarn (`npm install -g yarn`).

Na raiz do repositório, com o Docker Desktop aberto:

```powershell
# Apenas na primeira configuração, se não houver .env:
Copy-Item .env.example .env

yarn
docker compose up -d --build
yarn migration
yarn typecheck
```

No Windows, caso o comando `yarn` não seja reconhecido no PowerShell, pode-se usar `yarn.cmd`. O `.env` contém configurações locais e **não deve ser enviado ao Git**. Por padrão, a API responde em `http://localhost:3001`, considerando o `.env.example`.

Comandos úteis:

```powershell
docker compose logs -f server    # Exibe logs da API
docker compose restart server    # Reinicia somente o servidor
docker compose down              # Para os containers e preserva os volumes
```

Para verificar as rotas, abrir `teste.http` no VS Code com a extensão REST Client e usar **Send Request**. Os IDs utilizados nos exemplos abaixo são ilustrativos.

## 3. Modelo de dados

O model `Planta` fica em `prisma/schema.prisma`.

| Campo | Tipo | Regra / finalidade |
|---|---|---|
| `id` | `Int` | Identificador autoincrementado |
| `nome` | `String` | Nome popular obrigatório |
| `especie` | `String` | Nome científico obrigatório |
| `preco` | `Int` | Preço em centavos; maior que zero |
| `estoque` | `Int` | Vasos disponíveis; permite zero, não negativos |
| `luminosidade` | Enum `Luminosidade` | `SOMBRA`, `MEIA_SOMBRA` ou `SOL_PLENO` |
| `petFriendly` | `Boolean` | Indica se é segura para animais |
| `regaACadaDias` | `Int` | Periodicidade da rega; no mínimo 1 |
| `createdAt` | `DateTime` | Gerado automaticamente no cadastro |
| `updatedAt` | `DateTime` | Atualizado automaticamente |

O preço é representado em **centavos**, de modo que `4000` significa R$ 40,00.

## 4. Rotas e exemplos

**URL base:** `http://localhost:3001`. Os exemplos de resposta são representativos; identificadores e datas variam conforme o banco.

### 4.1. Cadastrar — `POST /plantas`

**Sucesso:** `201 Created`. Todos os campos do corpo são obrigatórios.

**Requisição:**

```http
POST http://localhost:3001/plantas
Content-Type: application/json

{
  "nome": "Samambaia",
  "especie": "Nephrolepis exaltata",
  "preco": 4000,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3
}
```

**Resposta ilustrativa (`201`):**

```json
{
  "id": 1,
  "nome": "Samambaia",
  "especie": "Nephrolepis exaltata",
  "preco": 4000,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T12:00:00.000Z"
}
```

**Erros:** `400` para campos ausentes, tipos incorretos, valores fora dos limites ou enum inválido; `500` para falha inesperada.

### 4.2. Listar e filtrar — `GET /plantas`

**Sucesso:** `200 OK`. Filtros opcionais `luminosidade` (`SOMBRA`, `MEIA_SOMBRA` ou `SOL_PLENO`) e `petFriendly` (`true` ou `false`), isolados ou combinados.

```http
GET http://localhost:3001/plantas?luminosidade=SOMBRA&petFriendly=true
```

**Resposta ilustrativa (`200`):**

```json
[
  {
    "id": 2,
    "nome": "Violeta",
    "especie": "Saintpaulia ionantha",
    "preco": 2500,
    "estoque": 8,
    "luminosidade": "SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 3,
    "createdAt": "2026-10-28T12:00:00.000Z",
    "updatedAt": "2026-10-28T12:00:00.000Z"
  }
]
```

Se nenhum registro corresponder, retorna `[]`. **Erros:** `400` para filtros inválidos; `500` inesperado.

### 4.3. Consultar pelo ID — `GET /plantas/:id`

**Exemplo:** `GET http://localhost:3001/plantas/1`  
**Sucesso:** `200 OK`, com um objeto `Planta` (mesmos campos do objeto de cadastro mostrado na seção 4.1).

**Erros:** `400` para ID inválido; `404` se a planta não existir; `500` inesperado.

### 4.4. Editar parcialmente — `PATCH /plantas/:id`

**Sucesso:** `200 OK`. Apenas os campos enviados são atualizados, seguindo as mesmas regras de validação do cadastro.

```http
PATCH http://localhost:3001/plantas/1
Content-Type: application/json

{
  "preco": 5500
}
```

**Resposta ilustrativa (`200`):**

```json
{
  "id": 1,
  "nome": "Samambaia",
  "especie": "Nephrolepis exaltata",
  "preco": 5500,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T13:00:00.000Z"
}
```

**Erros:** `400` para ID, corpo ou campos inválidos; `404` para registro inexistente; `500` inesperado.

### 4.5. Excluir — `DELETE /plantas/:id`

```http
DELETE http://localhost:3001/plantas/1
```

**Sucesso:** `204 No Content`, **sem corpo**.  
**Erros:** `400` para ID inválido; `404` para planta inexistente; `500` inesperado.

### 4.6. Vender — `POST /plantas/:id/venda`

**Sucesso:** `200 OK`. Recebe uma quantidade inteira positiva e diminui o estoque sem permitir valores negativos.

```http
POST http://localhost:3001/plantas/2/venda
Content-Type: application/json

{
  "quantidade": 2
}
```

**Resposta ilustrativa (`200`), considerando estoque anterior de 8:**

```json
{
  "id": 2,
  "nome": "Violeta",
  "especie": "Saintpaulia ionantha",
  "preco": 2500,
  "estoque": 6,
  "luminosidade": "SOMBRA",
  "petFriendly": true,
  "regaACadaDias": 3,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T13:00:00.000Z"
}
```

Sem estoque suficiente, retorna `400` **sem alterar a quantidade disponível**.  
**Erros:** `400` para ID/quantidade inválidos ou estoque insuficiente; `404` para planta inexistente; `500` inesperado.

### 4.7. Valor total — `GET /plantas/estoque/valor-total`

**Sucesso:** `200 OK`. Soma o produto `preco × estoque` de cada planta e a quantidade total de vasos.

```http
GET http://localhost:3001/plantas/estoque/valor-total
```

**Resposta ilustrativa (`200`):**

```json
{
  "valorTotalEmCentavos": 15000,
  "totalDeVasos": 6
}
```

Com o estoque totalmente vazio, ambos os valores devem ser `0`.  
**Erros:** `500` para falha inesperada.

## 5. Status HTTP e validação

| Código | Significado no projeto |
|---|---|
| `200` | Consulta, edição, venda ou cálculo concluídos |
| `201` | Planta cadastrada |
| `204` | Exclusão realizada, sem resposta JSON |
| `400` | Dados/filtros/JSON inválidos ou estoque insuficiente |
| `404` | Planta não encontrada |
| `500` | Erro inesperado no servidor |

Os erros de validação usam mensagens claras em JSON, em geral no formato `{ "message": "Descrição do erro." }`. A validação verifica tipos, estrutura do corpo da requisição, limites dos inteiros aceitos pelo banco e enum. No PATCH, somente campos enviados são validados; `estoque: 0` e `petFriendly: false` são válidos.

## 6. Decisões técnicas e concorrência

- **Organização:** as rotas apontam para controllers, responsáveis por HTTP e regras de validação; repositories acessam o banco via Prisma. A centralização em `src/validators/planta.ts` reduz duplicação entre POST e PATCH.
- **Controle de estoque:** a venda usa uma atualização condicional (`estoque >= quantidade`) com decremento, impedindo que duas vendas consumam o mesmo último vaso. Uma revisão posterior passou a coordenar atualização e consulta por transação. Requisições sequenciais não comprovam, por si só, concorrência real.
- **Erros:** foram aprimorados os limites numéricos, o tratamento de corpos inválidos e JSON malformado e a distinção de registros inexistentes durante operações concorrentes.
- **Bônus:** a prioridade foi atender os sete requisitos obrigatórios; bônus opcionais não são declarados como implementados neste documento.

## 7. Testes e verificações

Os testes foram organizados no arquivo `teste.http` e executados manualmente com a extensão REST Client do VS Code. Foram exercitados cadastro, listagem, consulta por ID, filtros isolados e combinados, edição, exclusão, venda, falta de estoque e cálculo do inventário, além de vários retornos de erro.

Após a revisão do Codex, foram confirmados `400` nos testes de inteiro acima do limite do banco, PATCH recebendo array, JSON malformado e venda com quantidade fracionária. O comando `yarn.cmd typecheck` passou sem erros. O arquivo HTTP não constitui, sozinho, uma suíte automatizada; não se afirma que todos os cenários extremos ou uma disputa real entre duas vendas simultâneas foram testados.

## 8. Metodologia, dificuldades e uso de IA

O trabalho começou a partir do CRUD de usuários fornecido pelo desafio. Primeiro foram criados o modelo de `Planta`, o enum e a migration; em seguida foram implementados CRUD, filtros, venda e cálculo do valor do estoque.

Entre as dificuldades encontradas estiveram a necessidade de atualizar o Prisma Client e reiniciar o servidor após certas alterações, a identificação de arquivos não salvos durante os testes e o tratamento correto de status HTTP e validações. Essas situações foram investigadas com execução da API, inspeção de respostas e revisão do código.

O **ChatGPT** foi utilizado como apoio ao entendimento de conceitos, à organização do desenvolvimento e à interpretação de erros. O **Codex** auxiliou na revisão estática, na identificação de casos extremos, na refatoração das validações e no tratamento de erros e concorrência. As mudanças foram acompanhadas e os principais cenários foram verificados por meio de requisições HTTP e `typecheck`. A IA foi utilizada como ferramenta de apoio ao aprendizado e à revisão.

---

**Escopo de referência:** `DESAFIO.md` do repositório-base do CITi.
