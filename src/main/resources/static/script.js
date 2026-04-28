let tasks = [];
let currentFilter = "all";

async function loadTasks() {
  try {
    const response = await fetch("/api/tarefas");
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    document.getElementById("emptyMessage").innerText = "Erro ao carregar tarefas.";
  }
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filters button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (filter === "all") document.getElementById("filterAll").classList.add("active");
  if (filter === "pending") document.getElementById("filterPending").classList.add("active");
  if (filter === "done") document.getElementById("filterDone").classList.add("active");

  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter(task => isLate(task.prazo, task.concluida));
  }

  if (currentFilter === "done") {
    return tasks.filter(task => task.concluida);
  }

  return tasks;
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyMessage");
  const filteredTasks = getFilteredTasks();

  list.innerHTML = "";

  const doneCount = tasks.filter(t => t.concluida).length;
  const lateCount = tasks.filter(t => isLate(t.prazo, t.concluida)).length;

  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("doneTasks").innerText = doneCount;
  document.getElementById("pendingTasks").innerText = lateCount;

  if (filteredTasks.length === 0) {
    empty.style.display = "block";
    empty.innerText = "Nenhuma anotação encontrada.";
    return;
  }

  empty.style.display = "none";

  filteredTasks.forEach(task => {
    const card = document.createElement("article");
    card.className = `note-card ${task.concluida ? "done" : ""} ${isLate(task.prazo, task.concluida) ? "late" : ""}`;

    card.innerHTML = `
      <div class="note-title">${escapeHtml(task.titulo)}</div>

      <span class="deadline ${isLate(task.prazo, task.concluida) ? "late" : ""}">
        ${task.prazo ? "Prazo: " + formatDate(task.prazo) : "Sem prazo"}
      </span>

      <div class="actions">
        <button class="done-btn" onclick="toggleTask(${task.id})">✓</button>
        <button class="edit-btn" onclick="editTask(${task.id})">✎</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">X</button>
      </div>
    `;

    list.appendChild(card);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const dataInput = document.getElementById("dataInput");
  const horaInput = document.getElementById("horaInput");

  const titulo = input.value.trim();
  const data = dataInput.value;
  const hora = horaInput.value;

  if (!titulo) {
    input.focus();
    return;
  }

  let prazo = "";

  if (data && hora) {
    prazo = `${data}T${hora}`;
  }

  await fetch("/api/tarefas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ titulo, prazo })
  });

  input.value = "";
  dataInput.value = "";
  horaInput.value = "";

  loadTasks();
}

async function toggleTask(id) {
  await fetch("/api/tarefas/" + id + "/alternar", {
    method: "PATCH"
  });

  loadTasks();
}

async function editTask(id) {
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  const novoTitulo = prompt("Editar anotação:", task.titulo);

  if (!novoTitulo || !novoTitulo.trim()) return;

  const prazoAtual = splitDateTime(task.prazo);

  const novaData = prompt("Nova data no formato AAAA-MM-DD:", prazoAtual.data);
  const novaHora = prompt("Nova hora no formato HH:MM:", prazoAtual.hora);

  let novoPrazo = task.prazo || "";

  if (novaData && novaHora) {
    novoPrazo = `${novaData}T${novaHora}`;
  }

  await fetch("/api/tarefas/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      titulo: novoTitulo.trim(),
      prazo: novoPrazo
    })
  });

  loadTasks();
}

async function deleteTask(id) {
  const confirmar = confirm("Deseja excluir esta anotação?");

  if (!confirmar) return;

  await fetch("/api/tarefas/" + id, {
    method: "DELETE"
  });

  loadTasks();
}

function formatDate(date) {
  if (!date) return "";

  const [datePart, timePart] = date.split("T");
  const [year, month, day] = datePart.split("-");

  return `${day}/${month}/${year} às ${timePart || "00:00"}`;
}

function splitDateTime(date) {
  if (!date) {
    return {
      data: "",
      hora: ""
    };
  }

  const [data, hora] = date.split("T");

  return {
    data: data || "",
    hora: hora || ""
  };
}

function isLate(date, done) {
  if (!date || done) return false;

  const now = new Date();
  const deadline = new Date(date);

  return deadline < now;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

document.getElementById("taskInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

document.getElementById("horaInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

loadTasks();