import { seedDefaults } from "./data/seed.js";
import { initBooks } from "./models/books.js";
import { initLoans } from "./models/loans.js";
import { initReturns } from "./models/returns.js";
import { initUsers } from "./models/users.js";

addEventListener("DOMContentLoaded", () => {
  seedDefaults();
  initUsers();
  initBooks();
  initLoans();
  initReturns();
});
