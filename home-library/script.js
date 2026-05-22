/**
 * @file script.js
 * @brief JavaScript логика для системы учёта книг
 */

// Массив для хранения всех книг
let books = [];

// Счётчик для следующего ID (начинается с 1)
let nextId = 1;

// Текущий фильтр
let currentFilter = 'all';

// Ключ для localStorage
const STORAGE_KEY = 'home_library';

// Загрузка данных из localStorage при запуске
function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        books = data.books;
        nextId = data.nextId;
    } else {
        // Добавляем тестовые книги для демонстрации
        books = [
            { id: 1, title: 'Война и мир', author: 'Лев Толстой', year: 1869, status: 'в наличии' },
            { id: 2, title: 'Преступление и наказание', author: 'Фёдор Достоевский', year: 1866, status: 'выдана' },
            { id: 3, title: 'Мастер и Маргарита', author: 'Михаил Булгаков', year: 1967, status: 'в наличии' }
        ];
        nextId = 4;
        saveToStorage();
    }
}

// Сохранение данных в localStorage
function saveToStorage() {
    const data = {
        books: books,
        nextId: nextId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Добавление новой книги
function addBook(title, author, year) {
    const book = {
        id: nextId++,
        title: title,
        author: author,
        year: parseInt(year),
        status: 'в наличии',
        addedDate: new Date().toLocaleDateString()
    };
    books.push(book);
    saveToStorage();
    renderBooks();
}

// Удаление книги
function deleteBook(id) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        books = books.filter(book => book.id !== id);
        saveToStorage();
        renderBooks();
    }
}

// Выдача книги
function issueBook(id) {
    const book = books.find(book => book.id === id);
    if (book && book.status === 'в наличии') {
        book.status = 'выдана';
        saveToStorage();
        renderBooks();
    }
}

// Возврат книги
function returnBook(id) {
    const book = books.find(book => book.id === id);
    if (book && book.status === 'выдана') {
        book.status = 'в наличии';
        saveToStorage();
        renderBooks();
    }
}

// Поиск книг
function searchBooks(query) {
    if (!query) return books;
    
    const lowerQuery = query.toLowerCase();
    return books.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery)
    );
}

// Получение отфильтрованных книг
function getFilteredBooks() {
    let filtered = books;
    
    // Применяем поиск
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Применяем фильтр по статусу
    if (currentFilter !== 'all') {
        filtered = filtered.filter(book => book.status === currentFilter);
    }
    
    return filtered;
}

// Отображение книг на странице
function renderBooks() {
    const booksListDiv = document.getElementById('booksList');
    const filteredBooks = getFilteredBooks();
    
    if (filteredBooks.length === 0) {
        booksListDiv.innerHTML = '<p class="empty-message">📭 Книги не найдены</p>';
        return;
    }
    
    booksListDiv.innerHTML = '';
    
    filteredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        const statusClass = book.status === 'в наличии' ? 'status-available' : 'status-issued';
        const statusText = book.status === 'в наличии' ? '✅ В наличии' : '📤 Выдана';
        
        bookCard.innerHTML = `
            <div class="book-info">
                <div class="book-title">📖 ${escapeHtml(book.title)}</div>
                <div class="book-author">✍️ ${escapeHtml(book.author)}</div>
                <div class="book-year">📅 ${book.year} год</div>
                <div class="book-status ${statusClass}">${statusText}</div>
            </div>
            <div class="book-actions">
                ${book.status === 'в наличии' ? 
                    `<button class="btn-issue btn-small" onclick="issueBook(${book.id})">📤 Выдать</button>` :
                    `<button class="btn-return btn-small" onclick="returnBook(${book.id})">📥 Вернуть</button>`
                }
                <button class="btn-delete btn-small" onclick="deleteBook(${book.id})">🗑️ Удалить</button>
            </div>
        `;
        
        booksListDiv.appendChild(bookCard);
    });
}

// Простая защита от XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Обновление активной кнопки фильтра
function updateActiveFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Форма добавления книги
    document.getElementById('addBookForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const year = document.getElementById('year').value;
        
        if (title && author && year) {
            addBook(title, author, year);
            document.getElementById('addBookForm').reset();
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    });
    
    // Поиск
    document.getElementById('searchInput').addEventListener('input', () => {
        renderBooks();
    });
    
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateActiveFilter();
            renderBooks();
        });
    });
}

// Экспорт функций в глобальную область для доступа из HTML
window.issueBook = issueBook;
window.returnBook = returnBook;
window.deleteBook = deleteBook;

// Запуск приложения
loadFromStorage();
initEventListeners();
renderBooks();