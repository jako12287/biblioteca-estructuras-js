function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function seedDefaults() {
  const UKEY = "users_v1";
  const BKEY = "books_v1";

  try {
    const uRaw = localStorage.getItem(UKEY);
    const uArr = uRaw ? JSON.parse(uRaw) : [];
    if (!Array.isArray(uArr) || uArr.length === 0) {
      const users = [
        {
          id: uid(),
          fullName: "Johan Cortes",
          docId: "100200300",
          email: "johan.cortes@uni.edu",
          active: true,
        },
      ];
      localStorage.setItem(UKEY, JSON.stringify(users));
      window.dispatchEvent(
        new CustomEvent("users:updated", { detail: { count: users.length } })
      );
    }
  } catch {
    const users = [
      {
          id: uid(),
          fullName: "Johan Cortes",
          docId: "100200300",
          email: "johan.cortes@uni.edu",
          active: true,
        },
    ];
    localStorage.setItem(UKEY, JSON.stringify(users));
    window.dispatchEvent(
      new CustomEvent("users:updated", { detail: { count: users.length } })
    );
  }

  try {
    const bRaw = localStorage.getItem(BKEY);
    const bArr = bRaw ? JSON.parse(bRaw) : [];
    if (!Array.isArray(bArr) || bArr.length === 0) {
      const now = new Date().toISOString();
      const books = [
        {
          id: uid(),
          title: "Estructuras de Datos en JS",
          author: "A. Romero",
          isbn: "ISBN-001",
          year: 2022,
          genre: "Computación",
          copiesTotal: 3,
          copiesAvailable: 3,
          createdAt: now,
        },
        {
          id: uid(),
          title: "Algoritmos y Programación",
          author: "G. Ayala",
          isbn: "ISBN-002",
          year: 2020,
          genre: "Computación",
          copiesTotal: 2,
          copiesAvailable: 2,
          createdAt: now,
        },
      ];
      localStorage.setItem(BKEY, JSON.stringify(books));
      window.dispatchEvent(
        new CustomEvent("books:updated", { detail: { count: books.length } })
      );
    }
  } catch {
    const now = new Date().toISOString();
    const books = [
      {
        id: uid(),
        title: "Estructuras de Datos en JS",
        author: "A. Romero",
        isbn: "ISBN-001",
        year: 2022,
        genre: "Computación",
        copiesTotal: 3,
        copiesAvailable: 3,
        createdAt: now,
      },
      {
        id: uid(),
        title: "Algoritmos y Programación",
        author: "G. Ayala",
        isbn: "ISBN-002",
        year: 2020,
        genre: "Computación",
        copiesTotal: 2,
        copiesAvailable: 2,
        createdAt: now,
      },
    ];
    localStorage.setItem(BKEY, JSON.stringify(books));
    window.dispatchEvent(
      new CustomEvent("books:updated", { detail: { count: books.length } })
    );
  }
}
