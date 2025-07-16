document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const queryType = params.get('type');
    const queryValue = params.get('q');
    const currentPage = parseInt(params.get('page') || '1', 10);
    const itemsPerPage = 20;

    const titleEl = document.getElementById('results-title');
    const gridEl = document.getElementById('results-grid');
    const paginationEl = document.getElementById('pagination-controls');
    
    if (!titleEl || !gridEl || !paginationEl) {
        console.error("Elemen penting tidak ditemukan di halaman.");
        return;
    }

    if (!queryType || !queryValue) {
        titleEl.textContent = 'Parameter pencarian tidak valid.';
        return;
    }

    const formattedValue = queryValue.replace(/-/g, ' ');
    let titlePrefix = "Hasil untuk ";
    if (queryType === 'genre') titlePrefix = "Genre: ";
    else if (queryType === 'cast') titlePrefix = "Pemeran: ";
    else if (queryType === 'director') titlePrefix = "Sutradara: ";
    else if (queryType === 'country') titlePrefix = "Negara: ";
    else if (queryType === 'keyword') titlePrefix = "Kata Kunci: ";
    
    titleEl.textContent = `${titlePrefix}"${formattedValue}"`;
    document.title = `${titlePrefix}"${formattedValue}" - Netflik`;

    const createMovieCard = (item) => {
        const anchor = document.createElement('a');
        anchor.className = 'movie-card-link';
        anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
        const qualityLower = (item.quality || '').toLowerCase();
        let qualityClass = '';
        if (qualityLower === 'hd') qualityClass = 'quality-hd'; else if (qualityLower === 'sd') qualityClass = 'quality-sd'; else if (qualityLower === 'cam') qualityClass = 'quality-cam';
        anchor.innerHTML = `<div class="poster-wrapper"><img src="${item.posterUrl}" alt="${item.title}" loading="lazy"><div class="movie-card-info">${qualityClass ? `<span class="quality-badge ${qualityClass}">${item.quality}</span>` : ''}<span class="rating-badge"><i class="fas fa-star"></i> ${item.rating || 'N/A'}</span></div></div><h3 class="movie-title">${item.title}</h3>`;
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
                link.href = `results.html?type=${queryType}&q=${queryValue}&page=${i}`;
                link.textContent = i;
                paginationEl.appendChild(link);
            }
        }
    };

    try {
        const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')]);
        const allContent = [...(await moviesRes.json()), ...(await seriesRes.json()), ...(await indonesiaRes.json())];

        const filteredData = allContent.filter(item => {
            if (!item) return false;
            const itemType = queryType === 'keyword' ? 'keywords' : queryType;
            const targetData = item[itemType];
            if (!targetData) return false;
            if (Array.isArray(targetData)) {
                return targetData.some(val => val.toLowerCase().replace(/\s+/g, '-') === queryValue);
            } else {
                return targetData.toLowerCase().replace(/\s+/g, '-') === queryValue;
            }
        }).reverse();
        
        renderPage(currentPage, filteredData);
    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal memuat konten.';
    }
    
    const navbar = document.querySelector('.navbar'); 
    const hamburger = document.querySelector('.hamburger'); 
    const navCloseBtn = document.querySelector('.nav-close-btn');
    if (hamburger && navbar && navCloseBtn) { 
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active')); 
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active')); 
    }
});
