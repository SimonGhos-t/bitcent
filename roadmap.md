# Roadmap do BitCent

Planejamento das implementações depois da **Versão 2.0** (12/11/2026).
Cada versão é publicada sozinha: commits por etapa e build conferido antes de cada envio.

| Versão | Tema | Principais entregas |
| --- | --- | --- |
| v2.1 (próxima) | Base e segurança | Regras do Firestore, limpar CPF/telefone, gravação em lote, lint e testes |
| v2.2 | Contas fixas | Cadastro das contas, lançamento automático, previstas e confirmar, card "Contas do mês" |
| v2.3 | Compras parceladas | Opção "Parcelado", parcelas geradas em lote, selo 3/10 nas listas, card "Parcelas futuras" |
| v2.4 | Painel e metas | Comparação mensal, limite por categoria, evolução em 6 meses, metas e exportar CSV |

---

## v2.1 — Base e segurança

- [ ] **Regras do Firestore**: garantir que só o dono lê e grava `usuarios/{email}` e `financas/{email}/...`
      (ex.: `request.auth.token.email == email`).
- [ ] **Limpar CPF e telefone do banco**: apagar os campos `cpf` e `telefone`, que a tela não usa mais.
- [ ] **Gravação e exclusão em lote** em `Colecao` (`writeBatch`), para criar ou apagar várias transações de uma vez.
- [ ] **Ids fixos** para lançamentos gerados (`{recorrenciaId}_{AAAA-MM}`, `{compraId}_{n}`), para nunca duplicar.
- [ ] **Testes** das funções de cálculo: `Dinheiro`, `ResumoMensal`, divisão de parcelas, último dia do mês.
- [ ] **Corrigir a configuração do lint**: `npm run lint` hoje para com erro de configuração
      (`'@typescript-eslint/no-explicit-any': ''` em `eslint.config.mjs`).

## v2.2 — Contas fixas (transações recorrentes)

Cadastra a conta uma vez (ex.: Aluguel, dia 10, R$ 1.200) e ela aparece sozinha nos meses seguintes.
Contas de valor variável (luz, água) aparecem como **previstas** até o valor real ser confirmado.

### Modelo de dados

Coleção nova `financas/{email}/recorrencias`, um documento por conta fixa:

| Campo | Tipo | Exemplo | Para que serve |
| --- | --- | --- | --- |
| `tipo` | despesa / receita / guardado | despesa | Igual à transação |
| `categoria`, `descricao` | texto | Moradia, Aluguel | Mesmos selects do formulário |
| `valor` | número | 1200 | Valor padrão de cada mês |
| `valorVariavel` | boolean | false | Se `true`, o lançamento nasce "previsto" e pede confirmação |
| `diaDoMes` | 1 a 31 | 10 | Dia do lançamento |
| `inicio` | `AAAA-MM` | 2026-12 | Primeiro mês em que aparece |
| `fim` | `AAAA-MM`, opcional | — | Vazio = sem data para acabar |
| `ativa` | boolean | true | Pausar sem apagar o histórico |

Cada transação gerada ganha `recorrenciaId` e `situacao` (`prevista` | `confirmada`).

### Geração dos lançamentos

1. Ao abrir um mês, buscar as recorrências ativas daquele mês.
2. Para cada uma sem lançamento no mês, criar a transação com id `{recorrenciaId}_{AAAA-MM}`
   (evita duplicar se dois aparelhos abrirem o mês ao mesmo tempo).
3. Valor fixo → `confirmada`; valor variável → `prevista`, com o valor padrão.
4. Meses futuros não são gravados: aparecem só como projeção.

### Telas

- [ ] Formulário: opção "Repetir todo mês", com o dia e a opção de valor variável.
- [ ] Lista de transações: ícone de repetição nas recorrentes; previstas com estilo apagado e botão "Confirmar valor".
- [ ] Lista de contas fixas (valor, dia, pausar) — em Meus Dados ou num item novo do menu.
- [ ] Início: card "Contas do mês" (lançadas × a confirmar).

### Editar e excluir

Perguntar **só este mês** ou **este e os próximos**. "Este e os próximos" altera a recorrência e encerra a
antiga com `fim` no mês anterior, para o histórico não mudar.

### Casos especiais

- Dia 31 em mês com 30 dias (ou fevereiro) → último dia do mês.
- Recorrência criada no meio do mês → o primeiro lançamento já sai no mês atual.
- Apagar a recorrência não apaga os lançamentos já confirmados.

## v2.3 — Compras parceladas

Lança a compra uma vez (ex.: Notebook, R$ 3.000 em 10x) e o app cria as 10 parcelas, uma por mês,
identificadas como "Notebook (3/10)".

### Modelo de dados

As parcelas são transações normais com campos a mais (substituem o campo `parcelada`, que existe em
`Transacao` mas não é usado):

| Campo | Exemplo | Para que serve |
| --- | --- | --- |
| `compraId` | id da compra | Liga todas as parcelas da mesma compra |
| `parcela` | 3 | Número desta parcela |
| `totalParcelas` | 10 | Quantas parcelas a compra tem |
| `valorTotal` | 3000 | Valor da compra inteira |

### Criação das parcelas

1. No formulário, "Parcelado" mostra o número de parcelas (2 a 48) e se o valor digitado é o **total**
   ou o **de cada parcela**.
2. Ao salvar, gravar todas as parcelas num `writeBatch` (todas ou nenhuma), com ids `{compraId}_{n}`.
3. 1ª parcela na data escolhida; as seguintes no mesmo dia dos meses seguintes (dia 31 → último dia do mês).
4. Centavos: R$ 100 em 3x = 33,33 + 33,33 + 33,34 (a diferença vai para a última parcela).

### Telas

- [ ] Lista e cards: "Notebook (3/10)" e selo com o número da parcela.
- [ ] Início: card "Parcelas dos próximos meses", com o valor já comprometido por mês.

### Editar e excluir

Perguntar **só esta parcela** ou **esta e as próximas**. Mudar o valor ou o número de parcelas recria
as parcelas que ainda não venceram; as vencidas ficam como estão.

### Casos especiais

- Compra lançada depois de algumas parcelas pagas: opção "começar da parcela N".
- Excluir a compra inteira pede confirmação mostrando quantas parcelas serão apagadas.
- Data da fatura do cartão fica fora da primeira versão (ver Decisões em aberto).

## v2.4 — Painel e metas

| Melhoria | O que faz | Esforço |
| --- | --- | --- |
| Comparação com o mês anterior | "+12% em Alimentação" nos cards e nas categorias do Início | P |
| Orçamento por categoria | Limite mensal por categoria, barra de progresso e alerta ao passar | M |
| Evolução em 6 meses | Gráfico de receitas × despesas dos últimos meses | M |
| Metas de economia | Objetivo (ex.: reserva de R$ 5.000) alimentado pelos lançamentos de Guardado | M |
| Exportar para planilha | Baixar as transações do mês em CSV | P |

Esforço: P = poucas horas, M = um ou dois dias, G = uma semana ou mais.

## Depois (sem versão definida)

- [x] Instalar no celular (PWA): ícone na tela inicial e abertura em tela cheia (feito junto com o logo novo, 12/11/2026).
- [ ] Subcategorias próprias, criadas numa tela de configurações (não no formulário, para os filtros continuarem confiáveis).
- [ ] Voltar a seção de Depoimentos na landing (hoje oculta com `hidden`) e o link no cabeçalho.

## Decisões em aberto

- [ ] Contas fixas: ficam em Meus Dados ou num item novo do menu ("Contas fixas")?
- [ ] Contas de valor variável: entram no saldo do mês como previstas, ou só depois de confirmadas?
- [ ] Compras parceladas: a data das parcelas segue a data da compra ou o vencimento da fatura do cartão?
- [ ] Receitas também podem ser recorrentes (ex.: salário todo dia 5) e parceladas (ex.: venda em 3x)?
      A proposta acima já permite os dois.
- [ ] Começar pelas contas fixas (v2.2) ou pelas compras parceladas (v2.3)?
