# 📚 Sistema de Gestión de Biblioteca — Prototipo Académico

Este proyecto es un prototipo educativo desarrollado en JavaScript Vanilla que implementa un sistema de gestión de biblioteca.
Su objetivo es evidenciar el uso combinado de estructuras de datos lineales y no lineales, aplicadas en un contexto funcional y académico.

---

## 🎯 Objetivo académico

- Comprender el uso de arrays, colas, pilas y árboles binarios de búsqueda (ABB).

- Aplicar dichas estructuras en un proyecto funcional que simula la gestión de una biblioteca virtual.

- Integrar conceptos de DOM, eventos, almacenamiento local (localStorage) y organización jerárquica de datos.

---

## 🧩 Estructura del proyecto

<details>
<summary>Ver estructura</summary>

```text
📁 ACTIVIDAD-2
│
├── index.html
├── styles.css
├── main.js
│
└── src/
    ├── assets/
    ├── data/
    └── models/
        ├── users.js
        ├── books.js
        ├── loans.js
        ├──returns.js
        └──trees.js


```
</details> 
---

## 🧠 Estructuras de datos implementadas

### 1️⃣ Usuarios → Árbol Binario de Búsqueda (ABB)

- Indexa usuarios por su documento (docId).

- Permite búsquedas más eficientes que un recorrido lineal.

- Operaciones principales:

- Insertar nuevo usuario.

- Buscar usuario por documento.

- Actualizar o eliminar usuario del árbol.

✅ Estructura aplicada: Árbol binario de búsqueda.
📌 Justificación: mejora la eficiencia en búsquedas frecuentes al reducir la complejidad de O(n) a O(log n).

---

### 2️⃣ Libros → Árbol Binario de Búsqueda (ABB)

- Cada libro se indexa por su código ISBN.

- Las búsquedas por ISBN son más rápidas que con arrays tradicionales.

- Operaciones principales:

- Insertar libro.

- Buscar por ISBN.

- Modificar o eliminar libro en el árbol.

✅ Estructura aplicada: Árbol binario de búsqueda.
📌 Justificación: facilita búsquedas eficientes dentro de grandes catálogos.

---

### 3️⃣ Préstamos → Cola (FIFO)

- Representa las solicitudes de préstamo.

- Regla: First In, First Out.

- Se mantiene la misma lógica de la versión anterior.

✅ Estructura aplicada: Cola.

---

### 4️⃣ Devoluciones → Pila (LIFO)

- Guarda el historial de devoluciones, mostrando primero las más recientes.

✅ Estructura aplicada: Pila.

---

---

### 5️⃣ Usuarios y Libros (respaldo persistente) → Arrays

Se siguen utilizando arrays en localStorage para mantener persistencia de datos,
pero el árbol se genera dinámicamente en memoria cada vez que se actualiza el almacenamiento.

---

## 🖥️ Ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tuusuario/actividad-2-biblioteca.git

2. Abrir el archivo index.html en un navegador.

3. El sistema cargará por defecto:

 * 1 usuario de ejemplo

 * 2 libros de ejemplo


 ## Resumen

| Módulo           | Estructura usada                           | Justificación                                                        |
| ---------------- | ------------------------------------------ | --------------------------------------------------------------------|
| **Usuarios**     | Árbol Binario de Búsqueda (ABB)            | Búsqueda eficiente por documento.                                    |
| **Libros**       | Árbol Binario de Búsqueda (ABB)            | Optimiza búsquedas por ISBN.                                        |
| **Préstamos**    | Cola (FIFO)                                | Se atiende al primer usuario que solicita.                          |
| **Devoluciones** | Pila (LIFO)                                | Se muestran primero las devoluciones más recientes.                 |
| **Persistencia** | Arrays.                                    | Mantiene los datos almacenados en localStorage.                     |


👨‍🏫 Autor

Johan Cortes
📍 Bogotá, Colombia
Proyecto con fines académicos — Fundamentos de estructuras de datos.



