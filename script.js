document.addEventListener('DOMContentLoaded', () => {
    
    const loadCategory = async (categoryName, elementId) => {
        const container = document.getElementById(elementId);
        if (!container) return;

        try {
            const jsonFile = `${categoryName}.json`;
            const response = await fetch(`data/${jsonFile}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            container.innerHTML = ''; 

            data.forEach(item => {
                const anchor = document.createElement('a');
                anchor.className = 'movie-card-link';
                anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
                
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
    
    loadCategory('movies', 'movies-list');
    loadCategory('series', 'series-list');
    loadCategory('indonesia', 'indonesia-list');

    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
