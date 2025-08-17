let a=document.querySelector('#submit');
let input_habit=document.querySelector('#habit');
let input_time=document.querySelector('#time');
let morningList=document.querySelector('#morningList');
let afternoonList=document.querySelector('#afternoonList');
let eveningList=document.querySelector('#eveningList');
let nightList=document.querySelector('#nightList');
let b=document.querySelector('#AddHabit');
let form=document.querySelector('form');
let cancelBtn=document.querySelector('#cancel8tn');
const calendarEl = document.getElementById("calendar");
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
let habitCompletion = {};
let completedDays = new Set();


function addHabit(event) {
  event.preventDefault();
  const habit = input_habit.value.trim();
  if (habit === '') return;
  const time = input_time.value;
  const hour = parseInt(time.split(':')[0]);
  let category = '';
  if (hour >= 4 && hour < 12) category = 'morning';
  else if (hour >= 12 && hour < 16) category = 'afternoon';
  else if (hour >= 16 && hour < 21) category = 'evening';
  else category = 'night';
  const li = document.createElement('li');
  li.style.display = 'flex';
  li.style.alignItems = 'center';
  li.style.justifyContent = 'space-between';
  li.style.gap = '10px';
  li.style.wordBreak = 'break-word'; 
  const habitWrapper = document.createElement('div');
  habitWrapper.style.display = 'flex';
  habitWrapper.style.alignItems = 'center';
  habitWrapper.style.gap = '8px';
  habitWrapper.style.flex = '1'; 
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('habit');
  checkbox.addEventListener('change', () => {
    checkHabits();
    updateProgress();
  });
  const newHabit = document.createElement('span');
  newHabit.textContent = habit;
  habitWrapper.appendChild(checkbox);
  habitWrapper.appendChild(newHabit);
  const cross_button = document.createElement('button');
  cross_button.textContent = '✖️';
  cross_button.classList.add('cross-button');
  cross_button.addEventListener('click', removeHabit);
  li.appendChild(habitWrapper);
  li.appendChild(cross_button);
  if (category === 'morning') morningList.appendChild(li);
  else if (category === 'afternoon') afternoonList.appendChild(li);
  else if (category === 'evening') eveningList.appendChild(li);
  else nightList.appendChild(li);
  if (!habitCompletion[habit]) habitCompletion[habit] = new Set();
  form.reset();
  overlay.style.display = "none";
  checkHabits();   
  updateProgress();
  renderHeatmap();
}

function removeHabit(event)
{
  const li = event.target.parentElement;
  const habitName = li.querySelector('span').textContent;
  delete habitCompletion[habitName];
  li.remove();
  checkHabits();
  updateProgress();
  renderHeatmap();
}

function checkHabits() 
{
  const todayKey = getDateKey(new Date());
  document.querySelectorAll("li").forEach(li => {
    const habitName = li.querySelector("span").textContent;
    const checkbox = li.querySelector("input.habit");
    if (!habitCompletion[habitName]) habitCompletion[habitName] = new Set();
    if (checkbox.checked) {
      habitCompletion[habitName].add(todayKey);
    } else {
      habitCompletion[habitName].delete(todayKey);
    }
  });
  const allHabits = Object.keys(habitCompletion);
  const allDone = allHabits.length > 0 &&
                  allHabits.every(h => habitCompletion[h].has(todayKey));
  if (allDone) completedDays.add(todayKey);
  else completedDays.delete(todayKey);
  renderCalendar(year, month);
  renderHeatmap();
}

document.querySelectorAll(".habit").forEach(habit => {
  habit.addEventListener("change", checkHabits);
});

function renderCalendar(year, month) 
{
  calendarEl.innerHTML = ""; 
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const header = document.createElement("h3");
  header.textContent = new Date(year, month).toLocaleString("default", { month: "long" }) + " " + year;
  calendarEl.appendChild(header);
  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement("div");
    const dateKey = getDateKey(new Date(year, month, d)); 
    day.textContent = d;
    if (completedDays.has(dateKey)) {
      day.classList.add("completed");
      day.textContent = "✔️";
    }
    grid.appendChild(day);
  }
  calendarEl.appendChild(grid);
}

function getDateKey(date)
{
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // 1-12
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderHeatmap()
{
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  Object.keys(habitCompletion).forEach(habit => {
    const row = document.createElement("div");
    row.classList.add("hm-row");
    const label = document.createElement("div");
    label.classList.add("hm-label");
    label.textContent = habit;
    row.appendChild(label);
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.classList.add("hm-cell");
      const dateKey = getDateKey(new Date(today.getFullYear(), today.getMonth(), d));
      if (habitCompletion[habit].has(dateKey)) {
        cell.classList.add("done");
      }
      row.appendChild(cell);
    }
    heatmap.appendChild(row);
  });
}

const circle = document.querySelector(".progress-ring__circle");
const text = document.getElementById("progress-text");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function updateProgress()
{
  const habits = document.querySelectorAll(".habit");
  const completed = document.querySelectorAll(".habit:checked").length;
  const total = habits.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  text.textContent = percent + "%";
}

document.querySelectorAll(".habit").forEach(habit => {
  habit.addEventListener("change", updateProgress);
});

updateProgress();
renderCalendar(year, month);
renderHeatmap();

const overlay = document.getElementById("overlay");
const addBtn = document.getElementById("AddHabit");

addBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
    form.reset();
    overlay.style.display = "none";
});

form.addEventListener('submit', addHabit);
a.addEventListener('click',addHabit);