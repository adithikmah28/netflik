document.addEventListener('DOMContentLoaded', () => {
    
    const loadCategory = async (categoryName, elementId, limit) => {
        const container = document.getElementById(elementId);
        if (!container) return;

        try {
            const response = await fetch(`data/${categoryName}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            const itemsToShow = limit ? data.slice(0, limit) : data;
            
            container.innerHTML = ''; 

            itemsToShow.forEach(item => {
                const anchor = document.createElement('a');
                anchor.className = 'movie-card-link';
                anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
                anchor.dataset.title = item.title;

                // --- PERBAIKAN DI SINI JUGA ---
                const qualityLower = (item.quality || '').toLowerCase();
                let qualityClass = '';
                if (qualityLower === 'hd') qualityClass = 'quality-hd';
                else if (qualityLower === 'sd') qualityClass = 'quality-sd';
                else if (qualityLower === 'cam') qualityClass = 'quality-cam';
                // -----------------------------

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
                container.appendChild(anchor);
            });
        } catch (error) {
            console.error(`Gagal memuat kategori ${categoryName}:`, error);
        }
    };
    
    loadCategory('movies', 'movies-list', 10);
    loadCategory('series', 'series-list', 10);
    loadCategory('indonesia', 'indonesia-list', 10);

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
