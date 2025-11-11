/* --- [BARU] Impor Firebase dari file init --- */
import { 
    db, auth,
    seriesCollRef, settingsCollRef, contentRowsCollRef, reportsCollRef, navLinksCollRef,
    collection, query, where, orderBy, onSnapshot, 
    doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, 
    Timestamp, increment, limit, addDoc,
    arrayUnion, arrayRemove
} from 'https://aisnime.site/firebase-init.js';

/* --- [BARU] Impor fungsi async dari async.js --- */
// Kita impor seluruh modul untuk menghindari circular dependency
import * as asyncFunctions from 'https://aisnime.site/async.js';

/* --- [BARU] Semua variabel global (state) dipindahkan ke sini --- */
export let contentListEl, mainLogoImg, mainTitleText, contentRowsContainer; 
export let mainLogoUrl = ''; 
export let allSeriesContent = [];
export let filteredSeriesContent = []; 
export let isLoadingMore = false;
export let isSearching = false;
export let currentDisplayCount = 0;
export const MOBILE_LIMIT = 6;
export const DESKTOP_LIMIT = 10; 
export let chatCollRef = null;
export let currentUserId = null;
export let chatUnsubscribe = null; 
export let blockedWordsList = [];
export let faviconUrl = '';
export let isWatchModuleLoaded = false;
export let genreSidebar, genreOverlay, openGenreBtn, closeGenreBtn, genreListMobile, genreListDesktop;
export let allGenres = new Set();
export let activeGenre = 'All';

export let videoModal, closeModalBtn, modalMainPlayer, videoContainer;
export let currentSeriesId = null;
export let currentItem = null;
export let saveTimeout;
export let watermarkEl = null; 

/* --- [BARU] Setter untuk state (jika diperlukan dari modul lain) --- */
export function setBlockedWordsList(list) {
    blockedWordsList = list;
}
export function setFaviconUrl(url) {
    faviconUrl = url;
}
export function setMainLogoUrl(url) {
    mainLogoUrl = url;
}
export function setCurrentUserId(id) {
    currentUserId = id;
}

/* --- [BARU] Semua FUNGSI NON-ASYNC (Dipindahkan dari async.js) --- */

export function loadInitialContent() {
    const q = query(seriesCollRef, orderBy("updatedAt", "desc"), limit(DESKTOP_LIMIT * 2)); // Ambil 2 batch awal
    
    onSnapshot(q, (snapshot) => {
        allSeriesContent = snapshot.docs.map(doc => ({id: doc.id, data: doc.data()}));
        
        filteredSeriesContent = allSeriesContent;
        currentDisplayCount = 0;
        if(contentListEl) contentListEl.innerHTML = ''; // [DIUBAH] Hanya mengosongkan #content-list
        renderMoreContent(); // Render "Update Terbaru"
        setupGenreFilter(); // Setup filter berdasarkan "Update Terbaru"

    }, (error) => {
        console.error(`Gagal memuat konten dari ${seriesCollRef.path}: ${error.message}`); 
        if (contentListEl) {
            contentListEl.innerHTML = '<p class="text-red-500 col-span-full text-center py-8">Error memuat konten.</p>';
        }
    });
}

export function renderCustomRow(title, seriesContent) {
    const rowEl = document.createElement('div');
    rowEl.className = 'custom-content-row'; // Kelas untuk disembunyikan saat filter/cari

    const gridEl = document.createElement('div');
    gridEl.className = 'grid grid-cols-1 sm:grid-cols-2 gap-6'; // [DIKEMBALIKAN] Menggunakan grid

    let itemsRendered = 0;
    seriesContent.forEach(itemData => {
        const card = createSeriesCard(itemData);
        if (card) {
            gridEl.appendChild(card);
            itemsRendered++;
        }
    });

    if (itemsRendered > 0) { /* [DIUBAH] Pengecekan */
         /* [DIUBAH] Komentar HTML diubah ke JS */
         rowEl.innerHTML = `<h2 class="text-3xl font-bold mb-6">${title.toUpperCase()}</h2>`;
         rowEl.appendChild(gridEl);
         if (contentRowsContainer) contentRowsContainer.appendChild(rowEl);
    }
}

export function createSeriesCard(itemData) {
    if (!itemData || !itemData.data || !itemData.data.thumbnailUrl || !itemData.data.title) {
        console.warn(`MELEWATI item, data tidak lengkap.`); 
        return null; // Kembalikan null jika data tidak valid
    }

    const itemEl = document.createElement('div');
    // [DIKEMBALIKAN] Kelas flex-col dihapus, rasio aspek dikembalikan
    itemEl.className = 'content-card bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-200 hover:-translate-y-1 cursor-pointer';
    
    // [DIKEMBALIKAN] Struktur asli kartu dengan rasio aspek 7:9
    itemEl.innerHTML = `
        <div class="relative w-full aspect-[7/9] bg-black">
            <img src="${itemData.data.thumbnailUrl}" alt="${itemData.data.title}" class="w-full h-full object-cover" loading="lazy">
        </div>
        <div class="p-4 space-y-1 text-left">
            <h4 class="font-semibold text-white leading-tight truncate text-xs" title="${itemData.data.title}">${itemData.data.title}</h4>
            <div class="flex items-center justify-between mt-1"> 
                <div class="flex items-center text-[9px] text-yellow-400">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span>${(itemData.data.rating || 'N/A').replace(' / 10', '')}</span>
                </div>
                
                <div class="flex items-center text-[9px] text-gray-400">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    <span>${(itemData.data.episodeCount || 0)} Eps</span>
                </div>
                <div class="flex items-center text-[9px] text-gray-400">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    <span>${(itemData.data.viewCount || 0).toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>`;
    
    /* [DIUBAH] Event listener sekarang memanggil 'playLatestEpisode' dari modul async */
    itemEl.addEventListener('click', () => {
        asyncFunctions.playLatestEpisode(itemData.id, itemData.data);
    });
    return itemEl;
}

export function setupSearchListener() {
    
    const handleSearchInput = (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        /* [DIUBAH] Logika pencarian sekarang menyembunyikan/menampilkan baris */
        const latestUpdatesRow = document.getElementById('latest-updates-row');
        const customRows = document.querySelectorAll('.custom-content-row');

        if (searchTerm.length > 0) {
            isSearching = true;
            // Sembunyikan semua baris kustom saat mencari
            customRows.forEach(row => row.classList.add('hidden'));
            if (latestUpdatesRow) latestUpdatesRow.classList.remove('hidden'); // Selalu cari di "Update Terbaru"

            filteredSeriesContent = allSeriesContent.filter(item => 
                item.data.title.toLowerCase().includes(searchTerm) ||
                (item.data.genre && (Array.isArray(item.data.genre) ? item.data.genre.join(', ') : item.data.genre).toLowerCase().includes(searchTerm))
            );
        } else {
            isSearching = false;
            // Tampilkan kembali baris kustom
            customRows.forEach(row => row.classList.remove('hidden'));
            if (latestUpdatesRow) latestUpdatesRow.classList.remove('hidden');
            
            filterContent(activeGenre); // Terapkan filter genre yang aktif
            return;
        }
        currentDisplayCount = 0;
        if (contentListEl) contentListEl.innerHTML = '';
        renderMoreContent(); // Render hasil pencarian di "Update Terbaru"
    };

    const handleSearchSubmit = (e) => e.preventDefault();

    // Desktop
    const searchInputDesktop = document.getElementById('search-input');
    const searchFormDesktop = document.getElementById('search-form');
    if (searchInputDesktop) searchInputDesktop.addEventListener('input', handleSearchInput);
    if (searchFormDesktop) searchFormDesktop.addEventListener('submit', handleSearchSubmit);

    // Mobile
    const searchInputMobile = document.getElementById('search-input-mobile');
    const searchFormMobile = document.getElementById('search-form-mobile');
    if (searchInputMobile) searchInputMobile.addEventListener('input', handleSearchInput);
    if (searchFormMobile) searchFormMobile.addEventListener('submit', handleSearchSubmit);
}

export function setupEventListeners(){
    // [DIUBAH] Target scroll sekarang adalah 'content-rows-container' di desktop
    const mainContentEl = document.getElementById('content-rows-container');
    if (mainContentEl) {
        mainContentEl.addEventListener('scroll', handleScroll);
    }
    // Fallback untuk mobile
    window.addEventListener('scroll', handleScroll);
    
    const toggleGenreSidebar = (open) => {
        if (open) {
            if (genreSidebar) genreSidebar.classList.remove('-translate-x-full');
            if (genreOverlay) genreOverlay.classList.remove('hidden');
        } else {
            if (genreSidebar) genreSidebar.classList.add('-translate-x-full');
            if (genreOverlay) genreOverlay.classList.add('hidden');
        }
    };

    if (openGenreBtn) openGenreBtn.addEventListener('click', () => toggleGenreSidebar(true));
    if (closeGenreBtn) closeGenreBtn.addEventListener('click', () => toggleGenreSidebar(false));
    if (genreOverlay) genreOverlay.addEventListener('click', () => toggleGenreSidebar(false));
    
    // [BARU] Listener untuk Navigasi Bawah Mobile
    const bottomNavGenreBtn = document.getElementById('bottom-nav-genre-btn');
    if (bottomNavGenreBtn) bottomNavGenreBtn.addEventListener('click', () => toggleGenreSidebar(true));

    const bottomNavHomeBtn = document.getElementById('bottom-nav-home-btn');
    if (bottomNavHomeBtn) bottomNavHomeBtn.addEventListener('click', () => { 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    });


    document.body.addEventListener('contextmenu', (e) => {
        // e.preventDefault(); 
    });
}

export function handleScroll(e) {
    // [DIUBAH] Infinite scroll hanya berlaku jika tidak sedang mencari ATAU filter
    if (isSearching || activeGenre !== 'All' || isLoadingMore) return;
    
    // [DIUBAH] Cek target event (window or the container)
    let target;
    if (e.target.id === 'content-rows-container') {
        target = e.target; // Desktop scroll
    } else if (e.target === document) {
        target = document.documentElement; // Mobile scroll
    } else {
        return; // Abaikan event scroll lain
    }
    
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 500) {
         renderMoreContent();
    }
}

export function renderMoreContent() {
    if (isLoadingMore) return;
    isLoadingMore = true;

    const dataToRender = (isSearching || activeGenre !== 'All') ? filteredSeriesContent : allSeriesContent;
    
    let itemsToLoad;
    // [DIUBAH] Jika sedang mencari atau filter, tampilkan SEMUA hasil (bukan per batch)
    if (isSearching || activeGenre !== 'All') {
        itemsToLoad = dataToRender;
         if (currentDisplayCount > 0) { // Hanya render sekali
            isLoadingMore = false;
            return;
        }
    } else {
        // Logika infinite scroll normal
        const limit = window.innerWidth < 768 ? MOBILE_LIMIT : DESKTOP_LIMIT;
        itemsToLoad = dataToRender.slice(currentDisplayCount, currentDisplayCount + limit);
    }
    
    
    if (itemsToLoad.length === 0) {
        if (currentDisplayCount === 0 && contentListEl) {
            contentListEl.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Tidak ada konten ditemukan.</p>';
        }
        isLoadingMore = false;
        return;
    }
    
    if (currentDisplayCount === 0) {
         const msgEl = document.getElementById('no-content-message');
         if (msgEl) msgEl.remove();
    } 

    itemsToLoad.forEach(itemData => {
        // [DIUBAH] Kirim data ke fungsi renderCard
        const card = createSeriesCard(itemData);
        if (contentListEl && card) contentListEl.appendChild(card);
    });

    currentDisplayCount += itemsToLoad.length;
    isLoadingMore = false;
}

export function setupGenreFilter() {
    allGenres = new Set();
    allSeriesContent.forEach(item => {
        if (!item.data.genre) return; 

        let genres = [];
        if (Array.isArray(item.data.genre)) {
            genres = item.data.genre;
        } else if (typeof item.data.genre === 'string') {
            genres = item.data.genre.split(',').map(g => g.trim()).filter(g => g);
        }

        genres.forEach(g => allGenres.add(g.trim()));
    });

    if (genreListMobile) genreListMobile.innerHTML = '';
    if (genreListDesktop) genreListDesktop.innerHTML = '';
    
    createGenreButton('All');
    if (allGenres.size > 0) {
         Array.from(allGenres).sort().forEach(genre => {
            createGenreButton(genre);
        });
    }
    
    updateActiveGenreButtons();
}

export function createGenreButton(genre) {
    const button = document.createElement('button');
    button.textContent = genre;
    // [DIUBAH] Mengubah style untuk daftar vertikal di desktop
    button.className = 'genre-btn text-xs font-medium py-1 px-3 rounded-full transition lg:w-full lg:text-left lg:rounded-md lg:px-3 lg:py-2 lg:bg-gray-600 lg:hover:bg-gray-500';
    button.dataset.genre = genre;
    
    button.addEventListener('click', () => filterContent(genre));
    
    if (genreListMobile) genreListMobile.appendChild(button.cloneNode(true));
    if (genreListDesktop) genreListDesktop.appendChild(button.cloneNode(true));
    
    if (genreListMobile && genreListMobile.lastChild) genreListMobile.lastChild.addEventListener('click', () => filterContent(genre));
    if (genreListDesktop && genreListDesktop.lastChild) genreListDesktop.lastChild.addEventListener('click', () => filterContent(genre));
}

export function filterContent(genre) {
    activeGenre = genre;
    
    const searchInputDesktop = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    if (searchInputDesktop && searchInputDesktop.value) searchInputDesktop.value = '';
    if (searchInputMobile && searchInputMobile.value) searchInputMobile.value = '';
    
    // [DIUBAH] Sembunyikan baris kustom saat filter aktif
    const latestUpdatesRow = document.getElementById('latest-updates-row');
    const customRows = document.querySelectorAll('.custom-content-row');
    
    if (genre === 'All') {
        isSearching = false;
        filteredSeriesContent = allSeriesContent;
        customRows.forEach(row => row.classList.remove('hidden')); // Tampilkan lagi
        if (latestUpdatesRow) latestUpdatesRow.classList.remove('hidden');
    } else {
        isSearching = true; // Mode filter aktif
        customRows.forEach(row => row.classList.add('hidden')); // Sembunyikan
        if (latestUpdatesRow) latestUpdatesRow.classList.remove('hidden'); // Selalu tampilkan update terbaru

        filteredSeriesContent = allSeriesContent.filter(item => {
            if (!item.data.genre) return false;
            if (Array.isArray(item.data.genre)) {
                return item.data.genre.includes(genre);
            }
            if (typeof item.data.genre === 'string') {
                return item.data.genre.split(',').map(g => g.trim()).includes(genre);
            }
            return false;
        });
    }
    
    if (genreSidebar) genreSidebar.classList.add('-translate-x-full');
    if (genreOverlay) genreOverlay.classList.add('hidden');
    
    currentDisplayCount = 0;
    if (contentListEl) contentListEl.innerHTML = '';
    renderMoreContent();
    updateActiveGenreButtons();
}

export function updateActiveGenreButtons() {
    const allButtons = document.querySelectorAll('.genre-btn');
    allButtons.forEach(btn => {
        if (btn.dataset.genre === activeGenre) {
            btn.classList.add('bg-purple-600', 'text-white');
            btn.classList.remove('bg-gray-700', 'text-gray-300', 'lg:bg-gray-600');
        } else {
            btn.classList.remove('bg-purple-600', 'text-white');
            btn.classList.add('bg-gray-700', 'text-gray-300', 'lg:bg-gray-600');
        }
    });
}

export function censorMessage(message, blocklist) {
    if (!blocklist || blocklist.length === 0) return message;
    
    let censoredText = message;
    blocklist.forEach(word => {
        // 'gi' = global (mencari semua) dan 'i' = case-insensitive (tidak peduli huruf besar/kecil)
        const regex = new RegExp(word, 'gi'); 
        censoredText = censoredText.replace(regex, (match) => '*'.repeat(match.length));
    });
    return censoredText;
}

export function setupChat() {
    chatCollRef = collection(db, 'chat');
    
    /* [DIUBAH] Target diubah ke 'info-chat-sidebar' untuk memperbaiki toggle mobile */
    const chatContainer = document.getElementById('info-chat-sidebar');
    const chatOverlay = document.getElementById('chat-overlay');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessagesEl = document.getElementById('chat-messages');

    const toggleChat = (open) => {
        if (open) {
            if (chatContainer) chatContainer.classList.remove('translate-x-full');
            if (chatOverlay) chatOverlay.classList.remove('hidden');
        } else {
            if (chatContainer) chatContainer.classList.add('translate-x-full');
            if (chatOverlay) chatOverlay.classList.add('hidden');
        }
    };

    if (openChatBtn) openChatBtn.addEventListener('click', () => toggleChat(true));
    if (closeChatBtn) closeChatBtn.addEventListener('click', () => toggleChat(false));
    if (chatOverlay) chatOverlay.addEventListener('click', () => toggleChat(false));
    
    // [BARU] Tambahkan listener untuk tombol nav bawah
    const bottomNavChatBtn = document.getElementById('bottom-nav-chat-btn');
    if (bottomNavChatBtn) {
        bottomNavChatBtn.addEventListener('click', () => toggleChat(true));
    }
    
    if (chatForm) chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        
        // [BARU] Terapkan sensor sebelum mengirim
        const censoredMessage = censorMessage(message, blockedWordsList);

        if (censoredMessage && currentUserId) {
            try {
                addDoc(chatCollRef, {
                    text: censoredMessage, // [DIUBAH] Kirim pesan yang sudah disensor
                    userId: currentUserId, // Simpan ID untuk identifikasi
                    createdAt: Timestamp.now()
                });
                chatInput.value = '';
            } catch (error) {
                console.error("Gagal mengirim pesan:", error);
            }
        }
    });
    
    // Listener untuk pesan baru
    const q = query(chatCollRef, orderBy("createdAt", "desc"), limit(100)); // [DIUBAH] limit(100)
    
    if (chatUnsubscribe) chatUnsubscribe(); // Hentikan listener lama jika ada
    
    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!chatMessagesEl) return;
        chatMessagesEl.innerHTML = ''; // Kosongkan
        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });

        // Balikkan urutan agar pesan terbaru di bawah
        messages.reverse().forEach(msg => {
            const isMe = msg.userId === currentUserId;
            const msgEl = document.createElement('div');
            msgEl.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
            
            msgEl.innerHTML = `
                <span class="text-xs text-gray-400 mb-1 ${isMe ? 'mr-2' : 'ml-2'}">
                    ${msg.userId.substring(0, 6)}...
                </span>
                <div class="max-w-[80%] break-words p-3 rounded-lg ${isMe ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'}">
                    <p class="text-sm">${msg.text}</p>
                </div>
            `;
            chatMessagesEl.appendChild(msgEl);
        });
        
        // Auto-scroll ke bawah
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    });
}

export function setupReportModal() {
    const openReportBtn = document.getElementById('open-report-btn'); // Tombol mobile
    const openReportBtnDesktop = document.getElementById('open-report-btn-desktop'); // [BARU] Tombol desktop
    const reportModal = document.getElementById('report-modal');
    const closeReportBtn = document.getElementById('close-report-btn');
    const reportForm = document.getElementById('report-form');
    const reportTextarea = document.getElementById('report-textarea');
    const sendReportBtn = document.getElementById('send-report-btn');
    const reportStatusMsg = document.getElementById('report-status-message');

    if(openReportBtn) openReportBtn.addEventListener('click', () => {
        if (reportModal) reportModal.classList.remove('hidden');
    });
    
    /* [BARU] Listener untuk tombol desktop */
    if (openReportBtnDesktop) {
        openReportBtnDesktop.addEventListener('click', () => {
            if (reportModal) reportModal.classList.remove('hidden');
        });
    }
    
    if(closeReportBtn) closeReportBtn.addEventListener('click', () => {
        if (reportModal) reportModal.classList.add('hidden');
    });
    
    if(reportModal) reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.add('hidden');
        }
    });

    if(reportForm) reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reportText = reportTextarea.value.trim();
        if (reportText.length < 10) {
            if (reportStatusMsg) reportStatusMsg.textContent = "Mohon jelaskan lebih detail (minimal 10 karakter).";
            return;
        }

        if (sendReportBtn) sendReportBtn.disabled = true;
        if (sendReportBtn) sendReportBtn.textContent = "Mengirim...";

        try {
            await addDoc(reportsCollRef, {
                userId: currentUserId, // Sudah didefinisikan secara global
                report: reportText,
                timestamp: Timestamp.now(),
                userAgent: navigator.userAgent, // Membantu debugging
                page: window.location.href
            });
            
            if (reportTextarea) reportTextarea.value = '';
            if (reportStatusMsg) reportStatusMsg.textContent = "Laporan terkirim. Terima kasih!";
            
            setTimeout(() => {
                if (reportModal) reportModal.classList.add('hidden');
                if (reportStatusMsg) reportStatusMsg.textContent = "";
            }, 2500);

        } catch (error) {
            console.error("Gagal mengirim laporan:", error);
            if (reportStatusMsg) reportStatusMsg.textContent = "Gagal mengirim. Coba lagi nanti.";
        } finally {
            if (sendReportBtn) sendReportBtn.disabled = false;
            if (sendReportBtn) sendReportBtn.textContent = "Kirim Laporan";
        }
    });
}

export function setupModalEventListeners() {
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeVideoModal);
    if (videoModal) videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
    /* [DIHAPUS] Listener untuk modal episode lama */
}

export function closeVideoModal() {
    if (videoModal) videoModal.classList.add('hidden');
    saveWatchProgress(); 
    if (saveTimeout) clearTimeout(saveTimeout);
    if (modalMainPlayer) {
        modalMainPlayer.pause();
        modalMainPlayer.src = '';
    }
    
    /* [DIUBAH] Reset item saat ini saat modal ditutup */
    currentItem = null;
    currentSeriesId = null; 
    
    /* [DIKEMBALIKAN] Hapus watermark saat modal ditutup */
    if (watermarkEl) {
        watermarkEl.remove(); 
        watermarkEl = null;
    }
    
    /* [DIHAPUS] Logika Kontrol Kustom */
    
    /* [BARU] Hapus listener timeupdate secara manual */
    if (modalMainPlayer && modalMainPlayer._timeUpdateListener) {
        modalMainPlayer.removeEventListener('timeupdate', modalMainPlayer._timeUpdateListener);
        modalMainPlayer._timeUpdateListener = null;
    }
}

export function createWatermark() {
    if (watermarkEl) {
        watermarkEl.remove();
    }
    
    if (!mainLogoUrl) return;

    watermarkEl = document.createElement('div');
    watermarkEl.style.position = 'absolute';
    watermarkEl.style.top = '0.5rem'; 
    watermarkEl.style.right = '0.5rem'; 
    watermarkEl.style.padding = '0.25rem'; 
    watermarkEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; 
    watermarkEl.style.borderRadius = '0.25rem'; 
    watermarkEl.style.zIndex = '21'; 
    
    /* [PERBAIKAN KUNCI] Ini membuat watermark "tembus" terhadap klik mouse */
    watermarkEl.style.pointerEvents = 'none'; 
    
    const img = document.createElement('img');
    img.src = mainLogoUrl;
    img.style.height = '1.75rem'; 
    img.style.width = 'auto';
    img.style.objectFit = 'contain';
    img.style.opacity = '0.8';
    
    watermarkEl.appendChild(img);
    if (videoContainer) videoContainer.appendChild(watermarkEl);
}

export function getWatchProgress(episodeId) {
    try {
        const progressData = localStorage.getItem('aisnimeWatchProgress');
        if (progressData) {
            const episodes = JSON.parse(progressData);
            if (episodes && episodes[episodeId]) {
                if (typeof episodes[episodeId] === 'object') {
                    return episodes[episodeId];
                } else if (typeof episodes[episodeId] === 'number') {
                    return { time: episodes[episodeId], watched: false };
                }
            }
        }
        return { time: 0, watched: false };
    } catch (error) {
        console.error("Gagal mengambil progres dari localStorage:", error);
        return { time: 0, watched: false };
    }
}

export function saveWatchProgress() {
    if (!currentItem || !currentItem.episodeId || !modalMainPlayer) return;
    
    const episodeId = currentItem.episodeId;
    const currentTime = modalMainPlayer.currentTime;
    const duration = modalMainPlayer.duration;
    
    if (currentTime < 10 || isNaN(duration) || duration === 0) return; 

    try {
        let progressData = localStorage.getItem('aisnimeWatchProgress');
        let episodes = {};
        if (progressData) {
            episodes = JSON.parse(progressData);
        }

        let episodeProgress = getWatchProgress(episodeId);
        episodeProgress.time = currentTime;

        if (currentTime / duration >= 0.95) {
            episodeProgress.watched = true;
        }
        
        episodes[episodeId] = episodeProgress;
        localStorage.setItem('aisnimeWatchProgress', JSON.stringify(episodes));
    } catch (error) {
        console.error("Gagal menyimpan progres ke localStorage:", error);
    }
}

export function setupVideoProgressSaving(player) {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    const timeUpdateListener = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveWatchProgress, 5000); 
    };
    
    player.addEventListener('timeupdate', timeUpdateListener);
    player._timeUpdateListener = timeUpdateListener; /* Simpan referensi untuk dihapus */
}

/* [DIUBAH] Fungsi ini sekarang HANYA MENGISI DAFTAR EPISODE di modal video */
export function openEpisodeList(seriesId, seriesData) {
    currentSeriesId = seriesId;

    // [DIUBAH] Container diubah ke #modal-episode-list-container
    const episodeContainer = document.getElementById('modal-episode-list-container');
    if (!episodeContainer) return;
    episodeContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Memuat episode...</p>';
    
    /* [DIHAPUS] episodeListModal.classList.remove('hidden'); */

    /* Gunakan seriesCollRef global */
    const episodesCollRef = collection(db, 'series', seriesId, 'episodes'); 
    const q = query(episodesCollRef, orderBy("title", "asc")); 

    onSnapshot(q, (snapshot) => {
        episodeContainer.innerHTML = '';
        if (snapshot.empty) {
            episodeContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Belum ada episode.</p>';
            return;
        }

        let episodesList = [];
        snapshot.forEach(doc => {
            episodesList.push({ id: doc.id, data: doc.data() });
        });

        episodesList.forEach(item => {
            const episode = item.data;
            const episodeId = item.id;
            
            const progressData = getWatchProgress(episodeId);
            const isWatched = progressData.watched;
            // [BARU] Cek apakah episode ini sedang diputar
            const isPlaying = (currentItem && currentItem.episodeId === episodeId);
            
            const watchedIcon = isWatched 
                ? `<svg class="w-4 h-4 ml-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`
                : '';

            const episodeEl = document.createElement('button');
            // [DIUBAH] Styling diubah agar lebih kecil dan menambahkan kelas/data-id
            episodeEl.className = `block w-full text-left p-2 rounded-md transition flex justify-between items-center episode-list-button ${isPlaying ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`;
            episodeEl.dataset.episodeId = episodeId; // [BARU]
            
            episodeEl.innerHTML = `
                <span class="text-sm text-gray-300 truncate">${episode.title || `(Tanpa Judul)`}</span>
                ${watchedIcon}
            `;

            const videoUrl = episode.videoFiles ? episode.videoFiles['default'] : null;

            /* [DIUBAH] Onclick sekarang memanggil playVideoInModal */
            episodeEl.onclick = () => {
                if (videoUrl) {
                    // [DIUBAH] Memanggil fungsi async dari modulnya
                    asyncFunctions.playVideoInModal(seriesData, episode, videoUrl, episodeId);
                    /* [DIHAPUS] episodeListModal.classList.add('hidden'); */
                } else {
                    console.warn('Video untuk episode ini tidak tersedia.');
                }
            };
            
            episodeContainer.appendChild(episodeEl);
        });
    }, (error) => { 
        console.error("Gagal memuat daftar episode: ", error);
        episodeContainer.innerHTML = '<p class="text-red-500">Gagal memuat daftar episode.</p>';
    });

}
