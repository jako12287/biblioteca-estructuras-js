const LS_KEY = "users_v1";

let users = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

let form;
let feedback;
let searchInput;
let countSpan;
let tbody;

export function initUsers() {

  users = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

  form = document.getElementById("user-form");
  feedback = document.getElementById("user-feedback");
  searchInput = document.getElementById("user-search");
  countSpan = document.getElementById("user-count");
  tbody = document.getElementById("users-tbody");

  if (!form || !feedback || !searchInput || !countSpan || !tbody) return;

  form.addEventListener("submit", onCreate);
  searchInput.addEventListener("input", render);
  tbody.addEventListener("click", onTableClick);
  
  window.addEventListener("loans:updated", render);
  window.addEventListener("users:updated", () => {
    users = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    render();
  });

  render();
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent("users:updated", { detail: { count: users.length } }));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function hasActiveLoan(userId) {
  try {
    const raw = localStorage.getItem("loans_v1");
    if (!raw) return false;
    const { active = [] } = JSON.parse(raw) || {};
    return active.some(l => l.userId === userId);
  } catch {
    return false;
  }
}

function getFiltered() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) return users;
  return users.filter(u =>
    String(u.fullName || "").toLowerCase().includes(q) ||
    String(u.docId || "").toLowerCase().includes(q) ||
    String(u.email || "").toLowerCase().includes(q)
  );
}

function onCreate(e) {
  e.preventDefault();
  clearFeedback();

  const fullName = form.elements.fullName.value.trim();
  const docId = form.elements.docId.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();

  if (!fullName || !docId || !email) {
    feedback.textContent = "Completa todos los campos";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    feedback.textContent = "El email no es valido";
    return;
  }
  if (users.some(u => u.email === email)) {
    feedback.textContent = "Ese email ya existe";
    return;
  }
  if (users.some(u => u.docId === docId)) {
    feedback.textContent = "Ese documento ya existe";
    return;
  }

  users.unshift({ id: uid(), fullName, docId, email, active: true });
  save();
  form.reset();
  render();
}

function onTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") {
    const u = users.find(x => x.id === id);
    if (u) {
      u.active = !u.active;
      save();
      render();
    }
  } else if (action === "remove") {
    if (hasActiveLoan(id)) {
      alert("No puedes eliminar este usuario: tiene préstamo activo.");
      return;
    }
    if (confirm("¿Deseas eliminar este usuario?")) {
      users = users.filter(x => x.id !== id);
      save();
      render();
    }
  }
}

function render() {
  const list = getFiltered();
  countSpan.textContent = `${list.length} usuario(s)`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td class="muted" colspan="5">No hay usuarios para mostrar aun</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(u => {
    const bloqueado = hasActiveLoan(u.id);
    return `
      <tr>
        <td data-label="Nombre">${escapeHtml(u.fullName)}</td>
        <td data-label="Documento">${escapeHtml(u.docId)}</td>
        <td data-label="Email">${escapeHtml(u.email)}</td>
        <td data-label="Estado">
          <span class="badge ${u.active ? "ok" : "warn"}">${u.active ? "Activo" : "Inactivo"}</span>
        </td>
        <td data-label="Acciones">
          <div class="table-actions">
            <button class="btn" data-action="toggle" data-id="${u.id}">${u.active ? "Desactivar" : "Activar"}</button>
            ${
              bloqueado
                ? `<button class="btn btn-danger" disabled title="No disponible: tiene préstamo activo">Eliminar</button>`
                : `<button class="btn btn-danger" data-action="remove" data-id="${u.id}">Eliminar</button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function clearFeedback() {
  feedback.textContent = "";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
