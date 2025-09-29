
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const weekDaysBar = document.getElementById("week-days");
const bigDayEl = document.getElementById("big-day");
const dayNameEl = document.getElementById("day-name");
const monthYearEl = document.getElementById("month-year");

// Abreviações para exibição na barra semanal (segunda a domingo)
const diasSemanaAbrev = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

// ISO da data selecionada (yyyy-mm-dd)
let currentDay = "";


function getMonday(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toLocalISODate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


function renderWeekDays() {
  const hoje = new Date();
  const monday = getMonday(hoje);

  weekDaysBar.innerHTML = "";

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

    
    const isToday = sameDate(data, hoje);
    if (isToday) btn.classList.add("active");

    weekDaysBar.appendChild(btn);
  }
}


function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


function selectDay(dayIso) {
  currentDay = dayIso;

  // Atualiza estado visual na barra
  document.querySelectorAll(".week-days .day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.date === dayIso);
  });

  // Atualiza textos do header
  const data = new Date(dayIso + "T00:00:00");
  updateHeaderDate(data);

  showTask();

  requestAnimationFrame(() => {
    inputBox.focus();
    const len = inputBox.value.length;
    inputBox.setSelectionRange(len, len);
  });
}

function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function updateHeaderDate(dateObj) {
  if (!bigDayEl || !dayNameEl || !monthYearEl) return;
  const dia = String(dateObj.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(dateObj);
  const monthShortRaw = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateObj);
  const monthShort = capitalizeFirst(monthShortRaw.replace(".", ""));
  const year = dateObj.getFullYear();

  bigDayEl.textContent = dia;
  dayNameEl.textContent = capitalizeFirst(weekday);
  monthYearEl.textContent = `${monthShort}, ${year}`;
}

function AddTask() {
  if (inputBox.value.trim() === "") {
    alert("Você deve escrever algo!");
    return;
  }

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

  li.appendChild(checkBtn);
  li.appendChild(textSpan);
  li.appendChild(del);

  listContainer.appendChild(li);

  inputBox.value = "";
  inputBox.focus();
  saveData();
}
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") AddTask();
});


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


function saveData() {
  if (!currentDay) return;
  const all = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  all[currentDay] = listContainer.innerHTML;
  localStorage.setItem("tasksByDay", JSON.stringify(all));
}

function showTask() {
  const all = JSON.parse(localStorage.getItem("tasksByDay") || "{}");
  listContainer.innerHTML = all[currentDay] || "";
  normalizeListItems();
}


window.onload = () => {
  renderWeekDays();

  const today = new Date();
  const todayIso = toLocalISODate(today);
  updateHeaderDate(today);
  selectDay(todayIso);
  inputBox.focus();
};

function normalizeListItems() {
  
  Array.from(listContainer.querySelectorAll("li")).forEach((li) => {
    
    if (li.querySelector(".check-btn") && li.querySelector(".task-text")) return;

    const text = li.textContent.replace("\u00d7", "").trim();
    li.innerHTML = "";

    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.setAttribute("aria-label", "Concluir tarefa");

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = text;

    const del = document.createElement("span");
    del.className = "delete-btn";
    del.innerHTML = "\u00d7";

    li.appendChild(checkBtn);
    li.appendChild(textSpan);
    li.appendChild(del);
  });
}
