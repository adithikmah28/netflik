document.addEventListener('DOMContentLoaded', async () => {
    // --- TEMPATKAN DIRECT LINK ADSTERRA DI SINI ---
    const ADSTERRA_DIRECT_LINK = "https://your-adsterra-direct-link.com/script.js";
    // ---------------------------------------------

    const streamContainer = document.getElementById('stream-container');
    const adModal = document.getElementById('ad-modal');
    const adLink = document.getElementById('ad-link');

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
            iframe.src = iframe.dataset.src;
        }
    };
    
    adLink.href = ADSTERRA_DIRECT_LINK;
    adLink.addEventListener('click', () => {
        setTimeout(unlockVideo, 500); 
    });

    // --- FUNGSI BARU YANG LEBIH PINTAR ---
    const buildFinalUrl = (baseUrl) => {
        const paramsToAdd = "autoplay=1&modestbranding=1&rel=0";
        if (baseUrl.includes('?')) {
            // Jika sudah ada '?', gunakan '&'
            return `${baseUrl}&${paramsToAdd}`;
        } else {
            // Jika belum ada, gunakan '?'
            return `${baseUrl}?${paramsToAdd}`;
        }
    };

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

            const metadataHTML = `
                <div class="metadata-grid">
                    <div class="metadata-item"><strong>Pemeran:</strong> <span>${(contentData.cast || []).join(', ') || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Sutradara:</strong> <span>${contentData.director || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Kualitas:</strong> <span>${contentData.quality || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Subtitle:</strong> <span>${(contentData.subtitle || []).join(', ') || 'N/A'}</span></div>
                    <div class="metadata-item"><strong>Negara:</strong> <span>${contentData.country || 'N/A'}</span></div>
                </div>
            `;

            let downloadButtonHTML = '';
            if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                const downloadUrl = `download.html?type=${contentData.type}&id=${contentData.id}`;
                downloadButtonHTML = `<a href="${downloadUrl}" class="download-page-btn"><i class="fas fa-download"></i> Download Film Ini</a>`;
            }

            if (contentData.type === 'series' && contentData.seasons) {
                // KONTEN SERIES
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-controls"><select id="season-select"></select><div id="episodes-list-container"></div></div>
                    <div class="stream-details"><h1 class="stream-title">${contentData.title}</h1><p class="stream-description">${contentData.description}</p>${metadataHTML}${downloadButtonHTML}</div>
                `;
                
                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');

                const playEpisode = (episodeBox) => {
                    document.querySelectorAll('.episode-box').forEach(b => b.classList.remove('active'));
                    episodeBox.classList.add('active');
                    videoIframe.src = '';
                    // Gunakan fungsi pintar di sini
                    videoIframe.dataset.src = buildFinalUrl(episodeBox.dataset.streamUrl);
                    adModal.classList.add('show');
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
                // KONTEN MOVIE
                // Gunakan fungsi pintar di sini juga
                const finalMovieUrl = buildFinalUrl(contentData.streamUrl);
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="${finalMovieUrl}" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-details"><h1 class="stream-title">${contentData.title}</h1><p class="stream-description">${contentData.description}</p>${metadataHTML}${downloadButtonHTML}</div>
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
