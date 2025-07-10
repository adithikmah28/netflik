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

            // Jika tipenya adalah Series
            if (contentData.type === 'series' && contentData.seasons) {
                // Tata letak HTML baru
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
                    <h1 class="stream-title">${contentData.title}</h1>
                    <p class="stream-description">${contentData.description}</p>
                `;

                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');
                const episodesContainer = document.getElementById('episodes-list-container');

                // Fungsi untuk mengganti video dan menandai episode aktif
                const playEpisode = (episodeBox) => {
                    document.querySelectorAll('.episode-box').forEach(b => b.classList.remove('active'));
                    episodeBox.classList.add('active');
                    videoIframe.src = `${episodeBox.dataset.streamUrl}?autoplay=1&modestbranding=1&rel=0`;
                };

                // Fungsi untuk merender daftar episode untuk season tertentu
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
                    // Otomatis putar episode pertama dari season yang dipilih
                    const firstEpisodeBox = episodesContainer.querySelector('.episode-box');
                    if (firstEpisodeBox) {
                        playEpisode(firstEpisodeBox);
                    }
                };

                // Isi dropdown season
                contentData.seasons.forEach((season, index) => {
                    const option = new Option(season.season_name, index);
                    seasonSelect.add(option);
                });

                // Tambahkan event listener untuk dropdown
                seasonSelect.addEventListener('change', (e) => {
                    renderEpisodes(e.target.value);
                });

                // Render episode untuk season pertama saat halaman dimuat
                renderEpisodes(0);
                
            } else { // Jika tipenya adalah Movie
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">
                        <div class="video-container">
                            <iframe src="${contentData.streamUrl}?autoplay=1&modestbranding=1&rel=0" title="${contentData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    </div>
                    <h1 class="stream-title">${contentData.title}</h1>
                    <p class="stream-description">${contentData.description}</p>
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
