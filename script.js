
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const weekDaysBar = document.getElementById("week-days");
const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

let currentDay = "";


function getMonday(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0=Seg ... 6=Dom
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}


function renderWeekDays() {
  const hoje = new Date();
  const monday = getMonday(hoje);

  weekDaysBar.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const data = new Date(monday);
    data.setDate(monday.getDate() + i);

    const label = diasSemana[i];
    const numero = data.getDate();

    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.dataset.day = label;
    btn.innerHTML = `
      <span class="dow">${label}</span>
      <span class="dom">${numero}</span>
    `;
    btn.onclick = () => selectDay(label);

    
    const isToday = sameDate(data, hoje);
    if (isToday) btn.classList.add("active");

    weekDaysBar.appendChild(btn);
  }
}


function sameDate(a, b) {
  return (
    a.getDate() === b.getDate()
  );
}


function selectDay(day) {
  currentDay = day;

  
  document.querySelectorAll(".week-days .day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.day === day);
  });

  showTask();

  requestAnimationFrame(() => {
    inputBox.focus();
    const len = inputBox.value.length;
    inputBox.setSelectionRange(len, len);
  });

}


function AddTask() {
  if (inputBox.value.trim() === "") {
    alert("Você deve escrever algo!");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = inputBox.value;

  const span = document.createElement("span");
  span.innerHTML = "\u00d7";
  li.appendChild(span);

  listContainer.appendChild(li);

  inputBox.value = "";
  inputBox.focus();
  saveData();
}


inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") AddTask();
});


listContainer.addEventListener("click",(e) => {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      saveData();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
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
}


window.onload = () => {
  renderWeekDays();

 
  const today = new Date();
  const idx = (today.getDay() + 6) % 7;
  const labelHoje = diasSemana[idx];

  selectDay(labelHoje);
  inputBox.focus();
};

