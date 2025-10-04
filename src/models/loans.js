const LS_LOANS = "loans_v1";
const LS_USERS = "users_v1";
const LS_BOOKS = "books_v1";

let queue = loadSafe(LS_LOANS, { queue: [], active: [] }).queue;
let active = loadSafe(LS_LOANS, { queue: [], active: [] }).active;

let form,
  feedback,
  selUser,
  selBook,
  queueBox,
  attendBtn,
  statusSpan,
  activeTbody;

export function initLoans() {
  form = document.getElementById("loan-form");
  feedback = document.getElementById("loan-feedback");
  selUser = document.getElementById("loan-user");
  selBook = document.getElementById("loan-book");
  queueBox = document.getElementById("loan-queue");
  attendBtn = document.getElementById("loan-attend");
  statusSpan = document.getElementById("loan-status");
  activeTbody = document.getElementById("loans-active-tbody");

  window.addEventListener("loans:updated", () => {
  const state = loadSafe(LS_LOANS, { queue: [], active: [] });
  queue = state.queue || [];
  active = state.active || [];
  renderQueue();
  renderActive();
});


  if (
    !form ||
    !feedback ||
    !selUser ||
    !selBook ||
    !queueBox ||
    !attendBtn ||
    !statusSpan ||
    !activeTbody
  )
    return;

  populateSelects();
  form.addEventListener("submit", onEnqueue);
  attendBtn.addEventListener("click", onAttendNext);

  renderQueue();
  renderActive();
}

function loadSafe(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data ?? fallback;
  } catch {
    return fallback;
  }
}
function saveLoans() {
  localStorage.setItem(LS_LOANS, JSON.stringify({ queue, active }));
  window.dispatchEvent(new Event("loans:updated"));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getUsers() {
  const arr = loadSafe(LS_USERS, []);
  return Array.isArray(arr) ? arr : [];
}
function getBooks() {
  const arr = loadSafe(LS_BOOKS, []);
  return Array.isArray(arr) ? arr : [];
}
function setBooks(newBooks) {
  localStorage.setItem(LS_BOOKS, JSON.stringify(newBooks));
}


function populateSelectsPreservandoSeleccion() {
  const prevUser = selUser.value;
  const prevBook = selBook.value;

  const users = getUsers().filter(u => u.active !== false); // solo activos
  const books = getBooks();

  selUser.innerHTML = users.map(u =>
    `<option value="${u.id}">${esc(u.fullName)} — ${esc(u.docId)}</option>`
  ).join("");

  selBook.innerHTML = books.map(b => {
    const disp = Number(b.copiesAvailable ?? 0);
    const label = `${esc(b.title)} — ${esc(b.isbn)}${disp === 0 ? " (0 disp.)" : ""}`;
    return `<option value="${b.id}">${label}</option>`;
  }).join("");

  if (prevUser && users.some(u => u.id === prevUser)) selUser.value = prevUser;
  if (prevBook && books.some(b => b.id === prevBook)) selBook.value = prevBook;
}

function populateSelects() {
  populateSelectsPreservandoSeleccion();
}


window.addEventListener("users:updated", () =>
  populateSelectsPreservandoSeleccion()
);
window.addEventListener("books:updated", () =>
  populateSelectsPreservandoSeleccion()
);

window.addEventListener("hashchange", () => {
  if (location.hash === "#loans") populateSelectsPreservandoSeleccion();
});
window.addEventListener("focus", () => {
  if (location.hash === "#loans") populateSelectsPreservandoSeleccion();
});

function onEnqueue(e) {
  e.preventDefault();
  clearFeedback();
  const userId = selUser.value;
  const bookId = selBook.value;
  if (!userId || !bookId) {
    feedback.textContent = "Selecciona usuario y libro";
    return;
  }
  queue.push({
    id: uid(),
    userId,
    bookId,
    createdAt: new Date().toISOString(),
  });
  saveLoans();
  renderQueue();
  statusSpan.textContent = `Solicitud agregada (${queue.length} en cola)`;
}

function onAttendNext() {
  clearFeedback();
  if (!queue.length) {
    statusSpan.textContent = "No hay solicitudes en cola.";
    return;
  }
  const next = queue[0];
  const users = getUsers();
  const books = getBooks();
  const book = books.find((b) => b.id === next.bookId);

  if (!book) {
    queue.shift();
    saveLoans();
    renderQueue();
    statusSpan.textContent = "Libro inexistente. Solicitud descartada";
    return;
  }
  if (book.copiesAvailable <= 0) {
    statusSpan.textContent = `Sin stock para "${book.title}". La solicitud permanece en la cola`;
    return;
  }

  book.copiesAvailable = Math.max(0, book.copiesAvailable - 1);
  setBooks(books);

  window.dispatchEvent(new Event("books:updated"));

  active.unshift({
    id: uid(),
    userId: next.userId,
    bookId: next.bookId,
    loanDate: new Date().toISOString(),
  });
  queue.shift();
  saveLoans();

  renderQueue();
  renderActive();
  statusSpan.textContent = "Préstamo registrado";
}

function renderQueue() {
  if (!queue.length) {
    queueBox.innerHTML = `<div class="muted">No hay solicitudes en cola</div>`;
    return;
  }
  const users = getUsers();
  const books = getBooks();

  queueBox.innerHTML = queue
    .map((q, idx) => {
      const u = users.find((x) => x.id === q.userId);
      const b = books.find((x) => x.id === q.bookId);
      const pos = idx + 1;
      return `
      <div class="loan-item ${idx === 0 ? "pending" : ""}">
        <div class="loan-pos">${pos}</div>
        <div>
          <div><strong>${esc(
            u?.fullName || "Usuario"
          )}</strong> solicita <em>${esc(b?.title || "Libro")}</em></div>
          <div class="loan-meta">${fmtDate(q.createdAt)}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderActive() {
  if (!active.length) {
    activeTbody.innerHTML = `<tr><td class="muted" colspan="3">No hay préstamos activos</td></tr>`;
    return;
  }
  const users = getUsers();
  const books = getBooks();

  activeTbody.innerHTML = active
    .map((l) => {
      const u = users.find((x) => x.id === l.userId);
      const b = books.find((x) => x.id === l.bookId);
      return `
      <tr>
        <td data-label="Usuario">${esc(u?.fullName || "Usuario")}</td>
        <td data-label="Libro">${esc(b?.title || "Libro")}</td>
        <td data-label="Fecha préstamo">${fmtDate(l.loanDate)}</td>
      </tr>
    `;
    })
    .join("");
}

function clearFeedback() {
  feedback.textContent = "";
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso || "";
  }
}
