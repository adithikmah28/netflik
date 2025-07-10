document.addEventListener('DOMContentLoaded', () => {
    
    const loadCategory = async (categoryName, elementId, limit) => {
        const container = document.getElementById(elementId);
        if (!container) return;

        try {
            const response = await fetch(`data/${categoryName}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Terapkan limit jika ada
            const itemsToShow = limit ? data.slice(0, limit) : data;
            
            container.innerHTML = ''; 

            itemsToShow.forEach(item => {
                const anchor = document.createElement('a');
                anchor.className = 'movie-card-link';
                anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
                anchor.dataset.title = item.title;

                let qualityClass = item.quality.toLowerCase() === 'hd' ? 'quality-hd' : item.quality.toLowerCase() === 'sd' ? 'quality-sd' : 'quality-cam';

                anchor.innerHTML = `
                    <div class="poster-wrapper">
                        <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                        <div class="movie-card-info">
                            <span class="quality-badge ${qualityClass}">${item.quality}</span>
                            <span class="rating-badge"><i class="fas fa-star"></i> ${item.rating}</span>
                        </div>
                    </div>
                    <h3 class="movie-title">${item.title}</h3>
                `;
                container.appendChild(anchor);
            });
        } catch (error) {
            console.error(`Gagal memuat kategori ${categoryName}:`, error);
        }
    };
    
    // Panggil dengan limit 10
    loadCategory('movies', 'movies-list', 10);
    loadCategory('series', 'series-list', 10);
    loadCategory('indonesia', 'indonesia-list', 10);

    // ... (sisa script untuk pencarian dan menu hamburger tetap sama) ...
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.getElementById('search-input');
    
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
    navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    searchIcon.addEventListener('click', () => {
        header.classList.toggle('search-active');
        if (header.classList.contains('search-active')) searchInput.focus();
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
            row.style.display = hasVisibleMovies ? 'block' : 'none';
        });
    });
});
