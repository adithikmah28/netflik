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
            dataSources.push(fetch('data/movies.json'));
            dataSources.push(fetch('data/indonesia.json'));
        } else if (type === 'series') {
            dataSources.push(fetch('data/series.json'));
        }

        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) {
            if (!response.ok) { continue; }
            allData.push(...await response.json());
        }

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            // Jika tipenya adalah Series
            if (contentData.type === 'series' && contentData.seasons) {
                let seasonsHTML = '';
                contentData.seasons.forEach(season => {
                    let episodesHTML = '';
                    season.episodes.forEach(episode => {
                        episodesHTML += `<div class="episode-box" data-stream-url="${episode.streamUrl}">${episode.episode}</div>`;
                    });
                    seasonsHTML += `
                        <div class="season-block">
                            <h3 class="season-title">${season.season_name}</h3>
                            <div class="episodes-list">${episodesHTML}</div>
                        </div>
                    `;
                });

                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">
                        <div class="video-container">
                            <iframe id="video-iframe" src="" title="${contentData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    </div>
                    <h1 class="stream-title">${contentData.title}</h1>
                    <p class="stream-description">${contentData.description}</p>
                    <div id="seasons-list-container">${seasonsHTML}</div>
                `;

                // Logika untuk mengelola klik episode
                const videoIframe = document.getElementById('video-iframe');
                const episodeBoxes = document.querySelectorAll('.episode-box');

                // Set video pertama sebagai default
                if (episodeBoxes.length > 0) {
                    const firstEpisode = episodeBoxes[0];
                    videoIframe.src = `${firstEpisode.dataset.streamUrl}?autoplay=1&modestbranding=1&rel=0`;
                    firstEpisode.classList.add('active');
                }

                episodeBoxes.forEach(box => {
                    box.addEventListener('click', () => {
                        // Hapus kelas aktif dari semua kotak
                        episodeBoxes.forEach(b => b.classList.remove('active'));
                        // Tambahkan kelas aktif ke kotak yang diklik
                        box.classList.add('active');
                        // Ubah sumber video di iframe
                        videoIframe.src = `${box.dataset.streamUrl}?autoplay=1&modestbranding=1&rel=0`;
                    });
                });

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
