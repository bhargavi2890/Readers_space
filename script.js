const booksContainer = document.getElementById('booksContainer');
const profileBtn = document.getElementById('profileBtn');
const profileBtnText = document.getElementById('profileBtnText');
const authModal = document.getElementById('authModal');
const profileModal = document.getElementById('profileModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const booksRead = document.getElementById('booksRead');
const pagesRead = document.getElementById('pagesRead');
const readingGoal = document.getElementById('readingGoal');
const currentStreak = document.getElementById('currentStreak');
const recentBooks = document.getElementById('recentBooks');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const apiSelector = document.getElementById('apiSelector');
const refreshBtn = document.getElementById('refreshBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const sectionTitle = document.getElementById('sectionTitle');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const logoutBtn = document.getElementById('logoutBtn');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');
const signupError = document.getElementById('signupError');
const APIs = {
    gutendex: 'https://gutendex.com/books/',
    openlibrary: 'https://openlibrary.org/search.json?',
    googlebooks: 'https://www.googleapis.com/books/v1/volumes?q=',
    indianauthors: 'https://openlibrary.org/search.json?author='
};
const defaultUserData = {
    name: "",
    email: "",
    booksRead: 0,
    pagesRead: 0,
    readingGoal: 25,
    currentStreak: 0,
    readingHistory: [],
    createdAt: ""
};

let currentUser = null;
let currentBooks = [];
let currentFilter = null;
const INDIAN_AUTHORS = [
    'Rabindranath Tagore', 'R.K. Narayan', 'Arundhati Roy', 'Salman Rushdie',
    'Jhumpa Lahiri', 'Vikram Seth', 'Chetan Bhagat', 'Amish Tripathi',
    'Ruskin Bond', 'Anita Desai', 'Kiran Desai', 'Aravind Adiga',
    'Shashi Tharoor', 'Anuja Chauhan', 'Sudha Murty'
];
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    fetchBooks();
    setupEventListeners();
});

function setupEventListeners() {
    profileBtn.addEventListener('click', handleProfileClick);
    closeAuthModal.addEventListener('click', () => authModal.style.display = 'none');
    closeProfileModal.addEventListener('click', () => profileModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.style.display = 'none';
        if (e.target === profileModal) profileModal.style.display = 'none';
    });
    document.querySelectorAll('.dropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = link.getAttribute('data-value');
            applyFilter('genre', filterValue);
        });
    });
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    apiSelector.addEventListener('change', fetchBooks);
    refreshBtn.addEventListener('click', fetchBooks);
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('signup');
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    updateProfileBtn.addEventListener('click', handleUpdateProfile);
}
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('readerPlaceCurrentUser'));
    if (user) {
        currentUser = user;
        updateProfileButton(true);
    } else {
        currentUser = null;
        updateProfileButton(false);
    }
}
function updateProfileButton(isLoggedIn) {
    if (isLoggedIn) {
        profileBtnText.textContent = currentUser.name.split(' ')[0];
        profileBtn.classList.add('signed-in');
    } else {
        profileBtnText.textContent = 'Sign In';
        profileBtn.classList.remove('signed-in');
    }
}
function handleProfileClick() {
    if (currentUser) {
        updateProfileModal();
        profileModal.style.display = 'flex';
    } else {
        authModal.style.display = 'flex';
        switchAuthForm('login');
    }
}
function switchAuthForm(formType) {
    if (formType === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginError.textContent = '';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        signupError.textContent = '';
    }
}
function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }
    loadingIndicator.style.display = 'flex';
    
    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('readerPlaceUsers')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = {
                    name: user.name,
                    email: user.email,
                    booksRead: user.booksRead,
                    pagesRead: user.pagesRead,
                    readingGoal: user.readingGoal,
                    currentStreak: user.currentStreak,
                    readingHistory: user.readingHistory,
                    createdAt: user.createdAt
                };
                
                localStorage.setItem('readerPlaceCurrentUser', JSON.stringify(currentUser));
                
                authModal.style.display = 'none';
                checkAuthState();
                fetchBooks();
                loginEmail.value = '';
                loginPassword.value = '';
                loginError.textContent = '';
            } else {
                loginError.textContent = 'Invalid email or password';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'An error occurred. Please try again.';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }, 800);
}
function handleSignup() {
    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    const confirmPassword = signupConfirmPassword.value.trim();
    if (!name || !email || !password || !confirmPassword) {
        signupError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        return;
    }
    loadingIndicator.style.display = 'flex';
    
    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('readerPlaceUsers')) || [];
            
            if (users.some(u => u.email === email)) {
                signupError.textContent = 'Email already in use';
                return;
            }
            
            const newUser = {
                ...defaultUserData,
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('readerPlaceUsers', JSON.stringify(users));
            currentUser = {
                name: newUser.name,
                email: newUser.email,
                booksRead: newUser.booksRead,
                pagesRead: newUser.pagesRead,
                readingGoal: newUser.readingGoal,
                currentStreak: newUser.currentStreak,
                readingHistory: newUser.readingHistory,
                createdAt: newUser.createdAt
            };
            
            localStorage.setItem('readerPlaceCurrentUser', JSON.stringify(currentUser));
            
            authModal.style.display = 'none';
            checkAuthState();
            fetchBooks();
            signupName.value = '';
            signupEmail.value = '';
            signupPassword.value = '';
            signupConfirmPassword.value = '';
            signupError.textContent = '';
        } catch (error) {
            console.error('Signup error:', error);
            signupError.textContent = 'An error occurred. Please try again.';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }, 800);
}
function handleLogout() {
    localStorage.removeItem('readerPlaceCurrentUser');
    currentUser = null;
    profileModal.style.display = 'none';
    checkAuthState();
}
function handleUpdateProfile() {
    alert('Profile update functionality would open a form to update user information in a real application');
}
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        searchBooks(searchTerm);
    }
}
async function fetchBooks() {
    const selectedApi = apiSelector.value;
    loadingIndicator.style.display = 'flex';
    booksContainer.innerHTML = '';
    sectionTitle.textContent = 'Loading books...';
    
    try {
        let books = [];
        
        switch(selectedApi) {
            case 'gutendex':
                books = await fetchGutendexBooks();
                break;
            case 'openlibrary':
                books = await fetchOpenLibraryBooks();
                break;
            case 'googlebooks':
                books = await fetchGoogleBooks();
                break;
            case 'indianauthors':
                books = await fetchIndianAuthorsBooks();
                break;
        }
        
        currentBooks = processBooksData(books, selectedApi);
        displayBooks(currentBooks);
        sectionTitle.textContent = selectedApi === 'indianauthors' ? 'Books by Indian Authors' : 'Featured Books';
    } catch (error) {
        console.error('Error fetching books:', error);
        booksContainer.innerHTML = '<p class="error">Failed to load books. Please try again.</p>';
        sectionTitle.textContent = 'Error Loading Books';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}
async function fetchGutendexBooks() {
    const response = await fetch(`${APIs.gutendex}?page=${Math.floor(Math.random() * 50) + 1}`);
    const data = await response.json();
    return data.results;
}
async function fetchOpenLibraryBooks() {
    const subjects = ['fiction', 'biography', 'science', 'history', 'fantasy'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const response = await fetch(`${APIs.openlibrary}subject=${randomSubject}&limit=20`);
    const data = await response.json();
    return data.docs;
}
async function fetchGoogleBooks() {
    const subjects = ['fiction', 'biography', 'science', 'history', 'fantasy'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const response = await fetch(`${APIs.googlebooks}subject:${randomSubject}&maxResults=20`);
    const data = await response.json();
    return data.items || [];
}
async function fetchIndianAuthorsBooks() {
    const randomAuthor = INDIAN_AUTHORS[Math.floor(Math.random() * INDIAN_AUTHORS.length)];
    const response = await fetch(`${APIs.indianauthors}"${encodeURIComponent(randomAuthor)}"&limit=20`);
    const data = await response.json();
    return data.docs || [];
}
function processBooksData(books, api) {
    switch(api) {
        case 'gutendex':
            return books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.authors?.[0]?.name || 'Unknown Author',
                coverImage: book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover',
                externalLink: book.formats?.['text/html'] || book.formats?.['application/pdf'] || '#',
                pages: Math.floor(Math.random() * 300) + 100,
                readPages: 0,
                genre: getRandomGenre(),
                isIndian: false
            }));
            
        case 'openlibrary':
            return books.map(book => ({
                id: book.key,
                title: book.title,
                author: book.author_name?.[0] || 'Unknown Author',
                coverImage: book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : 'https://via.placeholder.com/200x300?text=No+Cover',
                externalLink: `https://openlibrary.org${book.key}`,
                pages: book.number_of_pages_median || Math.floor(Math.random() * 300) + 100,
                readPages: 0,
                genre: getRandomGenre(),
                isIndian: INDIAN_AUTHORS.some(author => 
                    book.author_name?.some(name => name.includes(author.split(' ')[0]))
                )
            }));
            
        case 'googlebooks':
            return books.map(book => ({
                id: book.id,
                title: book.volumeInfo.title,
                author: book.volumeInfo.authors?.[0] || 'Unknown Author',
                coverImage: book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/200x300?text=No+Cover',
                externalLink: book.volumeInfo.previewLink || '#',
                pages: book.volumeInfo.pageCount || Math.floor(Math.random() * 300) + 100,
                readPages: 0,
                genre: getRandomGenre(),
                isIndian: INDIAN_AUTHORS.some(author => 
                    book.volumeInfo.authors?.some(name => name.includes(author.split(' ')[0]))
                )
            }));
            
        case 'indianauthors':
            return books.map(book => ({
                id: book.key,
                title: book.title,
                author: book.author_name?.[0] || 'Unknown Indian Author',
                coverImage: book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : 'https://via.placeholder.com/200x300?text=No+Cover',
                externalLink: `https://openlibrary.org${book.key}`,
                pages: book.number_of_pages_median || Math.floor(Math.random() * 300) + 100,
                readPages: 0,
                genre: getRandomGenre(),
                isIndian: true
            }));
            
        default:
            return [];
    }
}
function getRandomGenre() {
    const genres = ['fiction', 'non-fiction', 'biography', 'self-help', 'fantasy', 'horror'];
    return genres[Math.floor(Math.random() * genres.length)];
}
function displayBooks(books) {
    booksContainer.innerHTML = '';
    
    if (books.length === 0) {
        booksContainer.innerHTML = '<p class="no-books">No books found. Try a different search or filter.</p>';
        return;
    }
    
    books.forEach(book => {
        const progressPercentage = currentUser?.readingHistory?.find(b => b.id === book.id)?.readPages 
            ? Math.min(100, Math.round((currentUser.readingHistory.find(b => b.id === book.id).readPages / book.pages) * 100))
            : 0;
            
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        if (book.isIndian) {
            bookCard.classList.add('indian-book');
        }
        
        bookCard.innerHTML = `
            <img src="${book.coverImage}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/200x300?text=No+Cover'">
            <div class="book-info">
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author" title="${book.author}">${book.author}</p>
                <p class="book-pages">${book.pages} pages</p>
                
                ${progressPercentage > 0 ? `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <p class="progress-text">${progressPercentage}% read</p>
                </div>
                ` : ''}
                
                <button class="read-btn" data-id="${book.id}">
                    <i class="fas fa-book-open"></i> ${progressPercentage > 0 ? 'Continue' : 'Read'}
                </button>
            </div>
        `;
        
        booksContainer.appendChild(bookCard);
        bookCard.querySelector('.read-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openBook(book);
        });
    });
}
function openBook(book) {
    if (!currentUser) {
        authModal.style.display = 'flex';
        switchAuthForm('login');
        return;
    }
    const existingBook = currentUser.readingHistory.find(b => b.id === book.id);
    const pagesToAdd = Math.min(book.pages - (existingBook?.readPages || 0), Math.floor(Math.random() * 50) + 10);
    const newReadPages = (existingBook?.readPages || 0) + pagesToAdd;
    const bookCompleted = !existingBook && newReadPages === book.pages;
    
    if (bookCompleted) {
        currentUser.booksRead += 1;
    }
    
    currentUser.pagesRead += pagesToAdd;
    if (existingBook) {
        existingBook.readPages = newReadPages;
        existingBook.lastRead = new Date().toISOString();
    } else {
        currentUser.readingHistory.unshift({
            id: book.id,
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            pages: book.pages,
            readPages: newReadPages,
            lastRead: new Date().toISOString(),
            isIndian: book.isIndian
        });
       if (currentUser.readingHistory.length > 5) {
            currentUser.readingHistory.pop();
        }
    }
    currentUser.currentStreak += 1;
    localStorage.setItem('readerPlaceCurrentUser', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('readerPlaceUsers')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            booksRead: currentUser.booksRead,
            pagesRead: currentUser.pagesRead,
            currentStreak: currentUser.currentStreak,
            readingHistory: currentUser.readingHistory
        };
        localStorage.setItem('readerPlaceUsers', JSON.stringify(users));
    }
    window.open(book.externalLink, '_blank');
    updateProfileModal();
}
function applyFilter(filterType, filterValue) {
    currentFilter = { type: filterType, value: filterValue };
    let filteredBooks = currentBooks;
    
    if (filterValue === 'indian') {
        filteredBooks = currentBooks.filter(book => book.isIndian);
    } else {
        filteredBooks = currentBooks.filter(book => book[filterType] === filterValue);
    }
    
    displayBooks(filteredBooks);
    sectionTitle.textContent = `${filterValue.charAt(0).toUpperCase() + filterValue.slice(1)} Books`;
}
function searchBooks(searchTerm) {
    const filteredBooks = currentBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displayBooks(filteredBooks);
    sectionTitle.textContent = `Search Results for "${searchTerm}"`;
    searchInput.value = '';
}

function updateProfileModal() {
    if (!currentUser) return;
    
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
    booksRead.textContent = currentUser.booksRead;
    pagesRead.textContent = currentUser.pagesRead;
    readingGoal.textContent = `${Math.min(100, Math.round((currentUser.booksRead / currentUser.readingGoal) * 100))}%`;
    currentStreak.textContent = currentUser.currentStreak;
    
    recentBooks.innerHTML = '';
    
    if (currentUser.readingHistory.length === 0) {
        recentBooks.innerHTML = '<p class="no-history">No reading history yet.</p>';
        return;
    }
    
    currentUser.readingHistory.forEach(book => {
        const progressPercentage = Math.min(100, Math.round((book.readPages / book.pages) * 100));
        
        const recentBook = document.createElement('div');
        recentBook.className = 'recent-book';
        recentBook.innerHTML = `
            <img src="${book.coverImage}" alt="${book.title}" class="recent-book-cover" onerror="this.src='https://via.placeholder.com/40x60?text=No+Cover'">
            <div class="recent-book-info">
                <p class="recent-book-title" title="${book.title}">${book.title}</p>
                <p class="recent-book-author" title="${book.author}">${book.author}</p>
            </div>
            <span class="recent-book-progress">${progressPercentage}%</span>
            ${book.isIndian ? '<span class="indian-flag">🇮🇳</span>' : ''}
        `;
        
        recentBooks.appendChild(recentBook);
    });
}