document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const queryType = params.get('type');
    const queryValue = params.get('q');
    const currentPage = parseInt(params.get('page') || '1', 10);
    const itemsPerPage = 20;

    const titleEl = document.getElementById('tag-title'); // Kita akan ganti nama ID ini di HTML nanti
    const gridEl = document.getElementById('tag-grid');
    const paginationEl = document.getElementById('pagination-controls');

    if (!queryType || !queryValue) {
        titleEl.textContent = 'Parameter tidak valid';
        return;
    }

    const formattedValue = queryValue.replace(/-/g, ' ');

    // Judul dinamis berdasarkan tipe pencarian
    let titlePrefix = "Hasil untuk ";
    if (queryType === 'genre') titlePrefix = "Genre: ";
    else if (queryType === 'cast') titlePrefix = "Pemeran: ";
    else if (queryType === 'director') titlePrefix = "Sutradara: ";
    else if (queryType === 'country') titlePrefix = "Negara: ";
    else if (queryType === 'keyword') titlePrefix = "Kata Kunci: ";
    
    titleEl.textContent = `${titlePrefix}"${formattedValue}"`;
    document.title = `${titlePrefix}"${formattedValue}" - Netflik`;

    const createMovieCard = (item) => { /* ... salin dari versi sebelumnya, tidak berubah ... */ };
    const renderPage = (pageNumber, data) => { /* ... salin dari versi sebelumnya, tapi update link paginasi ... */ };

    try {
        const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
            fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')
        ]);
        const allContent = [...(await moviesRes.json()), ...(await seriesRes.json()), ...(await indonesiaRes.json())];

        // Logika filter dinamis
        const filteredData = allContent.filter(item => {
            if (!item) return false;
            switch (queryType) {
                case 'genre':
                case 'keywords':
                case 'cast':
                    // Untuk array (pemeran, genre, keywords)
                    return item[queryType] && item[queryType].some(val => val.toLowerCase().replace(/\s+/g, '-') === queryValue);
                case 'director':
                case 'country':
                    // Untuk string tunggal (sutradara, negara)
                    return item[queryType] && item[queryType].toLowerCase().replace(/\s+/g, '-') === queryValue;
                default:
                    return false;
            }
        });
        
        renderPage(currentPage, filteredData);

    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal memuat konten.';
    }
});
