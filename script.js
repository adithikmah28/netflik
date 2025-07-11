document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: LOGIKA UMUM UNTUK SEMUA HALAMAN (HEADER, MENU) ---
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

    // --- BAGIAN 2: LOGIKA KHUSUS HANYA UNTUK HALAMAN UTAMA (index.html) ---
    const defaultRowsContainer = document.getElementById('default-rows');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (defaultRowsContainer && searchResultsContainer) {

        let allContent = []; // Awalnya kosong
        let isAllContentLoaded = false; // Penanda apakah semua data sudah di-load

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

        // Fungsi BARU untuk memuat semua data HANYA saat dibutuhkan
        const loadAllContent = async () => {
            if (isAllContentLoaded) return; // Jika sudah dimuat, jangan ulangi
            
            searchLoading.style.display = 'block';
            searchResultsGrid.innerHTML = '';

            try {
                const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                    fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')
                ]);
                
                if (!moviesRes.ok || !seriesRes.ok || !indonesiaRes.ok) throw new Error("Gagal mengambil file data.");

                const movies = await moviesRes.json();
                const series = await seriesRes.json();
                const indonesia = await indonesiaRes.json();
                
                allContent = [...movies, ...series, ...indonesia];
                isAllContentLoaded = true;
            } catch (error) {
                console.error("Gagal memuat data untuk pencarian:", error);
                searchResultsTitle.textContent = "Gagal memuat data pencarian";
            } finally {
                searchLoading.style.display = 'none';
            }
        };

        // Fungsi untuk memuat 10 film pertama untuk setiap kategori (ringan)
        const loadPreviews = async (categoryName, elementId, limit) => {
            try {
                const res = await fetch(`data/${categoryName}.json`);
                if (!res.ok) throw new Error(`File ${categoryName}.json tidak ditemukan.`);
                
                const data = await res.json();
                const container = document.getElementById(elementId);
                data.slice(0, limit).forEach(item => container.appendChild(createMovieCard(item)));
            } catch (error) {
                console.error(`Gagal memuat preview untuk ${categoryName}:`, error);
            }
        };

        // LOGIKA PENCARIAN BARU (Lazy Loading)
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();

                if (searchTerm.length > 0) {
                    defaultRowsContainer.style.display = 'none';
                    searchResultsContainer.style.display = 'block';

                    // Hanya panggil fungsi load jika data belum ada
                    await loadAllContent();

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
        
        // Jalankan pemuatan preview saat halaman dibuka
        loadPreviews('movies', 'movies-list', 10);
        loadPreviews('series', 'series-list', 10);
        loadPreviews('indonesia', 'indonesia-list', 10);
    }
});
