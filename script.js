document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: LOGIKA UMUM UNTUK SEMUA HALAMAN (HEADER, MENU, DLL) ---
    // Kode ini akan selalu berjalan di setiap halaman yang memuat script.js

    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');
    
    // Menambahkan pengecekan 'if' untuk setiap event listener agar aman
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
        const searchInputForIcon = document.getElementById('search-input'); // Khusus untuk ikon
        searchIcon.addEventListener('click', () => {
            header.classList.toggle('search-active');
            if (header.classList.contains('search-active') && searchInputForIcon) {
                searchInputForIcon.focus();
            }
        });
    }


    // --- BAGIAN 2: LOGIKA KHUSUS HANYA UNTUK HALAMAN UTAMA (index.html) ---
    // Kode di dalam 'if' ini hanya akan berjalan jika elemen-elemen halaman utama ditemukan.

    const defaultRowsContainer = document.getElementById('default-rows');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (defaultRowsContainer && searchResultsContainer) {

        // Semua variabel dan fungsi untuk halaman utama ada di dalam sini
        let allContent = [];
        const searchInput = document.getElementById('search-input');
        const searchResultsGrid = document.getElementById('search-results-grid');
        const searchResultsTitle = document.getElementById('search-results-title');

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
                <div class="poster-wrapper">
                    <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                    <div class="movie-card-info">
                        ${ qualityClass ? `<span class="quality-badge ${qualityClass}">${item.quality}</span>` : '' }
                        <span class="rating-badge"><i class="fas fa-star"></i> ${item.rating || 'N/A'}</span>
                    </div>
                </div>
                <h3 class="movie-title">${item.title}</h3>
            `;
            return anchor;
        };

        const renderSearchResults = (results) => {
            searchResultsGrid.innerHTML = '';
            if (results.length === 0) {
                searchResultsTitle.textContent = 'Tidak ada hasil ditemukan';
            } else {
                searchResultsTitle.textContent = `Hasil Pencarian (${results.length})`;
                results.forEach(item => searchResultsGrid.appendChild(createMovieCard(item)));
            }
        };

        const initializeApp = async () => {
            try {
                const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                    fetch('data/movies.json'),
                    fetch('data/series.json'),
                    fetch('data/indonesia.json')
                ]);
                const movies = await moviesRes.json();
                const series = await seriesRes.json();
                const indonesia = await indonesiaRes.json();
                
                allContent = [...movies, ...series, ...indonesia];

                const movieContainer = document.getElementById('movies-list');
                const seriesContainer = document.getElementById('series-list');
                const indonesiaContainer = document.getElementById('indonesia-list');

                movies.slice(0, 10).forEach(item => movieContainer.appendChild(createMovieCard(item)));
                series.slice(0, 10).forEach(item => seriesContainer.appendChild(createMovieCard(item)));
                indonesia.slice(0, 10).forEach(item => indonesiaContainer.appendChild(createMovieCard(item)));

            } catch (error) {
                console.error("Gagal memuat data awal:", error);
                document.querySelector('.movie-rows').innerHTML = '<p style="text-align:center; color: #ff9999;">Gagal memuat data film. Pastikan project dijalankan via Live Server.</p>';
            }
        };

        // Event listener untuk search input, diletakkan di dalam sini
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
        
        // Jalankan!
        initializeApp();
    }
});
