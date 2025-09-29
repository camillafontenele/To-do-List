
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const weekDaysBar = document.getElementById("week-days");
const bigDayEl = document.getElementById("big-day");
const dayNameEl = document.getElementById("day-name");
const monthYearEl = document.getElementById("month-year");


const diasSemanaAbrev = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];


let currentDay = "";

//função que retorna a segunda-feira da semana da data fornecida
function getMonday(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Converte um objeto Date para uma string no formato YYYY-MM-DD considerando o fuso local  
function toLocalISODate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Renderiza os botões dos dias da semana
function renderWeekDays() {
  const hoje = new Date();
  const monday = getMonday(hoje);

  weekDaysBar.innerHTML = "";
// Cria botões para cada dia da semana
  for (let i = 0; i < 7; i++) {
    const data = new Date(monday);
    data.setDate(monday.getDate() + i);

    const label = diasSemanaAbrev[i];
    const numero = data.getDate();
    const iso = toLocalISODate(data);

    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.dataset.date = iso;
    btn.innerHTML = `
      <span class="dow">${label}</span>
      <span class="dom">${numero}</span>
    `;
    btn.onclick = () => selectDay(iso);

// Destaca o botão do dia atual
    const isToday = sameDate(data, hoje);
    if (isToday) btn.classList.add("active");

    weekDaysBar.appendChild(btn);
  }
}

// Verifica se duas datas são iguais (ano, mês, dia)
function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Seleciona um dia e atualiza a interface
function selectDay(dayIso) {
  currentDay = dayIso;

// Atualiza o estado ativo dos botões dos dias
  document.querySelectorAll(".week-days .day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.date === dayIso);
  });

// Atualiza a data no cabeçalho  
  const data = new Date(dayIso + "T00:00:00");
  updateHeaderDate(data);

  showTask();

  // Foca na caixa de entrada
inputBox.focus();
   

}
// Capitaliza a primeira letra de uma string
function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
// Atualiza a data exibida no cabeçalho
function updateHeaderDate(dateObj) {
  if (!bigDayEl || !dayNameEl || !monthYearEl) return;
  const dia = String(dateObj.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(dateObj);
  const monthShortRaw = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateObj);
  const monthShort = capitalizeFirst(monthShortRaw.replace(".", ""));
  const year = dateObj.getFullYear();
  
// Atualiza os elementos do DOM com a data formatada
  bigDayEl.textContent = dia;
  dayNameEl.textContent = capitalizeFirst(weekday);
  monthYearEl.textContent = `${monthShort}, ${year}`;
}
// Adiciona uma nova tarefa à lista
function AddTask() {
  if (inputBox.value.trim() === "") {
    alert("Você deve escrever algo!");
    return;
  }
// Cria os elementos da tarefa
  const li = document.createElement("li");
  const checkBtn = document.createElement("button");
  checkBtn.className = "check-btn";
  checkBtn.setAttribute("aria-label", "Concluir tarefa");

  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  textSpan.textContent = inputBox.value;

  const del = document.createElement("span");
  del.className = "delete-btn";
  del.innerHTML = "\u00d7";
// Adiciona os elementos à lista
  li.appendChild(checkBtn);
  li.appendChild(textSpan);
  li.appendChild(del);

  listContainer.appendChild(li);

  inputBox.value = "";
  inputBox.focus();
  saveData();
}
// Adiciona evento para adicionar tarefa ao clicar no botão
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") AddTask();
});

// Adiciona evento para manipular cliques na lista (concluir ou excluir tarefa)
listContainer.addEventListener(
  "click",
  (e) => {
    const target = e.target;
    const li = target.closest("li");
    if (!li) return;

    if (target.classList.contains("delete-btn") || target.textContent === "\u00d7") {
      li.remove();
      saveData();
      return;
    }

    if (
      target.classList.contains("check-btn") ||
      target.classList.contains("task-text") ||
      target.tagName === "LI"
    ) {
      li.classList.toggle("checked");
      saveData();
    }
  },
  false
);

// Salva os dados das tarefas no localStorage
function saveData() {
  if (!currentDay) return;
  const all = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  all[currentDay] = listContainer.innerHTML;
  localStorage.setItem("tasksByDay", JSON.stringify(all));
}
// Mostra as tarefas do dia selecionado
function showTask() {
  const all = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  listContainer.innerHTML = all[currentDay] || "";
  normalizeListItems();
}

// Inicializa a aplicação ao carregar a página
window.onload = () => {
  renderWeekDays();

  const today = new Date();
  const todayIso = toLocalISODate(today);
  updateHeaderDate(today);
  selectDay(todayIso);
  inputBox.focus();
};
// Normaliza os itens da lista para garantir a estrutura correta
function normalizeListItems() {
  //
  Array.from(listContainer.querySelectorAll("li")).forEach((li) => {
    
    if (li.querySelector(".check-btn") && li.querySelector(".task-text")) return;
// Extrai o texto da tarefa, removendo o símbolo de exclusão
    const text = li.textContent.replace("\u00d7", "").trim();
    li.innerHTML = "";
// Cria o botão de check
    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.setAttribute("aria-label", "Concluir tarefa");
// Cria o span para o texto da tarefa
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = text;
// Cria o botão de excluir
    const del = document.createElement("span");
    del.className = "delete-btn";
    del.innerHTML = "\u00d7";
// Adiciona os elementos ao item da lista
    li.appendChild(checkBtn);
    li.appendChild(textSpan);
    li.appendChild(del);
  });
}
