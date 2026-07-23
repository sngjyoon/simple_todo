(() => {
  "use strict";

  const STORE_KEY = "simple_todo_v1";
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // ---- state ----
  // tasks keyed by dateKey "YYYY-MM-DD"; someday split across someday1/2/3
  let store = load();
  migrate();
  let weekStart = mondayOf(new Date()); // Date of Monday for the visible week

  // move tasks from the old single "someday" list into the first someday column
  function migrate() {
    if (Array.isArray(store.someday)) {
      store.someday1 = (store.someday1 || []).concat(store.someday);
      delete store.someday;
      save();
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {}
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---- date helpers ----
  function mondayOf(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (x.getDay() + 6) % 7; // 0 = Monday
    x.setDate(x.getDate() - day);
    return x;
  }
  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }
  function keyOf(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  const todayKey = keyOf(new Date());

  function getList(key) {
    if (!store[key]) store[key] = [];
    return store[key];
  }

  // ---- rendering ----
  const grid = document.getElementById("grid");

  const WD_CLASS = ["wd1", "wd2", "wd3", "wd4", "wd5", "sat", "sun"];
  const SOMEDAY_KEYS = ["someday1", "someday2", "someday3"];

  function render() {
    // month title reflects the visible week (use month of Thursday to feel natural)
    const mid = addDays(weekStart, 3);
    document.getElementById("month-title").textContent = `${MONTHS[mid.getMonth()]} ${mid.getFullYear()}`;

    grid.innerHTML = "";

    // Mon-Fri span rows 1-2 (cols 1-5); Sat=col6/row1, Sun=col6/row2
    for (let i = 0; i < 7; i++) {
      const day = buildDay(addDays(weekStart, i), i);
      day.classList.add(WD_CLASS[i]);
      grid.appendChild(day);
    }

    // Row 3: Someday, full width, split into 3 columns
    grid.appendChild(buildSomeday());
  }

  function buildDay(date, dowIdx) {
    const key = keyOf(date);
    const wrap = document.createElement("div");
    wrap.className = "day" + (key === todayKey ? " is-today" : "");

    const head = document.createElement("div");
    head.className = "day-head";
    head.innerHTML =
      `<span class="date">${date.getDate()} ${MONTHS[date.getMonth()].slice(0,3)}</span>` +
      `<span class="dow">${DOW[dowIdx]}</span>`;
    wrap.appendChild(head);
    wrap.appendChild(buildBody(key));
    return wrap;
  }

  function buildSomeday() {
    const col = document.createElement("div");
    col.className = "someday";

    const head = document.createElement("div");
    head.className = "day-head someday-head";
    head.innerHTML = `<span class="date">Someday</span>`;
    col.appendChild(head);

    const cols = document.createElement("div");
    cols.className = "someday-cols";
    SOMEDAY_KEYS.forEach(key => {
      const c = document.createElement("div");
      c.className = "someday-col";
      c.appendChild(buildTaskList(key));
      c.appendChild(buildAddRow(key));
      const fill = document.createElement("div");
      fill.className = "fill";
      c.appendChild(fill);
      cols.appendChild(c);
    });
    col.appendChild(cols);
    return col;
  }

  // scrollable body: task list + add row + ruled-line filler
  function buildBody(key) {
    const body = document.createElement("div");
    body.className = "day-body";
    body.appendChild(buildTaskList(key));
    body.appendChild(buildAddRow(key));
    const fill = document.createElement("div");
    fill.className = "fill";
    body.appendChild(fill);
    return body;
  }

  function buildTaskList(key) {
    const ul = document.createElement("ul");
    ul.className = "tasks";
    ul.dataset.key = key;
    getList(key).forEach(t => ul.appendChild(buildTask(key, t)));
    return ul;
  }

  const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
  const PALETTE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 100 20c1.7 0 2-1.3 1.2-2.2-.8-1 .2-2.3 1.3-2.3H17a5 5 0 005-5c0-5-4.5-8.5-10-8.5z"/></svg>`;
  const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6"/></svg>`;

  function buildTask(key, t) {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "");
    li.dataset.id = t.id;
    if (t.color && t.color !== "none") li.dataset.color = t.color;

    const check = document.createElement("span");
    check.className = "check";
    check.innerHTML = CHECK_SVG;
    check.title = "Complete";
    check.addEventListener("click", (e) => { e.stopPropagation(); toggleDone(key, t.id); });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = t.text;
    text.addEventListener("click", (e) => { e.stopPropagation(); startEdit(li, key, t); });

    const actions = document.createElement("span");
    actions.className = "task-actions";

    const colorBtn = document.createElement("button");
    colorBtn.className = "icon-btn";
    colorBtn.innerHTML = PALETTE_SVG;
    colorBtn.title = "Color";
    colorBtn.addEventListener("click", (e) => { e.stopPropagation(); openColorPop(colorBtn, key, t.id); });

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn";
    delBtn.innerHTML = TRASH_SVG;
    delBtn.title = "Delete";
    delBtn.addEventListener("click", (e) => { e.stopPropagation(); removeTask(key, t.id); });

    actions.append(colorBtn, delBtn);
    li.append(check, text, actions);
    return li;
  }

  function buildAddRow(key) {
    const row = document.createElement("div");
    row.className = "add-row";
    const input = document.createElement("input");
    input.className = "add-input";
    input.type = "text";
    input.placeholder = "+ Add task";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        addTask(key, input.value.trim());
        input.value = "";
      } else if (e.key === "Escape") {
        input.value = "";
        input.blur();
      }
    });
    row.appendChild(input);
    return row;
  }

  // ---- inline editing ----
  function startEdit(li, key, t) {
    if (li.querySelector(".task-edit")) return;
    const text = li.querySelector(".task-text");
    const input = document.createElement("input");
    input.className = "task-edit";
    input.type = "text";
    input.value = t.text;
    text.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const commit = () => {
      const v = input.value.trim();
      if (v) { t.text = v; save(); }
      render();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { render(); }
    });
    input.addEventListener("blur", commit);
  }

  // ---- mutations ----
  function addTask(key, text) {
    getList(key).push({ id: uid(), text, done: false, color: "none" });
    save(); render();
  }
  function toggleDone(key, id) {
    const t = getList(key).find(x => x.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }
  function removeTask(key, id) {
    store[key] = getList(key).filter(x => x.id !== id);
    save(); render();
  }
  function setColor(key, id, color) {
    const t = getList(key).find(x => x.id === id);
    if (t) { t.color = color; save(); render(); }
  }

  // ---- color popover ----
  const pop = document.getElementById("color-pop");
  let popTarget = null;
  function openColorPop(btn, key, id) {
    popTarget = { key, id };
    pop.hidden = false;
    const r = btn.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    let left = r.left + window.scrollX;
    left = Math.min(left, window.scrollX + document.documentElement.clientWidth - pr.width - 8);
    pop.style.top = `${r.bottom + window.scrollY + 6}px`;
    pop.style.left = `${Math.max(8, left)}px`;
  }
  function closeColorPop() { pop.hidden = true; popTarget = null; }
  pop.querySelectorAll(".swatch").forEach(sw => {
    sw.addEventListener("click", () => {
      if (popTarget) setColor(popTarget.key, popTarget.id, sw.dataset.color);
      closeColorPop();
    });
  });
  document.addEventListener("click", (e) => {
    if (!pop.hidden && !pop.contains(e.target) && !e.target.closest(".icon-btn")) closeColorPop();
  });

  // ---- navigation ----
  document.getElementById("prev-btn").addEventListener("click", () => { weekStart = addDays(weekStart, -7); closeColorPop(); render(); });
  document.getElementById("next-btn").addEventListener("click", () => { weekStart = addDays(weekStart, 7); closeColorPop(); render(); });
  document.getElementById("today-btn").addEventListener("click", () => { weekStart = mondayOf(new Date()); closeColorPop(); render(); });

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") document.getElementById("prev-btn").click();
    else if (e.key === "ArrowRight") document.getElementById("next-btn").click();
  });

  render();
})();
