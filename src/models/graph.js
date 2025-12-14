const LS_GRAPH = "graph_v1";
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

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function nodeKey(type, id) {
  return `${type}:${id}`;
}

function nowIso() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    nodes: {},
    adj: {},
  };
}

export function graphLoad() {
  const state = loadSafe(LS_GRAPH, defaultState());
  if (!state || typeof state !== "object") return defaultState();
  if (!state.nodes || !state.adj) return defaultState();
  return state;
}

export function graphSave(state) {
  save(LS_GRAPH, state);
  window.dispatchEvent(new Event("graph:updated"));
}

export function graphAddNode(type, id) {
  const state = graphLoad();
  const k = nodeKey(type, id);
  if (!state.nodes[k]) {
    state.nodes[k] = { type, id, createdAt: nowIso() };
    if (!state.adj[k]) state.adj[k] = {};
    graphSave(state);
  }
  return k;
}

export function graphHasNode(type, id) {
  const state = graphLoad();
  return Boolean(state.nodes[nodeKey(type, id)]);
}

export function graphRemoveNode(type, id) {
  const state = graphLoad();
  const k = nodeKey(type, id);

  if (!state.nodes[k]) return;

  delete state.adj[k];
  for (const from of Object.keys(state.adj)) {
    if (state.adj[from] && state.adj[from][k]) {
      delete state.adj[from][k];
    }
  }
  delete state.nodes[k];

  graphSave(state);
}

export function graphAddEdge(fromType, fromId, toType, toId, meta) {
  const state = graphLoad();
  const fromK = nodeKey(fromType, fromId);
  const toK = nodeKey(toType, toId);

  if (!state.nodes[fromK])
    state.nodes[fromK] = { type: fromType, id: fromId, createdAt: nowIso() };
  if (!state.nodes[toK])
    state.nodes[toK] = { type: toType, id: toId, createdAt: nowIso() };

  if (!state.adj[fromK]) state.adj[fromK] = {};

  const edge = state.adj[fromK][toK] || {
    weight: 0,
    lastType: null,
    lastAt: null,
  };
  edge.weight += 1;
  edge.lastType = meta?.type || "INTERACTION";
  edge.lastAt = meta?.at || nowIso();

  state.adj[fromK][toK] = edge;

  graphSave(state);
  return edge;
}

export function graphGetEdge(fromType, fromId, toType, toId) {
  const state = graphLoad();
  const fromK = nodeKey(fromType, fromId);
  const toK = nodeKey(toType, toId);
  return state.adj[fromK]?.[toK] || null;
}

export function graphRemoveEdge(fromType, fromId, toType, toId) {
  const state = graphLoad();
  const fromK = nodeKey(fromType, fromId);
  const toK = nodeKey(toType, toId);

  if (state.adj[fromK] && state.adj[fromK][toK]) {
    delete state.adj[fromK][toK];
    graphSave(state);
  }
}

export function graphNeighbors(type, id) {
  const state = graphLoad();
  const k = nodeKey(type, id);
  const out = state.adj[k] || {};
  return Object.entries(out).map(([toK, edge]) => ({ toK, edge }));
}

export function graphTopBooksForUser(userId, k = 5) {
  const neigh = graphNeighbors("USER", userId)
    .filter((x) => x.toK.startsWith("BOOK:"))
    .sort(
      (a, b) =>
        b.edge.weight - a.edge.weight ||
        String(b.edge.lastAt).localeCompare(String(a.edge.lastAt))
    );

  return neigh.slice(0, k).map((x) => ({
    bookId: x.toK.split(":")[1],
    weight: x.edge.weight,
    lastAt: x.edge.lastAt,
    lastType: x.edge.lastType,
  }));
}

export function graphMostPopularBooks(k = 5) {
  const state = graphLoad();
  const totals = new Map(); // bookKey -> weight

  for (const fromK of Object.keys(state.adj)) {
    const out = state.adj[fromK] || {};
    for (const [toK, edge] of Object.entries(out)) {
      if (!toK.startsWith("BOOK:")) continue;
      totals.set(toK, (totals.get(toK) || 0) + (edge.weight || 0));
    }
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([bookK, weight]) => ({ bookId: bookK.split(":")[1], weight }));
}

export function graphSyncWithCatalog() {
  const users = loadSafe(LS_USERS, []);
  const books = loadSafe(LS_BOOKS, []);

  const userIds = new Set(Array.isArray(users) ? users.map((u) => u.id) : []);
  const bookIds = new Set(Array.isArray(books) ? books.map((b) => b.id) : []);

  const state = graphLoad();

  for (const k of Object.keys(state.nodes)) {
    if (k.startsWith("USER:")) {
      const id = k.split(":")[1];
      if (!userIds.has(id)) graphRemoveNode("USER", id);
    } else if (k.startsWith("BOOK:")) {
      const id = k.split(":")[1];
      if (!bookIds.has(id)) graphRemoveNode("BOOK", id);
    }
  }
}
