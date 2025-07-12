document.addEventListener('DOMContentLoaded', async () => {
    // ... (variabel dan fungsi unlockVideo, buildFinalUrl tetap sama) ...
    const ADSTERRA_DIRECT_LINK = "https://your-adsterra-direct-link.com/script.js";
    const streamContainer = document.getElementById('stream-container');
    const adModal = document.getElementById('ad-modal');
    const adLink = document.getElementById('ad-link');
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    if (!type || !id) { /* ... */ return; }
    const unlockVideo = () => { /* ... */ };
    adLink.href = ADSTERRA_DIRECT_LINK;
    adLink.addEventListener('click', () => { /* ... */ });
    const buildFinalUrl = (baseUrl) => { /* ... */ };


    try {
        // ... (logika fetch data tetap sama) ...
        let dataSources = [];
        if (type === 'movie') dataSources.push(fetch('data/movies.json'), fetch('data/indonesia.json'));
        else if (type === 'series') dataSources.push(fetch('data/series.json'));
        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) if (response.ok) allData.push(...await response.json());

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            const metadataHTML = `
                <div class="metadata-wrapper">
                    <div class="metadata-grid">
                        <div class="metadata-item"><strong>Pemeran</strong><span>${(contentData.cast || []).join(', ') || 'N/A'}</span></div>
                        <div class="metadata-item"><strong>Sutradara</strong><span>${contentData.director || 'N/A'}</span></div>
                        <div class="metadata-item"><strong>Kualitas</strong><span>${contentData.quality || 'N/A'}</span></div>
                        <div class="metadata-item"><strong>Subtitle</strong><span>${(contentData.subtitle || []).join(', ') || 'N/A'}</span></div>
                        <div class="metadata-item"><strong>Negara</strong><span>${contentData.country || 'N/A'}</span></div>
                    </div>
                </div>
            `;

            // --- PERBAIKAN LOGIKA TOMBOL DOWNLOAD ---
            let downloadButtonHTML = '';
            // Hanya buat tombol jika tipenya 'movie' DAN ada link download
            if (contentData.type === 'movie' && contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                const downloadUrl = `download.html?type=${contentData.type}&id=${contentData.id}`;
                downloadButtonHTML = `<a href="${downloadUrl}" class="download-page-btn"><i class="fas fa-download"></i> Download Film Ini</a>`;
            }

            if (contentData.type === 'series' && contentData.seasons) {
                // --- KONTEN SERIES (TANPA TOMBOL DOWNLOAD) ---
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-controls"><select id="season-select"></select><div id="episodes-list-container"></div></div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <div class="title-divider"></div>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                    </div>
                `;
                // ... (sisa logika series seperti playEpisode, renderEpisodes tetap sama persis)
                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');
                const playEpisode = (episodeBox) => { /* ... */ };
                const renderEpisodes = (seasonIndex) => { /* ... */ };
                contentData.seasons.forEach((season, index) => seasonSelect.add(new Option(season.season_name, index)));
                seasonSelect.addEventListener('change', (e) => renderEpisodes(e.target.value));
                renderEpisodes(0);
                
            } else {
                // --- KONTEN MOVIE (DENGAN TOMBOL DOWNLOAD) ---
                const finalMovieUrl = buildFinalUrl(contentData.streamUrl);
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="${finalMovieUrl}" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <div class="title-divider"></div>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                        ${downloadButtonHTML} 
                    </div>
                `;
                adModal.classList.add('show');
            }

        } else {
            streamContainer.innerHTML = `<p class="error">Konten tidak ditemukan.</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        streamContainer.innerHTML = `<p class="error">Gagal memuat konten.</p>`;
    }
});
