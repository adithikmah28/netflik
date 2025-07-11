document.addEventListener('DOMContentLoaded', () => {
    
    let allContent = []; // Variabel untuk menyimpan SEMUA data film & series

    const defaultRowsContainer = document.getElementById('default-rows');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchResultsGrid = document.getElementById('search-results-grid');
    const searchResultsTitle = document.getElementById('search-results-title');

    // Fungsi untuk membuat kartu film (bisa dipakai ulang)
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

    // Fungsi untuk menampilkan hasil pencarian
    const renderSearchResults = (results) => {
        searchResultsGrid.innerHTML = '';
        if (results.length === 0) {
            searchResultsTitle.textContent = 'Tidak ada hasil ditemukan';
        } else {
            searchResultsTitle.textContent = `Hasil Pencarian (${results.length})`;
            results.forEach(item => {
                searchResultsGrid.appendChild(createMovieCard(item));
            });
        }
    };

    // Fungsi utama yang dijalankan saat halaman dimuat
    const initializeApp = async () => {
        try {
            // 1. Ambil semua data dari semua file JSON secara bersamaan
            const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                fetch('data/movies.json'),
                fetch('data/series.json'),
                fetch('data/indonesia.json')
            ]);
            
            const movies = await moviesRes.json();
            const series = await seriesRes.json();
            const indonesia = await indonesiaRes.json();

            // 2. Gabungkan semua data ke dalam satu array
            allContent = [...movies, ...series, ...indonesia];

            // 3. Tampilkan kategori default (hanya 10 item pertama)
            const movieContainer = document.getElementById('movies-list');
            const seriesContainer = document.getElementById('series-list');
            const indonesiaContainer = document.getElementById('indonesia-list');

            movies.slice(0, 10).forEach(item => movieContainer.appendChild(createMovieCard(item)));
            series.slice(0, 10).forEach(item => seriesContainer.appendChild(createMovieCard(item)));
            indonesia.slice(0, 10).forEach(item => indonesiaContainer.appendChild(createMovieCard(item)));

        } catch (error) {
            console.error("Gagal memuat data awal:", error);
        }
    };

    // --- INTERAKTIVITAS UI (HEADER, MENU, PENCARIAN) ---
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.getElementById('search-input');
    
    // Menu & Scroll (tetap sama)
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
    navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    searchIcon.addEventListener('click', () => {
        header.classList.toggle('search-active');
        if (header.classList.contains('search-active')) searchInput.focus();
    });

    // LOGIKA PENCARIAN BARU
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm.length > 0) {
            // Jika ada teks di pencarian
            defaultRowsContainer.style.display = 'none';
            searchResultsContainer.style.display = 'block';

            const filteredResults = allContent.filter(item => 
                item.title.toLowerCase().includes(searchTerm)
            );
            renderSearchResults(filteredResults);
        } else {
            // Jika pencarian kosong
            defaultRowsContainer.style.display = 'block';
            searchResultsContainer.style.display = 'none';
        }
    });

    // Jalankan semuanya!
    initializeApp();
});
