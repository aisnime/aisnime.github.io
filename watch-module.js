// [BARU] Fail ini memuatkan semua kod untuk tetingkap video dan senarai episod.
// Ia hanya dimuatkan apabila pengguna mengklik kad konten di index.html.

// Variabel global untuk modul ini
let db, seriesCollRef, settingsCollRef, auth, faviconUrl; // [DIUBAH] Tambah settingsCollRef
let collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs, updateDoc, setDoc, Timestamp, increment, limit;

let videoModal, closeModalBtn, modalMainPlayer, videoContainer; // [DIUBAH] Tambah videoContainer
let episodeListModal;
let currentSeriesId = null;
let currentItem = null;
let saveTimeout;
let watermarkEl = null; // [BARU] Variabel untuk watermark

// [BARU] Variabel untuk kontrol kustom
let customControls, playPauseBtn, playIcon, pauseIcon, progressBar, timeDisplay, fullscreenBtn, fullscreenEnterIcon, fullscreenExitIcon;

// 1. Fungsi Inisialisasi
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

    // Inisialisasi elemen DOM Modal
    videoModal = document.getElementById('video-modal');
    closeModalBtn = document.getElementById('close-modal-btn');
    modalMainPlayer = document.getElementById('modal-main-player');
    videoContainer = document.getElementById('video-container');
    episodeListModal = document.getElementById('episode-list-modal');
    
    // [BARU] Inisialisasi elemen Kontrol Kustom
    customControls = document.getElementById('custom-controls-container');
    playPauseBtn = document.getElementById('play-pause-btn');
    playIcon = document.getElementById('play-icon');
    pauseIcon = document.getElementById('pause-icon');
    progressBar = document.getElementById('progress-bar');
    timeDisplay = document.getElementById('time-display');
    fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenEnterIcon = document.getElementById('fullscreen-enter-icon');
    fullscreenExitIcon = document.getElementById('fullscreen-exit-icon');
    
    // Pasang listener modal
    setupModalEventListeners();
    // [DIUBAH] Panggil setup untuk kontrol kustom
    setupCustomVideoControls();
}

// 2. Fungsi Utama (dipanggil oleh index.html)
window.openEpisodeList = async (seriesId, seriesData) => {
    currentSeriesId = seriesId;

    document.getElementById('episode-list-title').textContent = seriesData.title;
    const episodeContainer = document.getElementById('episode-list-container');
    episodeContainer.innerHTML = '<p class="text-gray-400">Memuat episode...</p>';
    episodeListModal.classList.remove('hidden');

    const episodesCollRef = collection(db, 'series', seriesId, 'episodes');
    const q = query(episodesCollRef); 

    try {
        const snapshot = await getDocs(q); // [DIUBAH] Gunakan getDocs alih-alih onSnapshot untuk daftar statis
        
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
                    console.warn('Video untuk episode ini tidak tersedia.');
                }
            };
            
            episodeContainer.appendChild(episodeEl);
        });
    } catch (error) {
        console.error("Gagal memuat episode list:", error);
        episodeContainer.innerHTML = '<p class="text-red-500">Gagal memuat episode.</p>';
    }
}

// 3. Fungsi-fungsi Bantuan (Helper Functions)

function setupModalEventListeners() {
    closeModalBtn.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
    document.getElementById('close-episode-list-btn').addEventListener('click', () => {
        episodeListModal.classList.add('hidden');
    });

    const openEpisodeListHandler = () => {
        if (currentSeriesId && currentItem) {
            closeVideoModal();
            window.openEpisodeList(currentSeriesId, currentItem); 
        }
    };

    document.getElementById('show-episodes-btn-mobile').addEventListener('click', openEpisodeListHandler);
    document.getElementById('show-episodes-btn-desktop').addEventListener('click', openEpisodeListHandler);
}

function closeVideoModal() {
    videoModal.classList.add('hidden');
    saveWatchProgress(); // Simpan progres terakhir
    if (saveTimeout) clearTimeout(saveTimeout);
    modalMainPlayer.pause();
    modalMainPlayer.src = '';
    modalMainPlayer.poster = '';
    // [BARU] Sembunyikan watermark saat modal ditutup
    if (watermarkEl) {
        watermarkEl.classList.add('hidden');
    }
}

async function playVideoInModal(seriesData, episodeData, videoUrl, episodeId) {
    try {
        currentItem = { ...seriesData, ...episodeData, episodeId: episodeId };
        
        if (!videoUrl) {
            console.warn("Gagal memuat video: URL tidak sah.");
            return;
        }

        const loadingIcon = document.getElementById('video-loading-icon');
        loadingIcon.src = faviconUrl || 'https://placehold.co/64x64/374151/FFF?text=...';
        loadingIcon.classList.remove('hidden', 'animate-pulse');
        loadingIcon.classList.add('animate-pulse');
        
        modalMainPlayer.style.display = 'none';
        modalMainPlayer.poster = "";

        // Set info di modal
        document.getElementById('modal-thumbnail').src = seriesData.thumbnailUrl;
        document.getElementById('modal-content-title').textContent = seriesData.title;
        document.getElementById('modal-content-description').textContent = seriesData.description || 'Tidak ada deskripsi.';
        document.getElementById('modal-content-rating').textContent = (seriesData.rating || 'N/A').replace(' / 10', '');
        document.getElementById('modal-content-vote').textContent = (seriesData.scored_by || 0).toLocaleString('id-ID') + ' Vote';
        document.getElementById('modal-content-episodes').textContent = `${seriesData.episodeCount || 0} Eps`;

        videoModal.classList.remove('hidden');

        // [DIHAPUS] Baris fixedUrl yang salah
        // const fixedUrl = videoUrl.replace(/(EP)(\d{2})\.(mp4|mkv)/i, '$1 $2.$3');
        
        modalMainPlayer.src = videoUrl; // [DIUBAH] Gunakan videoUrl langsung

        const progressData = getWatchProgress(episodeId);
        const progress = progressData.time;

        // [DIHAPUS] Kloning node dihapus, kita gunakan player yang sama
        // const newPlayer = modalMainPlayer.cloneNode(true); ...

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
        
        // [BARU] Buat atau tampilkan watermark
        createOrShowWatermark();

    } catch (error) { console.error("Gagal memuat video:", error); }
}

// [BARU] Fungsi untuk membuat watermark
function createOrShowWatermark() {
    if (!watermarkEl) {
        watermarkEl = document.createElement('img');
        watermarkEl.id = 'video-watermark-module'; // Beri ID unik
        watermarkEl.alt = 'Logo';
        // Atur style langsung (lebih robust daripada class)
        watermarkEl.style.position = 'absolute';
        watermarkEl.style.top = '16px';
        watermarkEl.style.right = '16px';
        watermarkEl.style.width = '40px';
        watermarkEl.style.height = '40px';
        watermarkEl.style.objectFit = 'contain';
        watermarkEl.style.opacity = '0.7';
        watermarkEl.style.zIndex = '10'; // Pastikan di atas video
        watermarkEl.style.pointerEvents = 'none'; // Abaikan klik
        
        videoContainer.appendChild(watermarkEl);
    }
    
    if (faviconUrl) {
        watermarkEl.src = faviconUrl;
        watermarkEl.classList.remove('hidden');
    } else {
        watermarkEl.classList.add('hidden');
    }
}

// [BARU] Fungsi untuk format waktu
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// [BARU] Fungsi untuk setup semua kontrol kustom
function setupCustomVideoControls() {
    if (!modalMainPlayer || !playPauseBtn) {
        console.error("Elemen kontrol video kustom tidak ditemukan.");
        return;
    }

    // 1. Tombol Play/Pause
    const togglePlay = () => {
        if (modalMainPlayer.paused) {
            modalMainPlayer.play();
        } else {
            modalMainPlayer.pause();
        }
    };
    playPauseBtn.addEventListener('click', togglePlay);
    modalMainPlayer.addEventListener('click', togglePlay); // Klik video untuk play/pause

    // 2. Update Ikon Play/Pause
    modalMainPlayer.addEventListener('play', () => {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    });
    modalMainPlayer.addEventListener('pause', () => {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    });

    // 3. Update Progress Bar dan Waktu
    modalMainPlayer.addEventListener('timeupdate', () => {
        if (modalMainPlayer.duration) {
            const progressPercent = (modalMainPlayer.currentTime / modalMainPlayer.duration) * 100;
            progressBar.value = progressPercent;
            timeDisplay.textContent = `${formatTime(modalMainPlayer.currentTime)} / ${formatTime(modalMainPlayer.duration)}`;
        }
        
        // Simpan progres saat video berjalan
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveWatchProgress, 5000);
    });

    // 4. Seek (mencari) menggunakan Progress Bar
    progressBar.addEventListener('input', () => {
        if (modalMainPlayer.duration) {
            const seekTime = (progressBar.value / 100) * modalMainPlayer.duration;
            modalMainPlayer.currentTime = seekTime;
        }
    });

    // 5. Tombol Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // Targetkan #video-container, BUKAN modalMainPlayer
            videoContainer.requestFullscreen().catch(err => {
                console.error(`Gagal masuk fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // 6. Update Ikon Fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement === videoContainer) {
            fullscreenEnterIcon.classList.add('hidden');
            fullscreenExitIcon.classList.remove('hidden');
        } else {
            fullscreenEnterIcon.classList.remove('hidden');
            fullscreenExitIcon.classList.add('hidden');
        }
    });
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
    if (!currentItem || !currentItem.episodeId || !modalMainPlayer || isNaN(modalMainPlayer.currentTime) || isNaN(modalMainPlayer.duration)) return;
    
    const episodeId = currentItem.episodeId;
    const currentTime = modalMainPlayer.currentTime;
    const duration = modalMainPlayer.duration;
    
    if (currentTime < 10 || duration <= 0) return; 

    try {
        let progressData = localStorage.getItem('aisnimeWatchProgress');
        let episodes = {};
        if (progressData) {
            episodes = JSON.parse(progressData);
        }

        let episodeProgress = getWatchProgress(episodeId);
        episodeProgress.time = currentTime;

        // [DIUBAH] Tandai ditonton jika sudah 95%
        if ((currentTime / duration) >= 0.95) {
            episodeProgress.watched = true;
        }
        
        episodes[episodeId] = episodeProgress;
        localStorage.setItem('aisnimeWatchProgress', JSON.stringify(episodes));
    } catch (error) {
        console.error("Gagal menyimpan progres ke localStorage:", error);
    }
}

// [DIHAPUS] setupVideoProgressSaving() (logika dipindah ke 'timeupdate' di setupCustomVideoControls)

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
            
            const seriesRef = doc(seriesCollRef, seriesId); // [DIUBAH] Gunakan ref yang benar
            await updateDoc(seriesRef, {
                viewCount: increment(1)
            });
            
            const statsRef = doc(settingsCollRef, 'analytics'); // [DIUBAH] Gunakan ref yang benar
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

