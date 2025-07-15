document.addEventListener('DOMContentLoaded', () => {
    // --- TEMPATKAN KUNCI API TMDB DI SINI ---
    const TMDB_API_KEY = 'GANTI_DENGAN_KUNCI_API_V3_MILIKMU';
    // ------------------------------------------

    // --- BAGIAN 1: LOGIKA UMUM UNTUK SEMUA HALAMAN ---
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');
    
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }

    if (searchIcon && header) {
        const searchInputForIcon = document.getElementById('search-input');
        searchIcon.addEventListener('click', () => {
            header.classList.toggle('search-active');
            if (header.classList.contains('search-active') && searchInputForIcon) {
                searchInputForIcon.focus();
            }
        });
    }

    // --- BAGIAN 2: LOGIKA KHUSUS HANYA UNTUK HALAMAN UTAMA ---
    const defaultRowsContainer = document.getElementById('default-rows');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (defaultRowsContainer && searchResultsContainer) {

        let allContent = []; // Variabel untuk menyimpan semua data dari JSON-mu
        
        const searchInput = document.getElementById('search-input');
        const searchResultsGrid = document.getElementById('search-results-grid');
        const searchResultsTitle = document.getElementById('search-results-title');
        const searchLoading = document.getElementById('search-loading');

        // Fungsi untuk membuat kartu film (tidak berubah)
        const createMovieCard = (item) => {
            const anchor = document.createElement('a');
            anchor.className = 'movie-card-link';
            anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
            const qualityLower = (item.quality || '').toLowerCase();
            let qualityClass = '';
            if (qualityLower === 'hd') qualityClass = 'quality-hd';
            else if (qualityLower === 'sd') qualityClass = 'quality-sd';
            else if (qualityLower === 'cam') qualityClass = 'quality-cam';
            anchor.innerHTML = `
                <div class="poster-wrapper"><img src="${item.posterUrl}" alt="${item.title}" loading="lazy"><div class="movie-card-info">${ qualityClass ? `<span class="quality-badge ${qualityClass}">${item.quality}</span>` : '' }<span class="rating-badge"><i class="fas fa-star"></i> ${item.rating || 'N/A'}</span></div></div>
                <h3 class="movie-title">${item.title}</h3>
            `;
            return anchor;
        };
        
        // Fungsi untuk menampilkan hasil pencarian (tidak berubah)
        const renderSearchResults = (results) => {
            searchResultsGrid.innerHTML = '';
            if (results.length === 0) {
                searchResultsTitle.textContent = 'Tidak ada hasil ditemukan';
            } else {
                searchResultsTitle.textContent = `Hasil Pencarian (${results.length})`;
                results.forEach(item => searchResultsGrid.appendChild(createMovieCard(item)));
            }
        };

        // Fungsi untuk memuat semua data internal SEKALI SAJA
        const loadAllInternalContent = async () => {
            if (allContent.length > 0) return; // Jika sudah dimuat, jangan ulangi
            try {
                const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                    fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')
                ]);
                const movies = await moviesRes.json();
                const series = await seriesRes.json();
                const indonesia = await indonesiaRes.json();
                allContent = [...movies, ...series, ...indonesia];
            } catch (error) {
                console.error("Gagal memuat data internal:", error);
            }
        };

        // Fungsi untuk menampilkan preview di halaman utama
        const loadPreviews = () => {
            const moviesData = allContent.filter(i => i.type === 'movie' && i.country !== 'Indonesia');
            const seriesData = allContent.filter(i => i.type === 'series');
            const indonesiaData = allContent.filter(i => i.country === 'Indonesia');

            const movieContainer = document.getElementById('movies-list');
            const seriesContainer = document.getElementById('series-list');
            const indonesiaContainer = document.getElementById('indonesia-list');

            moviesData.slice(0, 10).forEach(item => movieContainer.appendChild(createMovieCard(item)));
            seriesData.slice(0, 10).forEach(item => seriesContainer.appendChild(createMovieCard(item)));
            indonesiaData.slice(0, 10).forEach(item => indonesiaContainer.appendChild(createMovieCard(item)));
        };

        // Fungsi Trending yang sudah diperbaiki
        const loadTrending = async () => {
            const container = document.getElementById('trending-list');
            if (!container) return;

            const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                const trendingTitles = data.results.map(item => (item.title || item.name).toLowerCase());
                
                // Cari di koleksi internal kita
                const ourTrendingMovies = allContent.filter(item => {
                    const titleWithoutYear = item.title.replace(/\s\(\d{4}\)/, '').toLowerCase();
                    // Pencocokan yang lebih fleksibel
                    return trendingTitles.some(trendingTitle => 
                        titleWithoutYear.includes(trendingTitle) || trendingTitle.includes(titleWithoutYear)
                    );
                });
                
                container.innerHTML = '';
                if (ourTrendingMovies.length > 0) {
                    ourTrendingMovies.slice(0, 10).forEach(item => {
                        container.appendChild(createMovieCard(item));
                    });
                } else {
                    container.innerHTML = '<p style="color: #ccc; padding-left: 5%;">Belum ada film trending di koleksi kami.</p>';
                }
            } catch (error) {
                console.error("Gagal memuat data trending:", error);
                container.innerHTML = '<p style="color: #ccc; padding-left: 5%;">Gagal memuat trending.</p>';
            }
        };

        // Logika Pencarian yang menggunakan `allContent`
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                if (searchTerm.length > 0) {
                    defaultRowsContainer.style.display = 'none';
                    searchResultsContainer.style.display = 'block';
                    const filteredResults = allContent.filter(item => 
                        item.title.toLowerCase().includes(searchTerm)
                    );
                    renderSearchResults(filteredResults);
                } else {
                    defaultRowsContainer.style.display = 'block';
                    searchResultsContainer.style.display = 'none';
                }
            });
        }
        
        // --- PROSES UTAMA SAAT HALAMAN DIBUKA ---
        const initializeApp = async () => {
            await loadAllInternalContent(); // 1. Muat semua data dari JSON ke memori
            loadPreviews();                 // 2. Tampilkan preview 10 film dari data di memori
            loadTrending();                 // 3. Cari yang trending dari data di memori
        };

        initializeApp();
    }
});
