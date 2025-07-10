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

    let allData = []; // Simpan semua data di sini untuk pencarian

    const createMovieCard = (item) => {
        const anchor = document.createElement('a');
        anchor.className = 'movie-card-link';
        anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
        anchor.dataset.title = item.title.toLowerCase(); // Penting untuk pencarian

        const qualityLower = (item.quality || '').toLowerCase();
        let qualityClass = '';
        if (qualityLower === 'hd') qualityClass = 'quality-hd';
        else if (qualityLower === 'sd') qualityClass = 'quality-sd';
        else if (qualityLower === 'cam') qualityClass = 'quality-cam';

        anchor.innerHTML = `
            <div class="poster-wrapper">
                <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                <div class="movie-card-info">
                    ${qualityClass ? `<span class="quality-badge ${qualityClass}">${item.quality}</span>` : ''}
                    <span class="rating-badge"><i class="fas fa-star"></i> ${item.rating || 'N/A'}</span>
                </div>
            </div>
            <h3 class="movie-title">${item.title}</h3>
        `;
        return anchor;
    };

    const renderPage = (pageNumber, data) => {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = data.slice(startIndex, endIndex);

        gridEl.innerHTML = '';
        if (itemsToShow.length === 0) {
            gridEl.innerHTML = '<p style="width:100%; text-align:center;">Tidak ada hasil ditemukan.</p>';
        } else {
            itemsToShow.forEach(item => gridEl.appendChild(createMovieCard(item)));
        }

        paginationEl.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const link = document.createElement('a');
                link.className = `page-link ${i === pageNumber ? 'active' : ''}`;
                link.href = '#'; // Hapus href agar tidak reload
                link.textContent = i;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderPage(i, data);
                });
                paginationEl.appendChild(link);
            }
        }
    };
    
    try {
        const response = await fetch(`data/${categoryName}.json`);
        if (!response.ok) throw new Error(`Data untuk kategori "${categoryName}" tidak ditemukan.`);
        
        allData = await response.json();

        let formattedTitle;
        if (categoryName === 'movies') formattedTitle = 'Movies';
        else if (categoryName === 'series') formattedTitle = 'Series';
        else if (categoryName === 'indonesia') formattedTitle = 'Film Indonesia';
        else formattedTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        
        titleEl.textContent = formattedTitle;
        document.title = `${formattedTitle} - Netflik`;

        renderPage(currentPage, allData);

    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal Memuat Konten';
        gridEl.innerHTML = `<p style="color: #ff9999;">${error.message}</p>`;
    }

    // --- LOGIKA PENCARIAN & UI ---
    const header = document.querySelector('.header');
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.getElementById('category-search-input');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');

    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }

    searchIcon.addEventListener('click', () => {
        header.classList.toggle('search-active');
        if (header.classList.contains('search-active')) searchInput.focus();
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = allData.filter(item => 
            item.title.toLowerCase().includes(searchTerm)
        );
        renderPage(1, filteredData); // Selalu mulai dari halaman 1 setelah search
    });
});
