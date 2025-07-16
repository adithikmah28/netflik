document.addEventListener('DOMContentLoaded', () => {
    // --- Kunci API & Logika Umum (Tidak Berubah) ---
    const TMDB_API_KEY = '8c79e8986ea53efac75026e541207aa3';
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    // ... dan seterusnya ...

    // --- Logika Khusus Halaman Utama (INI YANG DIPERBAIKI TOTAL) ---
    const defaultRowsContainer = document.getElementById('default-rows');
    if (defaultRowsContainer) {

        let allContent = []; // Tetap ada untuk pencarian global
        
        const searchInput = document.getElementById('search-input');
        const searchResultsGrid = document.getElementById('search-results-grid');
        const searchResultsTitle = document.getElementById('search-results-title');

        const createMovieCard = (item) => {
            // ... (Fungsi ini tidak berubah) ...
        };
        const renderSearchResults = (results) => {
            // ... (Fungsi ini tidak berubah) ...
        };

        // Fungsi yang diperbaiki untuk memuat data DARI FILE YANG BENAR
        const loadCategoryPreview = async (categoryName, elementId, limit) => {
            try {
                const response = await fetch(`data/${categoryName}.json`);
                if (!response.ok) throw new Error("File tidak ditemukan");

                const data = await response.json();
                const container = document.getElementById(elementId);
                
                // Balik urutan lalu ambil 10 pertama
                data.reverse().slice(0, limit).forEach(item => {
                    container.appendChild(createMovieCard(item));
                });
            } catch (error) {
                console.error(`Gagal memuat preview untuk ${categoryName}:`, error);
            }
        };

        const loadTrending = async () => {
            // ... (Fungsi trending tidak berubah) ...
        };

        // Fungsi utama yang BARU dan LEBIH BAIK
        const initializeApp = async () => {
            // 1. Muat SEMUA data ke memori HANYA untuk pencarian
            try {
                const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                    fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')
                ]);
                const movies = await moviesRes.json();
                const series = await seriesRes.json();
                const indonesia = await indonesiaRes.json();
                allContent = [...movies, ...series, ...indonesia];
            } catch (error) {
                console.error("Gagal memuat data untuk pencarian:", error);
            }
            
            // 2. Tampilkan preview dari file masing-masing
            loadCategoryPreview('movies', 'movies-list', 10);
            loadCategoryPreview('series', 'series-list', 10);
            loadCategoryPreview('indonesia', 'indonesia-list', 10);
            
            // 3. Tampilkan trending (setelah data pencarian siap)
            loadTrending();
        };

        // Logika untuk search input (tidak berubah, tetap pakai allContent)
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
        
        initializeApp();
    }
});
