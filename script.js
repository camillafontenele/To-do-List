
const caixaEntrada = document.getElementById("caixa-entrada");
const listaTarefas = document.getElementById("lista-tarefas");
const barraDiasSemana = document.getElementById("dias-semana");
const diaGrandeEl = document.getElementById("dia-grande");
const nomeDiaEl = document.getElementById("nome-dia");
const mesAnoEl = document.getElementById("mes-ano");
const botaoAdicionar = document.querySelector(".linha button");


const diasSemanaAbrev = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];


let diaAtualIso = "";

//função que retorna a segunda-feira da semana da data fornecida
function obterSegundaFeira(d) {
  const data = new Date(d);
  const diaSemana = (data.getDay() + 6) % 7;
  data.setDate(data.getDate() - diaSemana);
  data.setHours(0, 0, 0, 0);
  return data;
}

// Converte um objeto Date para uma string no formato YYYY-MM-DD considerando o fuso local  
function paraDataLocalISO(objData) {
  const ano = objData.getFullYear();
  const mes = String(objData.getMonth() + 1).padStart(2, "0");
  const dia = String(objData.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Renderiza os botões dos dias da semana
function renderizarDiasSemana() {
  const hoje = new Date();
  const segunda = obterSegundaFeira(hoje);

  barraDiasSemana.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + i);

    const rotulo = diasSemanaAbrev[i];
    const numero = data.getDate();
    const iso = paraDataLocalISO(data);

    const botao = document.createElement("button");
    botao.className = "botao-dia";
    botao.dataset.date = iso;
    botao.innerHTML = `
      <span class="sigla-dia">${rotulo}</span>
      <span class="numero-dia">${numero}</span>
    `;
    botao.onclick = () => selecionarDia(iso);

    const ehHoje = datasIguais(data, hoje);
    if (ehHoje) botao.classList.add("ativo");

    barraDiasSemana.appendChild(botao);
  }
}

// Verifica se duas datas são iguais (ano, mês, dia)
function datasIguais(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Verifica se um dia (YYYY-MM-DD) já passou em relação a hoje
function diaSelecionadoJaPassou(diaIso) {
  const hojeIso = paraDataLocalISO(new Date());
  return diaIso < hojeIso; // formato YYYY-MM-DD permite comparação lexicográfica
}

// Atualiza o estado de habilitado/desabilitado do input e botão
function atualizarEstadoControles(diaIso) {
  const desabilitar = diaSelecionadoJaPassou(diaIso);
  if (caixaEntrada) caixaEntrada.disabled = desabilitar;
  if (botaoAdicionar) botaoAdicionar.disabled = desabilitar;
  if (caixaEntrada) {
    caixaEntrada.placeholder = desabilitar
      ? "Dia passado — não é possível adicionar tarefas"
      : "Adicione uma nova tarefa...";
  }
  return desabilitar;
}

// Seleciona um dia e atualiza a interface
function selecionarDia(diaIso) {
  diaAtualIso = diaIso;

  document.querySelectorAll(".dias-semana .botao-dia").forEach((btn) => {
    btn.classList.toggle("ativo", btn.dataset.date === diaIso);
  });

  const data = new Date(diaIso + "T00:00:00");
  atualizarCabecalhoData(data);

  mostrarTarefas();

  const desabilitado = atualizarEstadoControles(diaIso);

  if (!desabilitado) {
    caixaEntrada.focus();
  } else {
    caixaEntrada.blur();
  }
}
// Capitaliza a primeira letra de uma string
function capitalizarPrimeira(texto) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
// Atualiza a data exibida no cabeçalho
function atualizarCabecalhoData(objData) {
  if (!diaGrandeEl || !nomeDiaEl || !mesAnoEl) return;
  const dia = String(objData.getDate()).padStart(2, "0");
  const nomeSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(objData);
  const mesCurtoBruto = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(objData);
  const mesCurto = capitalizarPrimeira(mesCurtoBruto.replace(".", ""));
  const ano = objData.getFullYear();

  diaGrandeEl.textContent = dia;
  nomeDiaEl.textContent = capitalizarPrimeira(nomeSemana);
  mesAnoEl.textContent = `${mesCurto}, ${ano}`;
}
// Adiciona uma nova tarefa à lista
function adicionarTarefa() {
  if ((caixaEntrada && caixaEntrada.disabled) || (botaoAdicionar && botaoAdicionar.disabled)) {
    return;
  }
  if (caixaEntrada.value.trim() === "") {
    alert("Você deve escrever algo!");
    return;
  }
  const li = document.createElement("li");
  const botaoChecar = document.createElement("button");
  botaoChecar.className = "botao-checar";
  botaoChecar.setAttribute("aria-label", "Concluir tarefa");

  const spanTexto = document.createElement("span");
  spanTexto.className = "texto-tarefa";
  spanTexto.textContent = caixaEntrada.value;

  const botaoExcluir = document.createElement("span");
  botaoExcluir.className = "botao-excluir";
  botaoExcluir.innerHTML = "\u00d7";

  li.appendChild(botaoChecar);
  li.appendChild(spanTexto);
  li.appendChild(botaoExcluir);

  listaTarefas.appendChild(li);

  caixaEntrada.value = "";
  caixaEntrada.focus();
  salvarDados();
}
// Adiciona evento para adicionar tarefa ao clicar no botão
caixaEntrada.addEventListener("keypress", (e) => {
  if (caixaEntrada.disabled) return;
  if (e.key === "Enter") adicionarTarefa();
});

// Adiciona evento para manipular cliques na lista (concluir ou excluir tarefa)
listaTarefas.addEventListener(
  "click",
  (e) => {
    const target = e.target;
    const li = target.closest("li");
    if (!li) return;

    if (target.classList.contains("botao-excluir") || target.textContent === "\u00d7") {
      li.remove();
      salvarDados();
      return;
    }

    if (
      target.classList.contains("botao-checar") ||
      target.classList.contains("texto-tarefa") ||
      target.tagName === "LI"
    ) {
      li.classList.toggle("concluida");
      salvarDados();
    }
  },
  false
);

// Salva os dados das tarefas no localStorage
function salvarDados() {
  if (!diaAtualIso) return;
  const novos = JSON.parse(localStorage.getItem("tarefasPorDia") || "{}");
  const antigos = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  novos[diaAtualIso] = listaTarefas.innerHTML;
  antigos[diaAtualIso] = listaTarefas.innerHTML;
  localStorage.setItem("tarefasPorDia", JSON.stringify(novos));
  localStorage.setItem("tasksByDay", JSON.stringify(antigos));
}
// Mostra as tarefas do dia selecionado
function mostrarTarefas() {
  const novos = JSON.parse(localStorage.getItem("tarefasPorDia") || "{}");
  const antigos = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  const html = (novos[diaAtualIso] ?? antigos[diaAtualIso] ?? "");
  listaTarefas.innerHTML = html;
  normalizarItensLista();
}

// Inicializa a aplicação ao carregar a página
window.onload = () => {
  renderizarDiasSemana();

  const hoje = new Date();
  const hojeIso = paraDataLocalISO(hoje);
  atualizarCabecalhoData(hoje);
  selecionarDia(hojeIso);
  caixaEntrada.focus();
};
// Normaliza os itens da lista para garantir a estrutura correta
function normalizarItensLista() {
  Array.from(listaTarefas.querySelectorAll("li")).forEach((li) => {
    if (li.querySelector(".botao-checar") && li.querySelector(".texto-tarefa")) return;
    const texto = li.textContent.replace("\u00d7", "").trim();
    li.innerHTML = "";
    const botaoChecar = document.createElement("button");
    botaoChecar.className = "botao-checar";
    botaoChecar.setAttribute("aria-label", "Concluir tarefa");
    const spanTexto = document.createElement("span");
    spanTexto.className = "texto-tarefa";
    spanTexto.textContent = texto;
    const botaoExcluir = document.createElement("span");
    botaoExcluir.className = "botao-excluir";
    botaoExcluir.innerHTML = "\u00d7";
    li.appendChild(botaoChecar);
    li.appendChild(spanTexto);
    li.appendChild(botaoExcluir);
  });
}
