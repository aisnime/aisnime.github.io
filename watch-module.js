// [BARU] Fail ini memuatkan semua kod untuk tetingkap video dan senarai episod.
// Ia hanya dimuatkan apabila pengguna mengklik kad konten di index.html.

// Variabel global untuk modul ini
let db, seriesCollRef, settingsCollRef, auth, faviconUrl; // [DIUBAH] Tambah settingsCollRef
let collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs, updateDoc, setDoc, Timestamp, increment, limit;

let videoModal, closeModalBtn, modalMainPlayer;
let episodeListModal;
let currentSeriesId = null;
let currentItem = null;
let saveTimeout;
let watermarkImg; // [BARU] Variabel untuk watermark

// 1. Fungsi Inisialisasi
// Fungsi ini dipanggil oleh index.html untuk 'menyuntik' referensi database
export function initWatchModule(firebaseRefs) {
    db = firebaseRefs.db;
    seriesCollRef = firebaseRefs.seriesCollRef;
    settingsCollRef = firebaseRefs.settingsCollRef; // [DIUBAH] Terima settingsCollRef
    auth = firebaseRefs.auth;
    faviconUrl = firebaseRefs.faviconUrl;
    
    // Salin semua fungsi firestore
    collection = firebaseRefs.collection;
    query = firebaseRefs.query;
    where = firebaseRefs.where;
    orderBy = firebaseRefs.orderBy;
    onSnapshot = firebaseRefs.onSnapshot;
    doc = firebaseRefs.doc;
    getDoc = firebaseRefs.getDoc;
    getDocs = firebaseRefs.getDocs;
    updateDoc = firebaseRefs.updateDoc;
    setDoc = firebaseRefs.setDoc;
    Timestamp = firebaseRefs.Timestamp;
    increment = firebaseRefs.increment;
    limit = firebaseRefs.limit;

    // Inisialisasi elemen DOM sekali saja
    videoModal = document.getElementById('video-modal');
    closeModalBtn = document.getElementById('close-modal-btn');
    modalMainPlayer = document.getElementById('modal-main-player');
    episodeListModal = document.getElementById('episode-list-modal');

    // [BARU] Buat dan tambahkan watermark
    const videoContainer = document.getElementById('video-container');
    if (videoContainer && faviconUrl) {
        watermarkImg = document.createElement('img');
        watermarkImg.id = 'video-watermark-module';
        watermarkImg.src = faviconUrl;
        watermarkImg.alt = 'Logo';
        watermarkImg.className = 'absolute top-4 right-4 w-10 h-10 object-contain opacity-70 z-10 pointer-events-none hidden';
        videoContainer.appendChild(watermarkImg);
    }
    
    // Pasang listener modal
    setupEventListeners();
    setupVideoProgressSaving();
}

// 2. Fungsi Utama (dipanggil oleh index.html)
// Kita pasang di 'window' agar index.html bisa memanggilnya
window.openEpisodeList = async (seriesId, seriesData) => {
    currentSeriesId = seriesId;

    document.getElementById('episode-list-title').textContent = seriesData.title;
    const episodeContainer = document.getElementById('episode-list-container');
    episodeContainer.innerHTML = '<p class="text-gray-400">Memuat episode...</p>';
    episodeListModal.classList.remove('hidden');

    // [DIPERBAIKI] Path koleksi episode
    const episodesCollRef = collection(db, seriesCollRef.path, seriesId, 'episodes');
    const q = query(episodesCollRef); // Hapus orderBy

    onSnapshot(q, (snapshot) => {
        episodeContainer.innerHTML = '';
        if (snapshot.empty) {
            episodeContainer.innerHTML = '<p class="text-gray-400">Belum ada episode untuk serial ini.</p>';
            return;
        }

        let episodesList = [];
        snapshot.forEach(doc => {
            episodesList.push({ id: doc.id, data: doc.data() });
        });

        // Sort manual berdasarkan judul (A-Z)
        episodesList.sort((a, b) => (a.data.title || '').localeCompare(b.data.title || ''));

        episodesList.forEach(item => {
            const episode = item.data;
            const episodeId = item.id;
            
            const progressData = getWatchProgress(episodeId);
            const isWatched = progressData.watched;
            const watchedIcon = isWatched 
                ? `<svg class="w-4 h-4 ml-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`
                : '';

            const episodeEl = document.createElement('button');
            episodeEl.className = 'block w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition flex justify-between items-center';
            
            episodeEl.innerHTML = `
                <span>
                    <span class="text-gray-300">${episode.title || `(Tanpa Judul)`}</span>
                </span>
                <span class="text-xs text-gray-400 flex items-center">
                    ${watchedIcon}
                </span>
            `;

            let videoUrl = null;
            if (episode.videoFiles && episode.videoFiles['default']) {
                videoUrl = episode.videoFiles['default'];
            } else if (episode.videoFiles && Object.keys(episode.videoFiles).length > 0) {
                videoUrl = episode.videoFiles['720p'] || episode.videoFiles[Object.keys(episode.videoFiles)[0]];
            }

            episodeEl.onclick = () => {
                if (videoUrl) {
                    playVideoInModal(seriesData, episode, videoUrl, episodeId);
                    episodeListModal.classList.add('hidden');
                } else {
                    // [DIUBAH] Ganti alert dengan console.warn
                    console.warn('Video untuk episode ini tidak tersedia.');
                }
            };
            
            episodeContainer.appendChild(episodeEl);
        });
    }, (error) => { // [BARU] Penanganan error
        console.error("Gagal memuat daftar episode:", error);
        episodeContainer.innerHTML = '<p class="text-red-400">Gagal memuat episode.</p>';
    });
}

// 3. Fungsi-fungsi Bantuan (Helper Functions)

function setupEventListeners() {
    closeModalBtn.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
    document.getElementById('close-episode-list-btn').addEventListener('click', () => {
        episodeListModal.classList.add('hidden');
    });

    const openEpisodeListHandler = () => {
        if (currentSeriesId && currentItem) { // Pastikan currentItem ada
            closeVideoModal();
            // Panggil kembali openEpisodeList (kini global)
            window.openEpisodeList(currentSeriesId, currentItem); 
        }
    };

    document.getElementById('show-episodes-btn-mobile').addEventListener('click', openEpisodeListHandler);
    document.getElementById('show-episodes-btn-desktop').addEventListener('click', openEpisodeListHandler);
}

function closeVideoModal() {
    if (watermarkImg) watermarkImg.classList.add('hidden'); // [BARU] Sembunyikan watermark
    videoModal.classList.add('hidden');
    saveWatchProgress();
    if (saveTimeout) clearTimeout(saveTimeout);
    modalMainPlayer.pause();
    modalMainPlayer.src = '';
    modalMainPlayer.poster = '';
}

async function playVideoInModal(seriesData, episodeData, videoUrl, episodeId) {
    try {
        currentItem = { ...seriesData, ...episodeData, episodeId: episodeId };
        
        if (!videoUrl) {
            console.warn("Gagal memuat video: URL tidak sah."); // [DIUBAH] Ganti alert
            return;
        }

        const loadingIcon = document.getElementById('video-loading-icon');
        loadingIcon.src = faviconUrl || 'https://placehold.co/64x64/374151/FFF?text=...';
        loadingIcon.classList.remove('hidden', 'animate-pulse');
        loadingIcon.classList.add('animate-pulse');
        
        modalMainPlayer.style.display = 'none';
        modalMainPlayer.poster = "";

        document.getElementById('modal-thumbnail').src = seriesData.thumbnailUrl;
        document.getElementById('modal-content-title').textContent = seriesData.title;
        document.getElementById('modal-content-description').textContent = seriesData.description || 'Tidak ada deskripsi.';
        document.getElementById('modal-content-rating').textContent = (seriesData.rating || 'N/A').replace(' / 10', '');
        document.getElementById('modal-content-vote').textContent = (seriesData.scored_by || 0).toLocaleString('id-ID') + ' Vote';
        document.getElementById('modal-content-episodes').textContent = `${seriesData.episodeCount || 0} Eps`;

        if (watermarkImg) watermarkImg.classList.remove('hidden'); // [BARU] Tampilkan watermark
        videoModal.classList.remove('hidden');

        // [DIPERBAIKI] Baris ini sepertinya menyebabkan error jika nama file tidak cocok
        // const fixedUrl = videoUrl.replace(/(EP)(\d{2})\.(mp4|mkv)/i, '$1 $2.$3');
        const fixedUrl = videoUrl; // Gunakan URL langsung dari database
        
        modalMainPlayer.src = fixedUrl;

        const progressData = getWatchProgress(episodeId);
        const progress = progressData.time;

        const newPlayer = modalMainPlayer.cloneNode(true);
        modalMainPlayer.parentNode.replaceChild(newPlayer, modalMainPlayer);
        modalMainPlayer = newPlayer;

        // [PENTING] Pasang listener progres di sini, SETELAH kloning
        setupVideoProgressSaving(); 

        modalMainPlayer.addEventListener('canplay', () => {
            loadingIcon.classList.add('hidden');
            modalMainPlayer.style.display = 'block';
            
            if (progress > 0) {
                modalMainPlayer.currentTime = progress;
            }
            modalMainPlayer.play().catch(e => {
                console.warn("Autoplay dicegah.", e);
            });
        }, { once: true });
        
        modalMainPlayer.addEventListener('error', (e) => {
             console.error("Video player error:", e, modalMainPlayer.error);
             loadingIcon.src = 'https://placehold.co/64x64/ef4444/FFFFFF?text=Error';
             loadingIcon.classList.remove('animate-pulse');
        }, { once: true });
        
        logVideoPlay(currentSeriesId);

    } catch (error) { console.error("Gagal memuat video:", error); }
}

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
    if (!currentItem || !currentItem.episodeId || !modalMainPlayer || !modalMainPlayer.duration) return;
    
    const episodeId = currentItem.episodeId;
    const currentTime = modalMainPlayer.currentTime;
    const duration = modalMainPlayer.duration;
    
    if (currentTime < 10) return; 

    try {
        let progressData = localStorage.getItem('aisnimeWatchProgress');
        let episodes = {};
        if (progressData) {
            episodes = JSON.parse(progressData);
        }

        let episodeProgress = getWatchProgress(episodeId);
        episodeProgress.time = currentTime;

        // [DIPERBAIKI] Tandai ditonton jika sudah 95%
        if (duration > 0 && (currentTime / duration) >= 0.95) {
            episodeProgress.watched = true;
        }
        
        episodes[episodeId] = episodeProgress;
        localStorage.setItem('aisnimeWatchProgress', JSON.stringify(episodes));
    } catch (error) {
        console.error("Gagal menyimpan progres ke localStorage:", error);
    }
}

function setupVideoProgressSaving() {
    // [DIUBAH] Pastikan modalMainPlayer ada sebelum menambah listener
    if (!modalMainPlayer) return;
    
    // Hapus listener lama jika ada (untuk menghindari duplikat)
    if (saveTimeout) clearTimeout(saveTimeout);
    
    const timeUpdateHandler = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveWatchProgress, 5000);
    };

    // Hapus listener lama sebelum menambah yang baru (terutama penting karena kloning)
    modalMainPlayer.removeEventListener('timeupdate', timeUpdateHandler);
    modalMainPlayer.addEventListener('timeupdate', timeUpdateHandler);
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
            
            // [DIPERBAIKI] Path ke dokumen series
            const seriesRef = doc(db, seriesCollRef.path, seriesId);
            await updateDoc(seriesRef, {
                viewCount: increment(1)
            });
            
            // [DIPERBAIKI] Path ke dokumen settings/analytics
            const statsRef = doc(db, settingsCollRef.path, 'analytics');
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


