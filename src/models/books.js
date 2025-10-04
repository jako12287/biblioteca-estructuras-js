const LS_KEY = "books_v1";

function loadBooksSafe() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    localStorage.removeItem(LS_KEY);
    return [];
  }
}

let books = loadBooksSafe();

window.addEventListener("books:updated", ()=>{
    books = loadBooksSafe()
    render()
})

let form;
let feedback;
let searchInput;
let countSpan;
let tbody;

export function initBooks() {
  form = document.getElementById("book-form");
  feedback = document.getElementById("book-feedback");
  searchInput = document.getElementById("book-search");
  countSpan = document.getElementById("book-count");
  tbody = document.getElementById("books-tbody");

  if (!form || !feedback || !searchInput || !countSpan || !tbody) return;

  form.addEventListener("submit", onCreate);
  searchInput.addEventListener("input", render);
  tbody.addEventListener("click", onTableClick);

  render();
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(books));
  window.dispatchEvent(new CustomEvent("books:updated", { detail: { count: books.length } }));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getFiltered() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) return books;
  return books.filter((b) => {
    const t = String(b.title ?? "").toLowerCase();
    const a = String(b.author ?? "").toLowerCase();
    const i = String(b.isbn ?? "").toLowerCase();
    return t.includes(q) || a.includes(q) || i.includes(q);
  });
}

function onCreate(e) {
  e.preventDefault();
  clearFeedback();

  const title = form.elements.title.value.trim();
  const author = form.elements.author.value.trim();
  const isbn = form.elements.isbn.value.trim();
  const yearRaw = form.elements.year.value.trim();
  const genre = form.elements.genre.value.trim();
  const copiesTotalRaw = form.elements.copiesTotal.value.trim();

  if (!title || !author || !isbn) {
    feedback.textContent = "Título, Autor e ISBN son obligatorios.";
    return;
  }

  if (books.some((b) => b.isbn.toLowerCase() === isbn.toLowerCase())) {
    feedback.textContent = "Ese ISBN ya existe.";
    return;
  }

  const year = yearRaw ? Number(yearRaw) : null;
  const copiesTotal = Math.max(
    0,
    Number.isNaN(Number(copiesTotalRaw)) ? 0 : Number(copiesTotalRaw)
  );

  const book = {
    id: uid(),
    title,
    author,
    isbn,
    year,
    genre,
    copiesTotal,
    copiesAvailable: copiesTotal,
    createdAt: new Date().toISOString(),
  };

  books.unshift(book);
  save();
  form.reset();
  searchInput.value = "";
  render();
}

function onTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "inc") {
    const b = books.find((x) => x.id === id);
    if (!b) return;
    b.copiesTotal += 1;
    b.copiesAvailable += 1;
    save();
    render();
  } else if (action === "dec") {
    const b = books.find((x) => x.id === id);
    if (!b) return;
    if (b.copiesTotal > 0 && b.copiesAvailable > 0) {
      b.copiesTotal -= 1;
      b.copiesAvailable = Math.min(b.copiesAvailable - 1, b.copiesTotal);
      save();
      render();
    }
  } else if (action === "remove") {
    if (confirm("¿Eliminar este libro?")) {
      books = books.filter((x) => x.id !== id);
      save();
      render();
    }
  }
}

function render() {
  const list = getFiltered();
  countSpan.textContent = `${list.length} libro(s)`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td class="muted" colspan="8">No hay libros para mostrar.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (b) => `
    <tr>
      <td data-label="Título">${esc(b.title)}</td>
      <td data-label="Autor">${esc(b.author)}</td>
      <td data-label="ISBN">${esc(b.isbn)}</td>
      <td data-label="Año">${b.year ?? "-"}</td>
      <td data-label="Género">${esc(b.genre || "-")}</td>
      <td data-label="Copias">${b.copiesTotal}</td>
      <td data-label="Disponibles">
        <span class="badge-stock ${
          b.copiesAvailable <= Math.floor(b.copiesTotal * 0.4) ? "low" : "ok"
        }">
          ${b.copiesAvailable}
        </span>
      </td>
      <td data-label="Acciones">
        <div class="books-actions">
          <button class="btn" data-action="inc" data-id="${b.id}">+1</button>
          <button class="btn" data-action="dec" data-id="${b.id}">-1</button>
          <button class="btn btn-danger" data-action="remove" data-id="${
            b.id
          }">Eliminar</button>
        </div>
      </td>
    </tr>
  `
    )
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

export function getBooks() {
  return books.slice();
}
export function setCopiesAvailable(bookId, newVal) {
  const b = books.find((x) => x.id === bookId);
  if (!b) return;
  b.copiesAvailable = Math.max(0, Math.min(newVal, b.copiesTotal));
  save();
  render();
}
