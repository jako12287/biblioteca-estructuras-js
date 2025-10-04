import { seedDefaults } from "./src/data/seed.js";
import { initBooks } from "./src/models/books.js";
import { initLoans } from "./src/models/loans.js";
import { initReturns } from "./src/models/returns.js";
import { initUsers } from "./src/models/users.js";

addEventListener("DOMContentLoaded", () => {
  seedDefaults();
  initUsers();
  initBooks();
  initLoans();
  initReturns();
});
