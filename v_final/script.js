// ===== Constantes =====
const API_URL = "https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,region,population,currencies,cca3";
const POST_URL = "https://jsonplaceholder.typicode.com/posts";
const CHAVE_FAVORITOS = "favoritosPaises";
const CHAVE_TEMA = "modoEscuro";
const TRADUCAO_REGIAO = { Africa: "África", Americas: "Américas", Asia: "Ásia", Europe: "Europa", Oceania: "Oceania", Antarctic: "Antártida" };

// ===== Estado =====
let listaDePaises = []; // dados da API ficam neste array
let favoritosSalvos = lerLocalStorage(CHAVE_FAVORITOS, []);
let favoritos = Array.isArray(favoritosSalvos) ? favoritosSalvos.filter((f) => f && typeof f.codigo === "string") : [];

// ===== localStorage =====
// Lê um valor salvo; se não existir ou der erro, devolve o padrão
function lerLocalStorage(chave, padrao) {
  try {
    const texto = localStorage.getItem(chave);
    return texto ? JSON.parse(texto) : padrao;
  } catch (erro) {
    return padrao;
  }
}

function salvarLocalStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    // O site continua funcionando mesmo se o navegador bloquear o armazenamento.
  }
}

// ===== Modo escuro =====
function aplicarTema(escuro) {
  const botao = document.querySelector("#botaoTema");
  document.body.classList.toggle("escuro", escuro);
  botao.textContent = escuro ? "Modo claro" : "Modo escuro";
}

// ===== Operações matemáticas (TDE 01) =====
function somar(a, b) {
  return a + b;
}

function subtrair(a, b) {
  return a - b;
}

function multiplicar(a, b) {
  return a * b;
}

function dividir(a, b) {
  if (b === 0) {
    return "Divisão por zero não é permitida.";
  }
  return a / b;
}

// Recebe outra função como parâmetro (callback)
function calcular(a, b, operacao) {
  return operacao(a, b);
}

// Arrow functions que manipulam arrays
const calcularMedia = (numeros) =>
  numeros.length === 0 ? 0 : dividir(numeros.reduce((total, n) => somar(total, n), 0), numeros.length);
const filtrarPor = (lista, condicao) => lista.filter(condicao);
const formatarReais = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ===== Página Explorar =====
// Cria um parágrafo "Rótulo: valor" sem usar innerHTML
function criarInfo(rotulo, valor) {
  const paragrafo = document.createElement("p");
  paragrafo.textContent = rotulo + ": " + valor;
  return paragrafo;
}

// Nome do país em português (com alternativa em inglês)
function nomeDoPais(pais) {
  return pais.translations && pais.translations.por ? pais.translations.por.common : pais.name.common;
}

function ehFavorito(codigo) {
  return favoritos.find((f) => f.codigo === codigo) !== undefined;
}

// Marca ou desmarca um favorito e salva
function alternarFavorito(pais, botao) {
  if (ehFavorito(pais.cca3)) {
    favoritos = favoritos.filter((f) => f.codigo !== pais.cca3);
  } else {
    favoritos.push({
      codigo: pais.cca3,
      nome: nomeDoPais(pais),
      regiao: pais.region,
      populacao: pais.population,
    });
  }
  salvarLocalStorage(CHAVE_FAVORITOS, favoritos);
  atualizarBotaoFavorito(botao, ehFavorito(pais.cca3));
}

function atualizarBotaoFavorito(botao, marcado) {
  botao.classList.toggle("marcado", marcado);
  botao.textContent = marcado ? "Remover dos favoritos" : "Favoritar";
}

function criarCartao(pais) {
  const nome = nomeDoPais(pais);
  const cartao = document.createElement("article");
  cartao.className = "cartao";

  const figura = document.createElement("figure");
  const imagem = document.createElement("img");
  imagem.src = pais.flags.png;
  imagem.alt = pais.flags.alt || "Bandeira de " + nome;
  imagem.loading = "lazy";
  const legenda = document.createElement("figcaption");
  legenda.textContent = nome;
  figura.appendChild(imagem);
  figura.appendChild(legenda);

  const moedas = Object.values(pais.currencies || {}).map((m) => m.name);
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao";
  atualizarBotaoFavorito(botao, ehFavorito(pais.cca3));
  botao.addEventListener("click", () => alternarFavorito(pais, botao));

  cartao.appendChild(figura);
  cartao.appendChild(criarInfo("Capital", (pais.capital || ["Sem capital"])[0]));
  cartao.appendChild(criarInfo("Região", TRADUCAO_REGIAO[pais.region] || pais.region));
  cartao.appendChild(criarInfo("População", pais.population.toLocaleString("pt-BR")));
  cartao.appendChild(criarInfo("Moeda", moedas.length > 0 ? moedas.join(", ") : "Não informada"));
  cartao.appendChild(botao);
  return cartao;
}

// Desenha os cartões aplicando busca e filtro
function mostrarCartoes() {
  const lista = document.querySelector("#listaPaises");
  const mensagem = document.querySelector("#mensagem");
  const texto = document.querySelector("#busca").value.trim().toLowerCase();
  const regiao = document.querySelector("#filtroRegiao").value;

  const filtrados = listaDePaises.filter(
    (p) => nomeDoPais(p).toLowerCase().includes(texto) && (regiao === "todas" || p.region === regiao)
  );

  lista.textContent = "";
  filtrados.forEach((p) => lista.appendChild(criarCartao(p)));
  mensagem.textContent = filtrados.length === 0 ? "Nenhum país encontrado." : "";
}

// GET na API com tratamento de erro
async function carregarPaises() {
  const mensagem = document.querySelector("#mensagem");
  mensagem.textContent = "Carregando...";
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) {
      throw new Error("Erro HTTP " + resposta.status);
    }
    const dados = await resposta.json();
    // Ordena de A a Z pelo nome em português
    listaDePaises = dados.sort((a, b) => nomeDoPais(a).localeCompare(nomeDoPais(b), "pt-BR"));
    mostrarCartoes();
  } catch (erro) {
    mensagem.textContent = "Não foi possível carregar os países. Verifique sua conexão e recarregue a página.";
  }
}

function iniciarExplorar() {
  document.querySelector("#busca").addEventListener("input", mostrarCartoes);
  document.querySelector("#filtroRegiao").addEventListener("change", mostrarCartoes);
  carregarPaises();
}

// ===== Página Ferramentas =====
function adicionarItem(lista, texto) {
  const item = document.createElement("li");
  item.textContent = texto;
  lista.appendChild(item);
}

// Divide o custo da viagem usando as 4 operações e a função com callback
function calcularViagem() {
  const lista = document.querySelector("#resultadoCalculo");
  const campos = ["#passagens", "#diaria", "#noites", "#extras", "#orcamento", "#viajantes"];
  const valorDe = (id) => Number(document.querySelector(id).value);
  const camposInvalidos = campos.filter((id) => {
    const campo = document.querySelector(id);
    const valor = campo.value.trim();
    const minimo = id === "#noites" || id === "#viajantes" ? 1 : 0;
    const invalido = valor === "" || !Number.isFinite(Number(valor)) || Number(valor) < minimo;
    campo.classList.toggle("erro", invalido);
    return invalido;
  });
  if (camposInvalidos.length > 0) {
    lista.textContent = "Preencha todos os campos com valores válidos. Noites e viajantes devem ser pelo menos 1; os gastos não podem ser negativos.";
    return;
  }
  const viajantes = valorDe("#viajantes");

  const hospedagem = calcular(valorDe("#diaria"), valorDe("#noites"), multiplicar);
  const itens = [
    { nome: "Passagens", valor: valorDe("#passagens") },
    { nome: "Hospedagem", valor: hospedagem },
    { nome: "Alimentação e passeios", valor: valorDe("#extras") },
  ];
  const total = itens.reduce((soma, item) => calcular(soma, item.valor, somar), 0);
  const porPessoa = calcular(total, viajantes, dividir);
  const saldo = calcular(valorDe("#orcamento"), total, subtrair);
  const media = calcularMedia(itens.map((i) => i.valor));
  const acimaDaMedia = filtrarPor(itens, (i) => i.valor > media).map((i) => i.nome);

  lista.textContent = "";
  adicionarItem(lista, "Hospedagem (diária × noites): " + formatarReais(hospedagem));
  adicionarItem(lista, "Custo total da viagem: " + formatarReais(total));
  adicionarItem(lista, "Cada viajante paga: " + (typeof porPessoa === "string" ? porPessoa : formatarReais(porPessoa)));
  adicionarItem(lista, (saldo >= 0 ? "Sobra do orçamento: " : "Falta no orçamento: ") + formatarReais(Math.abs(saldo)));
  adicionarItem(lista, "Gastos acima da média: " + (acimaDaMedia.length > 0 ? acimaDaMedia.join(", ") : "nenhum"));
}

function mostrarEstatisticas() {
  const lista = document.querySelector("#listaEstatisticas");
  const campoMinimo = document.querySelector("#minimoPopulacao");
  const valorMinimo = campoMinimo.value.trim();
  const minimo = Number(valorMinimo) * 1000000;
  lista.textContent = "";
  const invalido = valorMinimo === "" || !Number.isFinite(minimo) || minimo < 0;
  campoMinimo.classList.toggle("erro", invalido);
  if (invalido) {
    adicionarItem(lista, "Informe um número válido, igual ou maior que zero.");
    return;
  }

  if (favoritos.length === 0) {
    adicionarItem(lista, "Nenhum favorito ainda. Marque países na página Explorar.");
    return;
  }

  const populacoes = favoritos.map((f) => f.populacao);
  const grandes = filtrarPor(favoritos, (f) => f.populacao >= minimo).map((f) => f.nome);
  adicionarItem(lista, "Total de destinos favoritos: " + favoritos.length);
  adicionarItem(lista, "População média: " + Math.round(calcularMedia(populacoes)).toLocaleString("pt-BR") + " habitantes");
  adicionarItem(lista, "Com população acima do mínimo: " + (grandes.length > 0 ? grandes.join(", ") : "nenhum"));

  // Conta quantos favoritos existem em cada região
  const porRegiao = favoritos.reduce((contagem, f) => {
    contagem[f.regiao] = (contagem[f.regiao] || 0) + 1;
    return contagem;
  }, {});
  Object.keys(porRegiao).forEach((regiao) => {
    adicionarItem(lista, (TRADUCAO_REGIAO[regiao] || regiao) + ": " + porRegiao[regiao]);
  });
}

function iniciarFerramentas() {
  document.querySelectorAll("#passagens, #diaria, #noites, #extras, #orcamento, #viajantes, #minimoPopulacao").forEach((campo) => {
    campo.addEventListener("input", () => campo.classList.remove("erro"));
  });
  // Função anônima no addEventListener
  document.querySelector("#botaoCalcular").addEventListener("click", function () {
    calcularViagem();
  });
  document.querySelector("#botaoEstatisticas").addEventListener("click", mostrarEstatisticas);
  calcularViagem();
  mostrarEstatisticas();
}

// ===== Página Contato =====
function iniciarContato() {
  const formulario = document.querySelector("#formContato");
  const resultado = document.querySelector("#resultadoEnvio");

  // Marca o campo com erro ao sair dele (evento blur)
  formulario.querySelectorAll("input, textarea").forEach((campo) => {
    campo.addEventListener("blur", () => campo.classList.toggle("erro", !campo.checkValidity()));
  });

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const dados = {
      title: document.querySelector("#nome").value,
      body: document.querySelector("#mensagemTexto").value,
      email: document.querySelector("#email").value,
      telefone: document.querySelector("#telefone").value,
      idade: Number(document.querySelector("#idade").value),
      userId: 1,
    };
    resultado.textContent = "Enviando...";
    try {
      const resposta = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!resposta.ok) {
        throw new Error("Erro HTTP " + resposta.status);
      }
      resultado.textContent = "Mensagem enviada com sucesso! Status: " + resposta.status;
      formulario.reset();
    } catch (erro) {
      resultado.textContent = "Não foi possível enviar a mensagem. Tente novamente.";
    }
  });
}

// ===== Inicialização =====
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(lerLocalStorage(CHAVE_TEMA, false));
  document.querySelector("#botaoTema").addEventListener("click", () => {
    const escuro = !document.body.classList.contains("escuro");
    aplicarTema(escuro);
    salvarLocalStorage(CHAVE_TEMA, escuro);
  });

  if (document.querySelector("#listaPaises")) { iniciarExplorar(); }
  if (document.querySelector("#botaoCalcular")) { iniciarFerramentas(); }
  if (document.querySelector("#formContato")) { iniciarContato(); }
});
