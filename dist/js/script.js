// ====== 1. DATA ======
const STORAGE_KEY = "my-library-books";
let myLibrary = [];

class Book {
  constructor(title, author, pages, read, id) {
    this.id = id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
  }

  toggleRead() {
    this.read = !this.read;
  }
}

function saveLibrary() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myLibrary));
  } catch (e) {
    // abaikan jika localStorage tidak tersedia
  }
}

function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // JSON hanya menyimpan data biasa, jadi kita ubah lagi menjadi objek Book
      myLibrary = JSON.parse(raw).map(
        (b) => new Book(b.title, b.author, b.pages, b.read, b.id)
      );
      return;
    }
  } catch (e) {
    // data rusak / tidak tersedia -> pakai contoh
  }
  myLibrary = [
    new Book("Atomic Habits", "James Clear", 320, true),
    new Book("Laskar Pelangi", "Andrea Hirata", 529, false),
    new Book("The Alchemist", "Paulo Coelho", 208, false),
  ];
}

function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  saveLibrary();
  render();
}

function removeBook(id) {
  myLibrary = myLibrary.filter((book) => book.id !== id);
  saveLibrary();
  render();
}

function toggleBookStatus(id) {
  const book = myLibrary.find((b) => b.id === id);
  if (book) {
    book.toggleRead();
    saveLibrary();
    render();
  }
}

// ====== 2. TAMPILAN ======
const libraryEl = document.getElementById("library");
const emptyEl = document.getElementById("empty");

function createCard(book) {
  const card = document.createElement("article");
  card.className = "card" + (book.read ? " read" : "");

  // --- bagian atas: judul + halaman ---
  const body = document.createElement("div");
  body.className = "card-body";

  const top = document.createElement("div");
  top.className = "card-top";

  const title = document.createElement("h3");
  title.textContent = book.title;

  const pages = document.createElement("span");
  pages.className = "pages";
  pages.textContent = "Pages: " + book.pages;

  top.append(title, pages);

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = "by " + book.author;

  const divider = document.createElement("hr");

  // --- tombol ---
  const actions = document.createElement("div");
  actions.className = "card-actions";

  const statusBtn = document.createElement("button");
  statusBtn.type = "button";
  statusBtn.className = "btn-status";
  statusBtn.title = "Klik untuk mengubah status";
  statusBtn.textContent = book.read ? "Already read" : "Unread";
  statusBtn.addEventListener("click", () => toggleBookStatus(book.id));

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn-hapus";
  removeBtn.textContent = "Delete";
  removeBtn.addEventListener("click", () => removeBook(book.id));

  actions.append(statusBtn, removeBtn);
  body.append(top, author, divider, actions);

  // --- strip bawah kartu ---
  const footer = document.createElement("div");
  footer.className = "card-footer";
  footer.textContent = book.read ? "Done" : "In progres";

  card.append(body, footer);
  return card;
}

function render() {
  libraryEl.innerHTML = "";
  myLibrary.forEach((book) => libraryEl.appendChild(createCard(book)));
  emptyEl.classList.toggle("hidden", myLibrary.length > 0);
}

// ====== 3. FORM ======
const dialog = document.getElementById("dialog");
const form = document.getElementById("form-buku");
const errorEl = document.getElementById("error");

function openForm() {
  form.reset();
  errorEl.classList.add("hidden");
  dialog.showModal();
  document.getElementById("title").focus();
}

function closeForm() {
  dialog.close();
}

document.getElementById("btn-tambah").addEventListener("click", openForm);
document.getElementById("btn-batal").addEventListener("click", closeForm);

form.addEventListener("submit", (event) => {
  event.preventDefault(); // cegah halaman reload

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const pages = Number(document.getElementById("pages").value);
  const read = document.getElementById("read").checked;

  if (!title || !author) {
    showError("Judul dan penulis wajib diisi.");
    return;
  }
  if (!Number.isInteger(pages) || pages < 1) {
    showError("Jumlah halaman harus berupa angka bulat minimal 1.");
    return;
  }

  addBookToLibrary(title, author, pages, read);
  closeForm();
});

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

// ====== 4. MULAI ======
loadLibrary();
render();
