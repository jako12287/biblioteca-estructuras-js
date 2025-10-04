# 📚 Sistema de Gestión de Biblioteca — Prototipo Académico

Este proyecto es un **prototipo educativo** desarrollado en **JavaScript Vanilla** que implementa un **sistema de gestión de biblioteca**.  
Su objetivo es **evidenciar el uso de estructuras de datos lineales** (arrays, colas y pilas) dentro de un caso práctico.

---

## 🎯 Objetivo académico

- Comprender el uso de **arrays, colas y pilas** como estructuras de datos.  
- Aplicarlas en un **proyecto funcional** que simula un sistema de biblioteca.  
- Integrar conceptos de **DOM**, **eventos** y **almacenamiento local (`localStorage`)** para mostrar cómo se gestionan los datos en un entorno realista.

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
    └── models/
        ├── users.js
        ├── books.js
        ├── loans.js
        └── returns.js

</details> ```
---

## 🧠 Estructuras de datos implementadas

### 1️⃣ **Usuarios → Array**
- Se utiliza un **array** para almacenar la lista de usuarios.
- Cada usuario es un objeto con:  
  `{ id, fullName, docId, email, active }`.
- Operaciones principales:
  - **Insertar** un usuario (`unshift`)
  - **Buscar** usuarios (filtro con `filter`)
  - **Actualizar** estado (activar/desactivar)
  - **Eliminar** usuarios del array (`filter`)

✅ **Estructura aplicada:** **Array dinámico**.  
📌 Justificación: permite manejar de forma flexible listas de usuarios con operaciones de inserción, búsqueda y eliminación.

---

### 2️⃣ **Libros → Array**
- Se guarda en un **array**.
- Cada libro contiene:  
  `{ id, title, author, isbn, year, genre, copiesTotal, copiesAvailable }`.
- Operaciones principales:
  - **Insertar** libros
  - **Buscar** por título, autor o ISBN
  - **Modificar stock** (`copiesTotal` y `copiesAvailable`)
  - **Eliminar** libros

✅ **Estructura aplicada:** **Array**.  
📌 Justificación: los libros representan un inventario en el que es fácil agregar, modificar o eliminar registros.

---

### 3️⃣ **Préstamos → Cola (FIFO)**
- La cola representa las solicitudes de préstamo de libros.  
- **Regla:** el primero que solicita es el primero en ser atendido (**First In, First Out**).
- Operaciones principales:
  - **Encolar** solicitud (`push`)
  - **Atender préstamo** (`shift`)
  - Validar stock de libros antes de aprobar préstamo.

✅ **Estructura aplicada:** **Cola (FIFO)**.  
📌 Justificación: refleja la lógica real de atender solicitudes en el orden de llegada.

---

### 4️⃣ **Devoluciones → Pila (LIFO)**
- La pila guarda el historial de devoluciones.  
- **Regla:** la devolución más reciente se muestra primero (**Last In, First Out**).
- Operaciones principales:
  - **Apilar devolución** (`push`)
  - **Mostrar devoluciones recientes** (últimos en la pila)

✅ **Estructura aplicada:** **Pila (LIFO)**.  
📌 Justificación: permite visualizar primero las devoluciones más recientes, como un historial.

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

| Módulo           | Estructura usada | Justificación                                                       |
| ---------------- | ---------------- | ------------------------------------------------------------------- |
| **Usuarios**     | Array            | Manejo flexible de una lista con inserción, búsqueda y eliminación. |
| **Libros**       | Array            | Gestión de inventario con actualización dinámica de stock.          |
| **Préstamos**    | Cola (FIFO)      | Se atiende al primer usuario que solicita.                          |
| **Devoluciones** | Pila (LIFO)      | Se muestran primero las devoluciones más recientes.                 |


👨‍🏫 Autor

Johan Cortes
📍 Bogotá, Colombia
Proyecto con fines académicos — Fundamentos de estructuras de datos.



