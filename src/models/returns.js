const LS_RETURNS = "returns_v1";
const LS_LOANS = "loans_v1";
const LS_USERS = "users_v1";
const LS_BOOKS = "books_v1";

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
function saveReturns(stack) {
  localStorage.setItem(LS_RETURNS, JSON.stringify(stack));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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

let stack = loadSafe(LS_RETURNS, []);

let form, feedback, selUser, selBook, stackBox;

export function initReturns() {
  form = document.getElementById("return-form");
  feedback = document.getElementById("return-feedback");
  selUser = document.getElementById("return-user");
  selBook = document.getElementById("return-book");
  stackBox = document.getElementById("return-stack");

  if (!form || !feedback || !selUser || !selBook || !stackBox) return;

  populateUsersFromActive();
  populateBooksForUser(selUser.value);

  form.addEventListener("submit", onReturnSubmit);
  selUser.addEventListener("change", () => populateBooksForUser(selUser.value));

  window.addEventListener("users:updated", () => {
    populateUsersFromActive();
    populateBooksForUser(selUser.value);
  });
  window.addEventListener("books:updated", () => {
    populateBooksForUser(selUser.value);
  });
  window.addEventListener("loans:updated", () => {
    populateUsersFromActive();
    populateBooksForUser(selUser.value);
    renderStack();
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#returns") {
      populateUsersFromActive();
      populateBooksForUser(selUser.value);
    }
  });

  renderStack();
}

function getActiveLoans() {
  const state = loadSafe(LS_LOANS, { queue: [], active: [] });
  return Array.isArray(state.active) ? state.active : [];
}
function setActiveLoans(nextActive, nextQueue = undefined) {
  const cur = loadSafe(LS_LOANS, { queue: [], active: [] });
  const state = {
    queue: nextQueue === undefined ? cur.queue : nextQueue,
    active: nextActive,
  };
  localStorage.setItem(LS_LOANS, JSON.stringify(state));
  window.dispatchEvent(new Event("loans:updated"));
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
  window.dispatchEvent(new Event("books:updated"));
}

function populateUsersFromActive() {
  const users = getUsers();
  const active = getActiveLoans();
  const userIdsConPrestamo = new Set(active.map((a) => a.userId));
  const lista = users.filter((u) => userIdsConPrestamo.has(u.id));

  const prev = selUser.value;
  selUser.innerHTML = lista
    .map(
      (u) =>
        `<option value="${u.id}">${esc(u.fullName)} — ${esc(u.docId)}</option>`
    )
    .join("");
  if (prev && lista.some((u) => u.id === prev)) selUser.value = prev;
}

function populateBooksForUser(userId) {
  const books = getBooks();
  const active = getActiveLoans().filter((a) => a.userId === userId);
  const uniq = [];
  const seen = new Set();
  for (const a of active) {
    if (!seen.has(a.bookId)) {
      const b = books.find((x) => x.id === a.bookId);
      if (b) uniq.push(b);
      seen.add(a.bookId);
    }
  }

  const prev = selBook.value;
  selBook.innerHTML = uniq
    .map(
      (b) => `<option value="${b.id}">${esc(b.title)} — ${esc(b.isbn)}</option>`
    )
    .join("");
  if (prev && uniq.some((b) => b.id === prev)) selBook.value = prev;
}

function onReturnSubmit(e) {
  e.preventDefault();
  clearFeedback();

  const userId = selUser.value;
  const bookId = selBook.value;
  if (!userId || !bookId) {
    feedback.textContent = "Selecciona usuario y libro";
    return;
  }

  const active = getActiveLoans();
  let idx = -1;
  let latestDate = -Infinity;
  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    if (a.userId === userId && a.bookId === bookId) {
      const t = Date.parse(a.loanDate || 0);
      if (t > latestDate) {
        latestDate = t;
        idx = i;
      }
    }
  }
  if (idx === -1) {
    feedback.textContent =
      "No se encontró un préstamo activo para esa combinación";
    return;
  }

  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) {
    feedback.textContent = "El libro ya no existe en el catálogo";
    return;
  }
  book.copiesAvailable = Math.min(
    book.copiesTotal,
    (book.copiesAvailable || 0) + 1
  );
  setBooks(books);

  active.splice(idx, 1);
  setActiveLoans(active);

  stack.unshift({
    id: uid(),
    userId,
    bookId,
    returnDate: new Date().toISOString(),
  });
  saveReturns(stack);

  renderStack();
  populateUsersFromActive();
  populateBooksForUser(selUser.value);

  feedback.textContent = "Devolucion registrada";
}

function renderStack() {
  if (!stack.length) {
    stackBox.innerHTML = `<div class="muted">Aun no hay devoluciones registradas</div>`;
    return;
  }
  const users = getUsers();
  const books = getBooks();
  stackBox.innerHTML = stack
    .map((r, i) => {
      const u = users.find((x) => x.id === r.userId);
      const b = books.find((x) => x.id === r.bookId);
      return `
      <div class="return-item ${i === 0 ? "top" : ""}">
        <div class="return-pos">${i === 0 ? "TOP" : i + 1}</div>
        <div>
          <div><strong>${esc(
            u?.fullName || "Usuario"
          )}</strong> devolvió <em>${esc(b?.title || "Libro")}</em></div>
          <div class="return-meta">${fmtDate(r.returnDate)}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

function clearFeedback() {
  feedback.textContent = "";
}
