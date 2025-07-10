document.addEventListener('DOMContentLoaded', async () => {
    // --- TEMPATKAN DIRECT LINK ADSTERRA DI SINI ---
    const ADSTERRA_DIRECT_LINK = "https://your-adsterra-direct-link.com/script.js";
    // ---------------------------------------------

    const streamContainer = document.getElementById('stream-container');
    const adModal = document.getElementById('ad-modal');
    const adLink = document.getElementById('ad-link');
    const adCloseBtn = document.querySelector('.ad-modal-close-btn');

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    if (!type || !id) {
        streamContainer.innerHTML = `<p class="error">Konten tidak ditemukan.</p>`;
        return;
    }

    const unlockVideo = () => {
        adModal.classList.remove('show');
        const iframe = document.getElementById('video-iframe');
        if (iframe && iframe.dataset.src) {
            iframe.src = iframe.dataset.src; // Mulai putar video
        }
    };
    
    adLink.href = ADSTERRA_DIRECT_LINK;
    adLink.addEventListener('click', () => {
        setTimeout(unlockVideo, 500);
    });

    adCloseBtn.addEventListener('click', unlockVideo);

    try {
        let dataSources = [];
        if (type === 'movie') dataSources.push(fetch('data/movies.json'), fetch('data/indonesia.json'));
        else if (type === 'series') dataSources.push(fetch('data/series.json'));
        
        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) if (response.ok) allData.push(...await response.json());

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            // --- KUNCI PERBAIKAN DI SINI ---
            // Kita buat lagi HTML untuk metadata yang sempat hilang
            const metadataHTML = `
                <div class="metadata-grid">
                    <div class="metadata-item"><strong>Pemeran:</strong> <span>${(contentData.cast || []).join(', ') || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Sutradara:</strong> <span>${contentData.director || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Kualitas:</strong> <span>${contentData.quality || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Subtitle:</strong> <span>${(contentData.subtitle || []).join(', ') || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Negara:</strong> <span>${contentData.country || 'N/A'}</span></div>
                </div>
            `;
            // --------------------------------

            if (contentData.type === 'series' && contentData.seasons) {
                // --- KONTEN SERIES ---
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-controls"><select id="season-select"></select><div id="episodes-list-container"></div></div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                    </div>
                `;
                
                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');

                const playEpisode = (episodeBox) => {
                    document.querySelectorAll('.episode-box').forEach(b => b.classList.remove('active'));
                    episodeBox.classList.add('active');
                    videoIframe.src = ''; // Kosongkan dulu
                    videoIframe.dataset.src = `${episodeBox.dataset.streamUrl}?autoplay=1&modestbranding=1&rel=0`;
                    adModal.classList.add('show'); // Tampilkan modal
                };

                const renderEpisodes = (seasonIndex) => {
                    const episodesContainer = document.getElementById('episodes-list-container');
                    episodesContainer.innerHTML = '';
                    contentData.seasons[seasonIndex].episodes.forEach(ep => {
                        const epBox = document.createElement('div');
                        epBox.className = 'episode-box';
                        epBox.textContent = ep.episode;
                        epBox.dataset.streamUrl = ep.streamUrl;
                        epBox.addEventListener('click', () => playEpisode(epBox));
                        episodesContainer.appendChild(epBox);
                    });
                };
                
                contentData.seasons.forEach((season, index) => seasonSelect.add(new Option(season.season_name, index)));
                seasonSelect.addEventListener('change', (e) => renderEpisodes(e.target.value));
                renderEpisodes(0);
                
            } else {
                // --- KONTEN MOVIE ---
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="${contentData.streamUrl}?autoplay=1&modestbranding=1&rel=0" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
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
