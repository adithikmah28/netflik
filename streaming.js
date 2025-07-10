document.addEventListener('DOMContentLoaded', async () => {
    const streamContainer = document.getElementById('stream-container');
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    if (!type || !id) {
        streamContainer.innerHTML = `<p class="error">Konten tidak ditemukan. Pastikan URL benar.</p>`;
        return;
    }

    try {
        let dataSources = [];
        if (type === 'movie') {
            dataSources.push(fetch('data/movies.json'), fetch('data/indonesia.json'));
        } else if (type === 'series') {
            dataSources.push(fetch('data/series.json'));
        }

        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) {
            if (response.ok) allData.push(...await response.json());
        }

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            const metadataHTML = `
                <div class="metadata-grid">
                    <div class="metadata-item"><strong>Pemeran:</strong> <span>${contentData.cast.join(', ')}</span></div>
                    <div class="metadata-item"><strong>Sutradara:</strong> <span>${contentData.director}</span></div>
                    <div class="metadata-item"><strong>Kualitas:</strong> <span>${contentData.quality}</span></div>
                    <div class="metadata-item"><strong>Subtitle:</strong> <span>${contentData.subtitle.join(', ')}</span></div>
                    <div class="metadata-item"><strong>Negara:</strong> <span>${contentData.country}</span></div>
                </div>
            `;

            if (contentData.type === 'series' && contentData.seasons) {
                // Perubahan di sini: Label 'Season:' dihapus
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">
                        <div class="video-container">
                            <iframe id="video-iframe" src="" title="${contentData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    </div>
                    <div class="stream-controls">
                        <select id="season-select"></select>
                        <div id="episodes-list-container"></div>
                    </div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                    </div>
                `;

                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');
                const episodesContainer = document.getElementById('episodes-list-container');

                const playEpisode = (episodeBox) => {
                    document.querySelectorAll('.episode-box').forEach(b => b.classList.remove('active'));
                    episodeBox.classList.add('active');
                    videoIframe.src = `${episodeBox.dataset.streamUrl}?autoplay=1&modestbranding=1&rel=0`;
                };

                const renderEpisodes = (seasonIndex) => {
                    episodesContainer.innerHTML = '';
                    const episodes = contentData.seasons[seasonIndex].episodes;
                    episodes.forEach(ep => {
                        const epBox = document.createElement('div');
                        epBox.className = 'episode-box';
                        epBox.textContent = ep.episode;
                        epBox.dataset.streamUrl = ep.streamUrl;
                        epBox.addEventListener('click', () => playEpisode(epBox));
                        episodesContainer.appendChild(epBox);
                    });
                    const firstEpisodeBox = episodesContainer.querySelector('.episode-box');
                    if (firstEpisodeBox) playEpisode(firstEpisodeBox);
                };

                contentData.seasons.forEach((season, index) => seasonSelect.add(new Option(season.season_name, index)));
                seasonSelect.addEventListener('change', (e) => renderEpisodes(e.target.value));
                renderEpisodes(0);
                
            } else {
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">
                        <div class="video-container">
                            <iframe src="${contentData.streamUrl}?autoplay=1&modestbranding=1&rel=0" title="${contentData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    </div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                    </div>
                `;
            }
        } else {
            streamContainer.innerHTML = `<p class="error">Konten dengan ID '${id}' tidak ditemukan.</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        streamContainer.innerHTML = `<p class="error">Terjadi kesalahan saat memuat konten.</p>`;
    }
});
