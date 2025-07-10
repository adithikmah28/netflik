document.addEventListener('DOMContentLoaded', () => {
    
    // --- FUNGSI MEMUAT KATEGORI ---
    const loadCategory = async (categoryName, elementId) => {
        const container = document.getElementById(elementId);
        if (!container) return;

        try {
            const response = await fetch(`data/${categoryName}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            container.innerHTML = ''; 

            data.forEach(item => {
                const anchor = document.createElement('a');
                anchor.className = 'movie-card-link';
                anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
                anchor.dataset.title = item.title; // Penting untuk pencarian

                let qualityClass = '';
                if (item.quality === 'HD') qualityClass = 'quality-hd';
                else if (item.quality === 'SD') qualityClass = 'quality-sd';
                else if (item.quality === 'CAM') qualityClass = 'quality-cam';

                anchor.innerHTML = `
                    <div class="poster-wrapper">
                        <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                        <div class="movie-card-info">
                            <span class="quality-badge ${qualityClass}">${item.quality}</span>
                            <span class="rating-badge">
                                <i class="fas fa-star"></i> ${item.rating}
                            </span>
                        </div>
                    </div>
                    <h3 class="movie-title">${item.title}</h3>
                `;
                container.appendChild(anchor);
            });
        } catch (error) {
            console.error(`Gagal memuat kategori ${categoryName}:`, error);
            container.innerHTML = `<p style="color: #ff9999;">Gagal memuat data.</p>`;
        }
    };
    
    // Muat semua kategori
    loadCategory('movies', 'movies-list');
    loadCategory('series', 'series-list');
    loadCategory('indonesia', 'indonesia-list');

    // --- INTERAKTIVITAS UI (Pencarian & Menu) ---
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.getElementById('search-input');
    
    // Efek scroll header
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Menu Hamburger
    hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
    navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));

    // Pencarian
    searchIcon.addEventListener('click', () => {
        header.classList.toggle('search-active');
        if (header.classList.contains('search-active')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.movie-row').forEach(row => {
            let hasVisibleMovies = false;
            row.querySelectorAll('.movie-card-link').forEach(link => {
                const title = link.dataset.title.toLowerCase();
                if (title.includes(searchTerm)) {
                    link.style.display = 'block';
                    hasVisibleMovies = true;
                } else {
                    link.style.display = 'none';
                }
            });
            // Sembunyikan judul kategori jika tidak ada hasil
            row.style.display = hasVisibleMovies ? 'block' : 'none';
        });
    });
});
