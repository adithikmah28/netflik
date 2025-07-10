document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('name');
    const currentPage = parseInt(params.get('page') || '1', 10);
    const itemsPerPage = 20;

    const titleEl = document.getElementById('category-title');
    const gridEl = document.getElementById('category-grid');
    const paginationEl = document.getElementById('pagination-controls');

    if (!categoryName) {
        titleEl.textContent = 'Kategori tidak ditemukan';
        return;
    }

    // Fungsi untuk membuat kartu film
    const createMovieCard = (item) => {
        const anchor = document.createElement('a');
        anchor.className = 'movie-card-link';
        anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
        
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
        return anchor;
    };

    // Fungsi untuk membuat tombol paginasi
    const createPageLink = (page, isActive) => {
        const link = document.createElement('a');
        link.className = `page-link ${isActive ? 'active' : ''}`;
        link.href = `category.html?name=${categoryName}&page=${page}`;
        link.textContent = page;
        return link;
    };

    try {
        const response = await fetch(`data/${categoryName}.json`);
        if (!response.ok) throw new Error('Data tidak ditemukan');
        const allData = await response.json();

        // Set judul halaman
        const formattedTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        titleEl.textContent = formattedTitle;
        document.title = `${formattedTitle} - Netflik`;

        // Logika Paginasi
        const totalItems = allData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allData.slice(startIndex, endIndex);

        // Render poster film
        gridEl.innerHTML = '';
        itemsToShow.forEach(item => gridEl.appendChild(createMovieCard(item)));

        // Render kontrol paginasi
        paginationEl.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                paginationEl.appendChild(createPageLink(i, i === currentPage));
            }
        }

    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal memuat konten.';
    }
});
