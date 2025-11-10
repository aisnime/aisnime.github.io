/* --- [BARU] Impor Firebase dari file init --- */
import { 
    db, auth, signInAnonymously,
    seriesCollRef, settingsCollRef, contentRowsCollRef, reportsCollRef, navLinksCollRef,
    collection, query, where, orderBy, onSnapshot, 
    doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, 
    Timestamp, increment, limit, addDoc,
    arrayUnion, arrayRemove
} from './firebase-init.js';

/* --- [BARU] Semua variabel global dipindahkan ke sini --- */
let contentListEl, mainLogoImg, mainTitleText, contentRowsContainer; 
let mainLogoUrl = ''; 
let allSeriesContent = [];
let filteredSeriesContent = []; 
let isLoadingMore = false;
let isSearching = false;
let currentDisplayCount = 0;
const MOBILE_LIMIT = 6; // [DIUBAH] Diubah dari 4 menjadi 6
const DESKTOP_LIMIT = 10; 
let chatCollRef = null;
let currentUserId = null;
let chatUnsubscribe = null; 
let blockedWordsList = [];
let faviconUrl = '';
let isWatchModuleLoaded = false;
let genreSidebar, genreOverlay, openGenreBtn, closeGenreBtn, genreListMobile, genreListDesktop;
let allGenres = new Set();
let activeGenre = 'All';

let videoModal, closeModalBtn, modalMainPlayer, videoContainer;
let currentSeriesId = null;
let currentItem = null;
let saveTimeout;
let watermarkEl = null; 

/* --- [DARI PENGGUNA] Fungsi Async --- */
async function main() {
    try {
        contentListEl = document.getElementById('content-list');
        contentRowsContainer = document.getElementById('content-rows-container'); 
        mainLogoImg = document.getElementById('main-logo');
        mainTitleText = document.getElementById('main-title-text');
        genreSidebar = document.getElementById('genre-sidebar');
        genreOverlay = document.getElementById('genre-overlay');
        openGenreBtn = document.getElementById('open-genre-btn');
        closeGenreBtn = document.getElementById('close-genre-btn');
        genreListMobile = document.getElementById('genre-list-mobile');
        genreListDesktop = document.getElementById('genre-list-desktop');

        /* --- Firebase Auth --- */
        try {
            await signInAnonymously(auth);
        } catch (authError) {
            console.error(`Autentikasi Gagal: ${authError.message}`); 
            const loadingMsg = document.getElementById('loading-overlay').querySelector('p');
            loadingMsg.textContent = "Gagal terhubung ke server autentikasi. Pastikan domain ini telah diizinkan di Firebase Auth.";
            loadingMsg.classList.add("text-red-500", "p-4");
            return; 
        }
        currentUserId = auth.currentUser?.uid || crypto.randomUUID();
        
        await loadSettings();
        logPageView(); 
        setupChat(); 
        setupReportModal();
        handleDeepLink();
        loadDynamicNavLinks(); // [BARU]
    } catch(e) { 
        console.error(`Initialization failed: ${e.message}`); 
        document.body.innerHTML = `<div class="bg-red-900 text-white p-8 rounded-lg shadow-2xl max-w-2xl mx-auto mt-20"><h1 class="text-3xl font-bold mb-4">Koneksi Gagal!</h1><p>Gagal terhubung ke server.</p></div>`;
    }
}

async function loadSettings() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingFavicon = document.getElementById('loading-favicon');
    const bottomNavFavicon = document.getElementById('bottom-nav-favicon'); // [BARU]

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const accessCode = urlParams.get('code');

        const faviconSnap = await getDoc(doc(settingsCollRef, 'favicon'));
        if (faviconSnap.exists() && faviconSnap.data().url) {
            faviconUrl = faviconSnap.data().url; 
            document.getElementById('favicon').href = faviconUrl; 
            loadingFavicon.src = faviconUrl;
            if (bottomNavFavicon) bottomNavFavicon.src = faviconUrl; // [BARU]
        }
        
        /* [DIUBAH] 'headerPosters' dihapus */
        const settingsKeys = ['background', 'mainLogo', 'maintenanceMode', 'censorship'];
        const promises = settingsKeys.map(key => getDoc(doc(settingsCollRef, key)));
        /* [DIUBAH] headerPostersSnap dihapus */
        const [backgroundSnap, mainLogoSnap, maintenanceSnap, censorSnap] = await Promise.all(promises);
        
        if (censorSnap.exists() && censorSnap.data().blockedWords) {
            blockedWordsList = censorSnap.data().blockedWords;
        }

        const maintenanceMode = maintenanceSnap.exists() && maintenanceSnap.data().status === 1;
        const mainContent = document.getElementById('main-content');
        const maintenanceOverlay = document.getElementById('maintenance-overlay');

        if (backgroundSnap.exists() && backgroundSnap.data().url) {
            document.body.style.backgroundImage = `url('${backgroundSnap.data().url}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }

        if (maintenanceMode && accessCode !== '3396') {
            mainContent.classList.add('hidden');
            maintenanceOverlay.classList.remove('hidden');
            if (faviconSnap.exists() && faviconSnap.data().url) {
                document.getElementById('maintenance-logo').src = faviconSnap.data().url;
            }
            loadingOverlay.classList.add('hidden');
        } else {
            maintenanceOverlay.classList.add('hidden');
            
            // [BARU] Dapatkan referensi elemen mobile
            const mainLogoImgMobile = document.getElementById('main-logo-mobile');
            const mainTitleTextMobile = document.getElementById('main-title-text-mobile');

            if (mainLogoImg && mainLogoSnap.exists() && mainLogoSnap.data().url) {
                mainLogoUrl = mainLogoSnap.data().url; 
                mainLogoImg.src = mainLogoUrl; 
                mainLogoImg.classList.remove('hidden');
                mainTitleText.classList.add('hidden');

                if (mainLogoImgMobile) { mainLogoImgMobile.src = mainLogoUrl; mainLogoImgMobile.classList.remove('hidden'); } // [BARU]
                if (mainTitleTextMobile) mainTitleTextMobile.classList.add('hidden'); // [BARU]
            } else {
                mainTitleText.textContent = "AISNIME"; 
                mainTitleText.classList.remove('hidden');
                mainLogoImg.classList.add('hidden');
                
                if (mainTitleTextMobile) { mainTitleTextMobile.textContent = "AISNIME"; mainTitleTextMobile.classList.remove('hidden'); } // [BARU]
                if (mainLogoImgMobile) mainLogoImgMobile.classList.add('hidden'); // [BARU]
                
                console.warn(`Logo utama tidak ditemukan. Snap exists: ${mainLogoSnap.exists()}`); 
            }
            
            /* [DIHAPUS] Semua logika slider poster header telah dihapus */
            
            loadInitialContent();
            loadCustomContentRows(); 
            setupSearchListener();
            setupEventListeners(); 
            
            loadingOverlay.classList.add('hidden');
            mainContent.classList.remove('hidden');
        }

    } catch (error) { 
        console.error(`Gagal memuat pengaturan: ${error.message}`); 
        loadingFavicon.src = 'https://placehold.co/64x64/ef4444/FFFFFF?text=Error';
        loadingFavicon.classList.remove('animate-pulse');
        document.getElementById('loading-overlay').querySelector('p').textContent = "Gagal memuat pengaturan. Coba refresh.";
    }
}

async function loadCustomContentRows() {
    const q = query(contentRowsCollRef, orderBy("order", "asc"));
    try {
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
            const rowData = docSnap.data();
            const seriesIds = rowData.seriesIds || [];
            if (seriesIds.length > 0) {
                // Ambil detail untuk setiap serial dalam baris
                const seriesPromises = seriesIds.map(id => getDoc(doc(seriesCollRef, id)));
                const seriesDocs = await Promise.all(seriesPromises);
                
                const rowSeriesContent = seriesDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({ id: doc.id, data: doc.data() }));

                if (rowSeriesContent.length > 0) {
                    renderCustomRow(rowData.title, rowSeriesContent);
                }
            }
        }
    } catch (error) {
        console.error("Gagal memuat baris konten kustom:", error);
    }
}

async function loadDynamicNavLinks() {
    const container = document.getElementById('dynamic-nav-links');
    if (!container) return;
    
    container.innerHTML = ''; // Kosongkan
    const q = query(navLinksCollRef, orderBy("order", "asc"));
    try {
        const snapshot = await getDocs(q);
        
        const genreFilter = document.getElementById('genre-filter-desktop');
        if (snapshot.empty) {
            // [DIUBAH] Sembunyikan kontainer dan border-top di elemen berikutnya
            container.style.display = 'none';
            if(genreFilter) genreFilter.classList.remove('pt-4', 'border-t');
            return;
        }
        
        // [DIUBAH] Pastikan border-top terlihat jika ada link
        if(genreFilter) genreFilter.classList.add('pt-4', 'border-t');
        
        snapshot.forEach(docSnap => {
            const linkData = docSnap.data();
            const linkEl = document.createElement('a');
            linkEl.href = linkData.url;
            linkEl.target = "_blank"; // Selalu buka di tab baru
            linkEl.rel = "noopener noreferrer";
            linkEl.className = "relative group block p-2 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors flex justify-center"; // [DIUBAH]
            
            // [DIUBAH] Ikon dan Tooltip
            linkEl.innerHTML = `
                <svg class="w-6 h-6 flex-shrink-0 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899l4-4a4 4 0 10-5.656-5.656l-1.102 1.101"></path></svg>
                <span class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-gray-900 shadow-lg rounded-md text-sm text-white hidden lg:group-hover:block whitespace-nowrap z-50">
                    ${linkData.title}
                </span>
            `;
            container.appendChild(linkEl);
        });
    } catch (error) {
        console.error("Gagal memuat link navigasi:", error);
        container.innerHTML = '<p class="text-sm text-red-400">Gagal memuat navigasi.</p>';
    }
}

async function logPageView() {
    try {
        const hasVisited = localStorage.getItem('aisnimeVisited');
        if (!hasVisited) {
            const statsRef = doc(settingsCollRef, 'analytics');
            await setDoc(statsRef, {
                uniqueVisitors: increment(1)
            }, { merge: true });
            localStorage.setItem('aisnimeVisited', 'true');
        }
    } catch (error) {
        console.error(`Gagal mencatat kunjungan unik: ${error.message}`); 
    }
}

/* [DIKEMBALIKAN] Fungsi loadAndShowEpisodeList */
async function loadAndShowEpisodeList(seriesId, seriesData) {
    
    await ensurePlayerModuleIsLoaded(); // Pastikan pemutar siap
    
    // 1. Tampilkan modal, sembunyikan player, tampilkan loading
    videoModal.classList.remove('hidden');
    document.getElementById('video-loading-icon').style.display = 'block';
    modalMainPlayer.style.display = 'none';

    // 2. Isi info di Kolom 1 (Thumbnail) dan Baris 2 (Info)
    document.getElementById('modal-thumbnail').src = seriesData.thumbnailUrl;
    document.getElementById('modal-content-title').textContent = seriesData.title;
    document.getElementById('modal-content-description').textContent = seriesData.description || 'Tidak ada deskripsi.';
    document.getElementById('modal-content-rating').textContent = (seriesData.rating || 'N/A').replace(' / 10', '');
    document.getElementById('modal-content-vote').textContent = (seriesData.scored_by || 0).toLocaleString('id-ID') + ' Vote';
    document.getElementById('modal-content-episodes').textContent = `${seriesData.episodeCount || 0} Eps`;

    // 3. Panggil fungsi terpisah untuk mengisi Kolom 3 (Daftar Episode)
    window.openEpisodeList(seriesId, seriesData); 
}

/* [DIKEMBALIKAN] Fungsi handleDeepLink */
async function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('series');
    const episodeId = params.get('episode');

    if (seriesId && episodeId) {
        console.log(`Deep link terdeteksi: Series ${seriesId}, Episode ${episodeId}`);
        
        try {
            // 1. Pastikan modul pemutar video siap
            await ensurePlayerModuleIsLoaded();
            
            // 2. Ambil data serial dan episode
            const seriesDocRef = doc(seriesCollRef, seriesId);
            const episodeDocRef = doc(collection(db, seriesCollRef.path, seriesId, 'episodes'), episodeId);
            
            const [seriesSnap, episodeSnap] = await Promise.all([
                getDoc(seriesDocRef),
                getDoc(episodeDocRef)
            ]);

            if (!seriesSnap.exists() || !episodeSnap.exists()) {
                console.error("Gagal deep link: Serial atau episode tidak ditemukan.");
                return;
            }

            const seriesData = seriesSnap.data();
            const episodeData = episodeSnap.data();
            const videoUrl = episodeData.videoFiles ? episodeData.videoFiles['default'] : null;

            if (videoUrl) {
                // 3. Langsung panggil pemutar video (akan mengisi info)
                playVideoInModal(seriesData, episodeData, videoUrl, episodeId);
                
                // 4. [BARU] Muat juga daftar episode di Kolom 3
                window.openEpisodeList(seriesId, seriesData);
            } else {
                console.error("Gagal deep link: URL video tidak ditemukan.");
            }
            
            // 5. Bersihkan URL agar tidak memutar lagi saat di-refresh
            history.replaceState(null, '', window.location.pathname);

        } catch (error) {
            console.error("Error saat menangani deep link:", error);
        }
    }
}

/* [DIKEMBALIKAN] Fungsi ensurePlayerModuleIsLoaded */
async function ensurePlayerModuleIsLoaded() {
    if (isWatchModuleLoaded) return; // Sudah dimuat, lewati
    
    try {
        // Inisialisasi DOM pemutar video
        videoModal = document.getElementById('video-modal');
        videoContainer = document.getElementById('video-container'); 
        closeModalBtn = document.getElementById('close-modal-btn');
        modalMainPlayer = document.getElementById('modal-main-player');
        /* [DIHAPUS] episodeListModal */
        
        /* [DIHAPUS] Inisialisasi DOM Kontrol Kustom */

        // Pasang listener modal (hanya sekali)
        setupModalEventListeners();
        isWatchModuleLoaded = true;
        
    } catch (e) {
        console.error("Gagal menginisialisasi DOM pemutar video:", e);
        alert("Terjadi error saat memuat elemen pemutar video.");
    }
}

async function playVideoInModal(seriesData, episodeData, videoUrl, episodeId) {
    try {
        currentItem = { ...seriesData, ...episodeData, episodeId: episodeId };
        
        if (!videoUrl) {
            alert("Gagal memuat video: URL tidak sah.");
            return;
        }

        const loadingIcon = document.getElementById('video-loading-icon');
        /* [DIUBAH] Memprioritaskan favicon untuk logo memuat */
        loadingIcon.src = faviconUrl || mainLogoUrl || 'https://placehold.co/64x64/374151/FFF?text=...'; 
        loadingIcon.classList.remove('hidden'); // [DIUBAH] Tampilkan loading
        loadingIcon.classList.add('animate-pulse');
        
        modalMainPlayer.style.display = 'none'; // Sembunyikan player
        videoModal.classList.remove('hidden'); // Pastikan modal terlihat

        // [BARU] Sorot episode yang sedang diputar di daftar (Kolom 3)
        const allEpisodeButtons = document.querySelectorAll('#modal-episode-list-container .episode-list-button');
        allEpisodeButtons.forEach(btn => {
            if (btn.dataset.episodeId === episodeId) {
                btn.classList.add('bg-purple-600', 'text-white');
                btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            } else {
                btn.classList.remove('bg-purple-600', 'text-white');
                btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
            }
        });

        // [DIUBAH] Tetap isi info jika belum ada (untuk deep link)
        if (!document.getElementById('modal-content-title').textContent || document.getElementById('modal-content-title').textContent === "Memuat judul...") {
            document.getElementById('modal-thumbnail').src = seriesData.thumbnailUrl;
            document.getElementById('modal-content-title').textContent = seriesData.title;
            document.getElementById('modal-content-description').textContent = seriesData.description || 'Tidak ada deskripsi.';
            document.getElementById('modal-content-rating').textContent = (seriesData.rating || 'N/A').replace(' / 10', '');
            document.getElementById('modal-content-vote').textContent = (seriesData.scored_by || 0).toLocaleString('id-ID') + ' Vote';
            document.getElementById('modal-content-episodes').textContent = `${seriesData.episodeCount || 0} Eps`;
        }

        modalMainPlayer.src = videoUrl;

        const progressData = getWatchProgress(episodeId);
        const progress = progressData.time;

        createWatermark(); // [DIKEMBALIKAN] Panggil fungsi watermark
        
        /* [DIKEMBALIKAN] Listener 'canplay' sederhana */
        modalMainPlayer.addEventListener('canplay', () => {
            loadingIcon.classList.add('hidden'); // Sembunyikan loading
            modalMainPlayer.style.display = 'block'; // Tampilkan player
            if (progress > 0) {
                modalMainPlayer.currentTime = progress;
            }
            modalMainPlayer.play().catch(e => {
                console.warn("Autoplay dicegah, mulai dalam keadaan dijeda.", e);
            });
        }, { once: true });
        
        /* [DIKEMBALIKAN] Memanggil setup progres */
        setupVideoProgressSaving(modalMainPlayer);

        modalMainPlayer.addEventListener('error', (e) => {
             console.error("Video player error:", e, modalMainPlayer.error);
             loadingIcon.src = 'https://placehold.co/64x64/ef4444/FFFFFF?text=Error';
             loadingIcon.classList.remove('animate-pulse');
        }, { once: true });
        
        logVideoPlay(currentSeriesId);

    } catch (error) { console.error("Gagal memuat video:", error); }
}

async function logVideoPlay(seriesId) {
    try {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const viewTimestampsKey = 'aisnimeViewTimestamps';
        
        let timestamps = {};
        try {
            const storedTimestamps = localStorage.getItem(viewTimestampsKey);
            if (storedTimestamps) {
                timestamps = JSON.parse(storedTimestamps);
            }
        } catch (e) {
            console.error("Gagal memuat timestamps dari localStorage", e);
            timestamps = {};
        }

        const lastViewTime = timestamps[seriesId] || 0;

        if (now - lastViewTime > oneHour) {
            console.log(`Mencatat penonton baru untuk serial ${seriesId}.`);
            
            /* Gunakan seriesCollRef global */
            const seriesRef = doc(seriesCollRef, seriesId); 
            await updateDoc(seriesRef, {
                viewCount: increment(1)
            });
            
            /* Gunakan settingsCollRef global */
            const statsRef = doc(settingsCollRef, 'analytics'); 
            await setDoc(statsRef, {
                totalViews: increment(1)
            }, { merge: true });

            timestamps[seriesId] = now;
            localStorage.setItem(viewTimestampsKey, JSON.stringify(timestamps));

        } else {
             console.log(`Penonton untuk serial ${seriesId} sudah dihitung dalam 1 jam terakhir. Dilewati.`);
        }

    } catch (error) {
         console.error("Gagal mencatat pemutaran video:", error);
    }
}

/* [BARU] Fungsi untuk memutar episode terbaru */
async function playLatestEpisode(seriesId, seriesData) {
    await ensurePlayerModuleIsLoaded(); // Pastikan pemutar siap
    
    // 1. Tampilkan modal & info (seperti di loadAndShowEpisodeList)
    videoModal.classList.remove('hidden');
    document.getElementById('video-loading-icon').style.display = 'block';
    modalMainPlayer.style.display = 'none';

    document.getElementById('modal-thumbnail').src = seriesData.thumbnailUrl;
    document.getElementById('modal-content-title').textContent = seriesData.title;
    document.getElementById('modal-content-description').textContent = seriesData.description || 'Tidak ada deskripsi.';
    document.getElementById('modal-content-rating').textContent = (seriesData.rating || 'N/A').replace(' / 10', '');
    document.getElementById('modal-content-vote').textContent = (seriesData.scored_by || 0).toLocaleString('id-ID') + ' Vote';
    document.getElementById('modal-content-episodes').textContent = `${seriesData.episodeCount || 0} Eps`;

    // 2. Muat daftar episode di Kolom 3
    window.openEpisodeList(seriesId, seriesData); 

    // 3. Cari dan putar episode terbaru
    try {
        const episodesCollRef = collection(db, 'series', seriesId, 'episodes');
        // Mengambil episode dengan episodeNumber tertinggi
        const q = query(episodesCollRef, orderBy("episodeNumber", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Ditemukan, putar video ini
            const episodeDoc = snapshot.docs[0];
            const episodeData = episodeDoc.data();
            const videoUrl = episodeData.videoFiles ? episodeData.videoFiles['default'] : null;

            if (videoUrl) {
                playVideoInModal(seriesData, episodeData, videoUrl, episodeDoc.id);
            } else {
                // Episode ada tapi tidak ada link video
                console.warn("Episode terbaru ditemukan tapi tidak ada URL video.");
                document.getElementById('video-loading-icon').style.display = 'none';
            }
        } else {
            // Tidak ada episode sama sekali, sembunyikan loading
            document.getElementById('video-loading-icon').style.display = 'none';
        }
    } catch (error) {
        console.error("Gagal mengambil episode terbaru:", error);
        document.getElementById('video-loading-icon').style.display = 'none';
    }
}


/* --- [BARU] Sisa FUNGSI NON-ASYNC (Dipindahkan dari index.html) --- */

/* [DIUBAH] Fungsi ini sekarang HANYA memuat "Update Terbaru" */
function loadInitialContent() {
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

// [BARU] Fungsi untuk merender baris kustom
function renderCustomRow(title, seriesContent) {
    const rowEl = document.createElement('div');
    rowEl.className = 'custom-content-row'; // Kelas untuk disembunyikan saat filter/cari

    const gridEl = document.createElement('div');
    gridEl.className = 'grid grid-cols-1 sm:grid-cols-2 gap-6'; // [DIKEMBALIKAN] Menggunakan grid

    seriesContent.forEach(itemData => {
        const card = createSeriesCard(itemData);
        gridEl.appendChild(card);
    });

    if (seriesContent.length > 0) { /* [DIUBAH] Pengecekan */
         /* [DIUBAH] Komentar HTML diubah ke JS */
         rowEl.innerHTML = `<h2 class="text-3xl font-bold mb-6">${title.toUpperCase()}</h2>`;
         rowEl.appendChild(gridEl);
         contentRowsContainer.appendChild(rowEl);
    }
}

// [BARU] Fungsi terpusat untuk membuat kartu serial
function createSeriesCard(itemData) {
    if (!itemData.data.thumbnailUrl || !itemData.data.title) {
        console.warn(`MELEWATI item ${itemData.id}, 'thumbnailUrl' atau 'title' hilang.`); 
        return document.createDocumentFragment(); // Kembalikan elemen kosong
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
    
    /* [DIUBAH] Event listener sekarang memanggil 'playLatestEpisode' */
    itemEl.addEventListener('click', () => {
        playLatestEpisode(itemData.id, itemData.data);
    });
    return itemEl;
}

function setupSearchListener() {
    
    const handleSearchInput = (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        /* [DIUBAH] Logika pencarian sekarang menyembunyikan/menampilkan baris */
        const latestUpdatesRow = document.getElementById('latest-updates-row');
        const customRows = document.querySelectorAll('.custom-content-row');

        if (searchTerm.length > 0) {
            isSearching = true;
            // Sembunyikan semua baris kustom saat mencari
            customRows.forEach(row => row.classList.add('hidden'));
            latestUpdatesRow.classList.remove('hidden'); // Selalu cari di "Update Terbaru"

            filteredSeriesContent = allSeriesContent.filter(item => 
                item.data.title.toLowerCase().includes(searchTerm) ||
                (item.data.genre && (Array.isArray(item.data.genre) ? item.data.genre.join(', ') : item.data.genre).toLowerCase().includes(searchTerm))
            );
        } else {
            isSearching = false;
            // Tampilkan kembali baris kustom
            customRows.forEach(row => row.classList.remove('hidden'));
            latestUpdatesRow.classList.remove('hidden');
            
            filterContent(activeGenre); // Terapkan filter genre yang aktif
            return;
        }
        currentDisplayCount = 0;
        contentListEl.innerHTML = '';
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

function setupEventListeners(){
    // [DIUBAH] Target scroll sekarang adalah 'content-rows-container' di desktop
    const mainContentEl = document.getElementById('content-rows-container');
    if (mainContentEl) {
        mainContentEl.addEventListener('scroll', handleScroll);
    }
    // Fallback untuk mobile
    window.addEventListener('scroll', handleScroll);
    
    const toggleGenreSidebar = (open) => {
        if (open) {
            genreSidebar.classList.remove('-translate-x-full');
            genreOverlay.classList.remove('hidden');
        } else {
            genreSidebar.classList.add('-translate-x-full');
            genreOverlay.classList.add('hidden');
        }
    };

    openGenreBtn.addEventListener('click', () => toggleGenreSidebar(true));
    closeGenreBtn.addEventListener('click', () => toggleGenreSidebar(false));
    genreOverlay.addEventListener('click', () => toggleGenreSidebar(false));
    
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

/* [DIKEMBALIKAN] Fungsi handleScroll */
function handleScroll(e) {
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

/* [DIKEMBALIKAN] Fungsi renderMoreContent */
function renderMoreContent() {
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
        if (currentDisplayCount === 0) {
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
        contentListEl.appendChild(card);
    });

    currentDisplayCount += itemsToLoad.length;
    isLoadingMore = false;
}

/* [DIKEMBALIKAN] setupGenreFilter dan fungsi-fungsi terkaitnya */
function setupGenreFilter() {
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

    genreListMobile.innerHTML = '';
    genreListDesktop.innerHTML = '';
    
    createGenreButton('All');
    if (allGenres.size > 0) {
         Array.from(allGenres).sort().forEach(genre => {
            createGenreButton(genre);
        });
    }
    
    updateActiveGenreButtons();
}

function createGenreButton(genre) {
    const button = document.createElement('button');
    button.textContent = genre;
    // [DIUBAH] Mengubah style untuk daftar vertikal di desktop
    button.className = 'genre-btn text-xs font-medium py-1 px-3 rounded-full transition lg:w-full lg:text-left lg:rounded-md lg:px-3 lg:py-2 lg:bg-gray-600 lg:hover:bg-gray-500';
    button.dataset.genre = genre;
    
    button.addEventListener('click', () => filterContent(genre));
    
    genreListMobile.appendChild(button.cloneNode(true));
    genreListDesktop.appendChild(button.cloneNode(true));
    
    genreListMobile.lastChild.addEventListener('click', () => filterContent(genre));
    genreListDesktop.lastChild.addEventListener('click', () => filterContent(genre));
}

function filterContent(genre) {
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
        latestUpdatesRow.classList.remove('hidden');
    } else {
        isSearching = true; // Mode filter aktif
        customRows.forEach(row => row.classList.add('hidden')); // Sembunyikan
        latestUpdatesRow.classList.remove('hidden'); // Selalu tampilkan update terbaru

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
    
    genreSidebar.classList.add('-translate-x-full');
    genreOverlay.classList.add('hidden');
    
    currentDisplayCount = 0;
    contentListEl.innerHTML = '';
    renderMoreContent();
    updateActiveGenreButtons();
}

function updateActiveGenreButtons() {
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

/* --- [AKHIR] FUNGSI GENRE --- */


/* --- [MULAI] FUNGSI CHAT (HANYA SATU KALI) --- */

/* [DIUBAH] FUNGSI SENSOR CHAT */
function censorMessage(message, blocklist) {
    if (!blocklist || blocklist.length === 0) return message;
    
    let censoredText = message;
    blocklist.forEach(word => {
        // 'gi' = global (mencari semua) dan 'i' = case-insensitive (tidak peduli huruf besar/kecil)
        const regex = new RegExp(word, 'gi'); 
        censoredText = censoredText.replace(regex, (match) => '*'.repeat(match.length));
    });
    return censoredText;
}

/* [DIUBAH] FUNGSI CHAT (DENGAN SENSOR) */
function setupChat() {
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
            chatContainer.classList.remove('translate-x-full');
            chatOverlay.classList.remove('hidden');
        } else {
            chatContainer.classList.add('translate-x-full');
            chatOverlay.classList.add('hidden');
        }
    };

    openChatBtn.addEventListener('click', () => toggleChat(true));
    closeChatBtn.addEventListener('click', () => toggleChat(false));
    chatOverlay.addEventListener('click', () => toggleChat(false));
    
    // [BARU] Tambahkan listener untuk tombol nav bawah
    const bottomNavChatBtn = document.getElementById('bottom-nav-chat-btn');
    if (bottomNavChatBtn) {
        bottomNavChatBtn.addEventListener('click', () => toggleChat(true));
    }
    
    // Listener untuk kirim pesan
    chatForm.addEventListener('submit', (e) => {
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

/* --- [AKHIR] FUNGSI CHAT --- */

/* [DIKEMBALIKAN] Fungsi Modal Laporan */
function setupReportModal() {
    const openReportBtn = document.getElementById('open-report-btn'); // Tombol mobile
    const openReportBtnDesktop = document.getElementById('open-report-btn-desktop'); // [BARU] Tombol desktop
    const reportModal = document.getElementById('report-modal');
    const closeReportBtn = document.getElementById('close-report-btn');
    const reportForm = document.getElementById('report-form');
    const reportTextarea = document.getElementById('report-textarea');
    const sendReportBtn = document.getElementById('send-report-btn');
    const reportStatusMsg = document.getElementById('report-status-message');

    if(openReportBtn) openReportBtn.addEventListener('click', () => {
        reportModal.classList.remove('hidden');
    });
    
    /* [BARU] Listener untuk tombol desktop */
    if (openReportBtnDesktop) {
        openReportBtnDesktop.addEventListener('click', () => {
            reportModal.classList.remove('hidden');
        });
    }
    
    if(closeReportBtn) closeReportBtn.addEventListener('click', () => {
        reportModal.classList.add('hidden');
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
            reportStatusMsg.textContent = "Mohon jelaskan lebih detail (minimal 10 karakter).";
            return;
        }

        sendReportBtn.disabled = true;
        sendReportBtn.textContent = "Mengirim...";

        try {
            await addDoc(reportsCollRef, {
                userId: currentUserId, // Sudah didefinisikan secara global
                report: reportText,
                timestamp: Timestamp.now(),
                userAgent: navigator.userAgent, // Membantu debugging
                page: window.location.href
            });
            
            reportTextarea.value = '';
            reportStatusMsg.textContent = "Laporan terkirim. Terima kasih!";
            
            setTimeout(() => {
                reportModal.classList.add('hidden');
                reportStatusMsg.textContent = "";
            }, 2500);

        } catch (error) {
            console.error("Gagal mengirim laporan:", error);
            reportStatusMsg.textContent = "Gagal mengirim. Coba lagi nanti.";
        } finally {
            sendReportBtn.disabled = false;
            sendReportBtn.textContent = "Kirim Laporan";
        }
    });
}


/* --- [MULAI] KODE YANG DIGABUNGKAN DARI WATCH-MODULE.JS --- */

/* [DIUBAH] Fungsi ini sekarang HANYA MENGISI DAFTAR EPISODE di modal video */
/* [DIUBAH] Fungsi-fungsi helper (playVideoInModal, dll.) dipindahkan ke luar */
window.openEpisodeList = async (seriesId, seriesData) => {
    currentSeriesId = seriesId;

    // [DIUBAH] Container diubah ke #modal-episode-list-container
    const episodeContainer = document.getElementById('modal-episode-list-container');
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
                    playVideoInModal(seriesData, episode, videoUrl, episodeId);
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

/* [BARU] Fungsi-fungsi Bantuan (Helper Functions) dipindahkan ke scope global */

function setupModalEventListeners() {
    closeModalBtn.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
    /* [DIHAPUS] Listener untuk modal episode lama */
}

function closeVideoModal() {
    videoModal.classList.add('hidden');
    saveWatchProgress(); 
    if (saveTimeout) clearTimeout(saveTimeout);
    modalMainPlayer.pause();
    modalMainPlayer.src = '';
    
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
    if (modalMainPlayer._timeUpdateListener) {
        modalMainPlayer.removeEventListener('timeupdate', modalMainPlayer._timeUpdateListener);
        modalMainPlayer._timeUpdateListener = null;
    }
}

/* --- [DIHAPUS] Semua Fungsi Kontrol Kustom --- */

/* --- [DIKEMBALIKAN] Fungsi Watermark (Dengan Perbaikan) --- */
function createWatermark() {
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
    videoContainer.appendChild(watermarkEl);
}


/* --- Fungsi Simpan Progres --- */

function getWatchProgress(episodeId) {
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

function saveWatchProgress() {
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

/* [DIUBAH] setupVideoProgressSaving dipindah ke scope global */
function setupVideoProgressSaving(player) {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    const timeUpdateListener = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveWatchProgress, 5000); 
    };
    
    player.addEventListener('timeupdate', timeUpdateListener);
    player._timeUpdateListener = timeUpdateListener; /* Simpan referensi untuk dihapus */
}

/* --- [AKHIR] KODE YANG DIGABUNGKAN DARI WATCH-MODULE.JS --- */


/* [BARU] Ekspor fungsi main */
export { main };