# Mundo em Viagem

**Tema:** países e viagens: catálogo de países com destinos favoritos e divisão do custo da viagem.
**Site publicado:** (preencher com o link publicado no GitHub Pages)

## Integrantes e contribuições
| Integrante | O que fez |
|---|---|
| (nome do integrante) | (descrever contribuição real) |
| (nome do integrante) | (descrever contribuição real) |
| (nome do integrante) | (descrever contribuição real) |

## API usada
- GET `https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,region,population,currencies,cca3` (página Explorar; a API exige o parâmetro `fields` neste endpoint)
- POST `https://jsonplaceholder.typicode.com/posts` (página Contato, retorna status 201)

## TDE 01 · Funções em JS
Ferramenta: **dividir o custo da viagem entre os viajantes** (página Ferramentas).

| Função | Recebe | Devolve | Onde é usada |
|---|---|---|---|
| `somar(a, b)` | dois números | a + b | total da viagem; `calcularMedia` |
| `subtrair(a, b)` | dois números | a − b | sobra ou falta do orçamento |
| `multiplicar(a, b)` | dois números | a × b | hospedagem (diária × noites) |
| `dividir(a, b)` | dois números | a ÷ b, ou mensagem se b for 0 | valor por viajante; `calcularMedia` |
| `calcular(a, b, operacao)` | dois números e uma função (**callback**) | resultado da operação | `calcularViagem` (chamada com `somar`, `dividir`, `multiplicar`, `subtrair`) |
| `calcularViagem()` | nada (lê os campos) | nada (escreve o resultado na tela) | botão Calcular |
| `calcularMedia(numeros)` (arrow) | array de números | média | gastos da viagem; população dos favoritos |
| `filtrarPor(lista, condicao)` (arrow) | array e uma função de condição (callback) | novo array filtrado | gastos acima da média; países com muita população |
| `formatarReais(valor)` (arrow) | número | texto em R$ | resultados da calculadora |
| `function () {...}` anônima | evento de clique | nada | `addEventListener` do botão Calcular |

## TDE 02 · Debugging

**Importante:** os problemas abaixo foram identificados durante a revisão do código entregue. Para cumprir integralmente o TDE, o grupo deve registrar a investigação real realizada no DevTools, incluindo mensagens/sintomas, prints e evidências. Não afirmem que usaram breakpoint, Scope/Watch ou Network sem realizar e capturar essas etapas.

### Bug 1 — Divisão do custo por zero viajantes (lógica)
- **Sintoma:** o campo de viajantes permitia valor `0`; ao calcular, a função de divisão retornava uma mensagem, mas os demais resultados continuavam sendo exibidos.
- **Identificação:** revisão do campo `#viajantes` e do fluxo da função `calcularViagem()`.
- **Antes:** `min="0"` e cálculo prosseguia mesmo com zero viajantes.
- **Depois:** o campo exige mínimo de 1 e a função valida todos os valores antes de calcular; se inválidos, mostra mensagem e interrompe.
- **Evidência DevTools:** (adicionar print do teste com 0 viajantes e, se solicitado, breakpoint/Scope ou Watch).

### Bug 2 — Valores negativos nos custos
- **Sintoma:** apesar dos atributos `min` nos inputs, era possível digitar valores negativos e acionar o cálculo, produzindo total/saldo incoerentes.
- **Identificação:** teste manual dos campos de custo com valores negativos.
- **Antes:** os valores eram convertidos com `Number()` e usados diretamente nas operações.
- **Depois:** validação JavaScript verifica valores vazios, não numéricos e negativos; campos inválidos recebem a classe `.erro` e o cálculo é interrompido.
- **Evidência DevTools:** (adicionar print do teste e da validação).

### Bug 3 — Dados inesperados no Local Storage
- **Sintoma:** se a chave de favoritos contivesse JSON válido, mas não um array, o código poderia falhar ao usar métodos de array.
- **Identificação:** revisão/teste da chave `favoritosPaises` no Application → Local Storage.
- **Antes:** o valor parseado era usado diretamente como `favoritos`.
- **Depois:** o código verifica `Array.isArray()` e mantém apenas itens com código de país válido.
- **Evidência DevTools:** (adicionar print do teste com valor inválido no Local Storage).

### Evidências obrigatórias a completar pelo grupo
- [ ] Pelo menos 1 print do código pausado em breakpoint com Scope ou Watch visível.
- [ ] Pelo menos 1 investigação de requisição na aba Network (registrar a falha real observada, status/URL e correção; não inventar uma falha).
- [ ] Confirmar os sintomas e as ferramentas realmente usadas nos três registros acima e ajustar a descrição, se necessário.

