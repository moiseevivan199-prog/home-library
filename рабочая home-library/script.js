// Данные
let books = [];
let nextId = 1;
let currentFilter = "all";

// Загрузка из localStorage
function loadData() {
    const saved = localStorage.getItem("simple_library");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            books = data.books || [];
            nextId = data.nextId || 1;
        } catch(e) {}
    }
    if (!books.length) {
        books = [
            { id: 1, title: "Война и мир", author: "Толстой", year: 1869, status: "в наличии" },
            { id: 2, title: "Преступление и наказание", author: "Достоевский", year: 1866, status: "выдана" },
            { id: 3, title: "Мастер и Маргарита", author: "Булгаков", year: 1967, status: "в наличии" }
        ];
        nextId = 4;
        saveData();
    }
}

function saveData() {
    localStorage.setItem("simple_library", JSON.stringify({ books, nextId }));
}

// Добавить книгу
function addBook(title, author, year) {
    if (!title.trim() || !author.trim() || !year) {
        alert("Заполни все поля");
        return false;
    }
    const newBook = {
        id: nextId++,
        title: title.trim(),
        author: author.trim(),
        year: parseInt(year),
        status: "в наличии"
    };
    books.push(newBook);
    saveData();
    renderBooks();
    return true;
}

// Выдать
function issueBook(id) {
    const book = books.find(b => b.id === id);
    if (book && book.status === "в наличии") {
        book.status = "выдана";
        saveData();
        renderBooks();
    } else {
        alert("Книга уже выдана или не найдена");
    }
}

// Вернуть
function returnBook(id) {
    const book = books.find(b => b.id === id);
    if (book && book.status === "выдана") {
        book.status = "в наличии";
        saveData();
        renderBooks();
    }
}

// Удалить
function deleteBook(id) {
    if (confirm("Удалить книгу?")) {
        books = books.filter(b => b.id !== id);
        saveData();
        renderBooks();
    }
}

// Получить отфильтрованные книги
function getFilteredBooks() {
    let filtered = [...books];
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        );
    }
    if (currentFilter !== "all") {
        filtered = filtered.filter(b => b.status === currentFilter);
    }
    return filtered;
}

// Обновить статистику
function updateStats() {
    const total = books.length;
    const available = books.filter(b => b.status === "в наличии").length;
    const issued = books.filter(b => b.status === "выдана").length;
    document.getElementById("totalCount").innerText = total;
    document.getElementById("availableCount").innerText = available;
    document.getElementById("issuedCount").innerText = issued;
    
    const filtered = getFilteredBooks();
    document.getElementById("bookCount").innerText = filtered.length;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Обработчик кнопок в карточках
function handleAction(e) {
    const btn = e.currentTarget;
    const id = parseInt(btn.getAttribute("data-id"));
    const action = btn.getAttribute("data-action");
    if (action === "issue") issueBook(id);
    else if (action === "return") returnBook(id);
    else if (action === "delete") deleteBook(id);
}

// Рендер
function renderBooks() {
    const container = document.getElementById("booksList");
    const filtered = getFilteredBooks();
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">📭 Нет книг</div>`;
        updateStats();
        return;
    }
    
    container.innerHTML = "";
    filtered.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";
        const statusClass = book.status === "в наличии" ? "status-available" : "status-issued";
        const statusText = book.status === "в наличии" ? "✅ В наличии" : "📤 Выдана";
        card.innerHTML = `
            <div class="book-info">
                <div class="book-title">📖 ${escapeHtml(book.title)}</div>
                <div class="book-author">✍️ ${escapeHtml(book.author)}</div>
                <div class="book-year">📅 ${book.year}</div>
                <div class="book-status ${statusClass}">${statusText}</div>
            </div>
            <div class="book-actions">
                ${book.status === "в наличии" 
                    ? `<button class="btn-small btn-issue" data-id="${book.id}" data-action="issue">📤 Выдать</button>`
                    : `<button class="btn-small btn-return" data-id="${book.id}" data-action="return">📥 Вернуть</button>`
                }
                <button class="btn-small btn-delete" data-id="${book.id}" data-action="delete">🗑️ Удалить</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Навешиваем обработчики
    document.querySelectorAll("[data-action]").forEach(btn => {
        btn.removeEventListener("click", handleAction);
        btn.addEventListener("click", handleAction);
    });
    
    updateStats();
}

// ----- Инициализация при загрузке DOM -----
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    renderBooks();
    
    document.getElementById("addBtn").addEventListener("click", () => {
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const year = document.getElementById("year").value;
        if (addBook(title, author, year)) {
            document.getElementById("title").value = "";
            document.getElementById("author").value = "";
            document.getElementById("year").value = "";
        }
    });
    
    document.getElementById("searchInput").addEventListener("input", () => renderBooks());
    
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.getAttribute("data-filter");
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderBooks();
        });
    });
});