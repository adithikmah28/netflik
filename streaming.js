document.addEventListener('DOMContentLoaded', async () => {
    // --- TEMPATKAN DIRECT LINK ADSTERRA DI SINI ---
    const ADSTERRA_DIRECT_LINK = [
        "https://www.profitableratecpm.com/d1e5phefj?key=c3b3e824ff1d208c1679071aba6d0127",
        "https://www.profitableratecpm.com/u5xypz2u8j?key=d8afdfb1e3bdf2fb24c83cbd4739b52d",
        "https://www.profitableratecpm.com/fiwxe3xm?key=04b7f4be0a02a383fc172e4d231e5df2",
        "https://www.profitableratecpm.com/m9jcb8hgd5?key=8c28bc177e0b7d8b78e18ee16c0ba2dc",
        "https://www.profitableratecpm.com/xdz7cfckrz?key=4da66776844b84dbeb38d4fbfc6fadb9"
];
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

    // Fungsi Modal Lock (Tidak Berubah)
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

    // Fungsi URL Video (Tidak Berubah)
    const buildFinalUrl = (baseUrl) => {
        const paramsToAdd = "autoplay=1&modestbranding=1&rel=0";
        if (baseUrl.includes('?')) {
            return `${baseUrl}&${paramsToAdd}`;
        } else {
            return `${baseUrl}?${paramsToAdd}`;
        }
    };

    // Fungsi BARU untuk Notifikasi Toast
    const showToast = (message) => {
        const oldToast = document.querySelector('.notification-toast');
        if (oldToast) {
            oldToast.remove();
        }
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `<span class="icon"><i class="fas fa-exclamation-triangle"></i></span><span class="message">${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
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

            const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-');
            const createLinkList = (items, type) => !items || items.length === 0 ? 'N/A' : items.map(item => `<a href="results.html?type=${type}&q=${slugify(item)}">${item}</a>`).join(', ');
            const createSingleLink = (item, type) => !item ? 'N/A' : `<a href="results.html?type=${type}&q=${slugify(item)}">${item}</a>`;
            const metadataHTML = `
                <div class="metadata-wrapper">
                    <div class="metadata-grid">
                        <div class="metadata-item"><strong>Pemeran</strong><span>${createLinkList(contentData.cast, 'cast')}</span></div>
                        <div class="metadata-item"><strong>Sutradara</strong><span>${createSingleLink(contentData.director, 'director')}</span></div>
                        <div class="metadata-item"><strong>Genre</strong><span>${createLinkList(contentData.genre, 'genre')}</span></div>
                        <div class="metadata-item"><strong>Kualitas</strong><span>${contentData.quality || 'N/A'}</span></div>
                        <div class="metadata-item"><strong>Subtitle</strong><span>${(contentData.subtitle || []).join(', ')}</span></div>
                        <div class="metadata-item"><strong>Negara</strong><span>${createSingleLink(contentData.country, 'country')}</span></div>
                    </div>
                </div>
            `;
            
            let downloadButtonHTML = '';
            if (contentData.type === 'movie') {
                downloadButtonHTML = `<div class="download-wrapper"><button id="download-trigger-btn" class="download-page-btn"><i class="fas fa-download"></i> Download Film Ini</button></div>`;
            }
            
            let keywordsHTML = '';
            if (contentData.keywords && contentData.keywords.length > 0) {
                keywordsHTML = `<div class="keyword-tags">${contentData.keywords.map(keyword => `<a href="results.html?type=keyword&q=${slugify(keyword)}" class="keyword-tag">${keyword}</a>`).join('')}</div>`;
            }

            const mainContentHTML = `<div class="stream-details"><h1 class="stream-title">${contentData.title}</h1><div class="title-divider"></div><p class="stream-description">${contentData.description}</p>${metadataHTML}${keywordsHTML}</div>`;

            if (contentData.type === 'series' && contentData.seasons) {
                streamContainer.innerHTML = `<div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div><div class="stream-controls"><select id="season-select"></select><div id="episodes-list-container"></div></div>${mainContentHTML}`;
                
                const videoIframe = document.getElementById('video-iframe');
                const seasonSelect = document.getElementById('season-select');
                const episodesContainer = document.getElementById('episodes-list-container');
                const playEpisode = (episodeBox) => {
                    document.querySelectorAll('.episode-box').forEach(b => b.classList.remove('active'));
                    episodeBox.classList.add('active');
                    videoIframe.src = ''; 
                    videoIframe.dataset.src = buildFinalUrl(episodeBox.dataset.streamUrl);
                    adModal.classList.add('show');
                };
                const renderAndPlayFirstEpisode = (seasonIndex) => {
                    episodesContainer.innerHTML = '';
                    const season = contentData.seasons[seasonIndex];
                    if (!season || !season.episodes) return;
                    season.episodes.forEach(ep => {
                        const epBox = document.createElement('div');
                        epBox.className = 'episode-box'; epBox.textContent = ep.episode; epBox.dataset.streamUrl = ep.streamUrl;
                        epBox.addEventListener('click', () => playEpisode(epBox));
                        episodesContainer.appendChild(epBox);
                    });
                    const firstEpisodeBox = episodesContainer.querySelector('.episode-box');
                    if (firstEpisodeBox) { playEpisode(firstEpisodeBox); }
                };
                contentData.seasons.forEach((season, index) => seasonSelect.add(new Option(season.season_name, index)));
                seasonSelect.addEventListener('change', (e) => { renderAndPlayFirstEpisode(e.target.value); });
                renderAndPlayFirstEpisode(0);
                
            } else {
                const finalMovieUrl = buildFinalUrl(contentData.streamUrl);
                streamContainer.innerHTML = `<div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="${finalMovieUrl}" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>${downloadButtonHTML}${mainContentHTML}`;
                adModal.classList.add('show');
            }

            const downloadTriggerBtn = document.getElementById('download-trigger-btn');
            if(downloadTriggerBtn) {
                downloadTriggerBtn.addEventListener('click', () => {
                    if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                        const downloadUrl = `download.html?type=${contentData.type}&id=${contentData.id}`;
                        window.location.href = downloadUrl;
                    } else {
                        showToast('Konten belum tersedia untuk diunduh.');
                    }
                });
            }

        } else {
            streamContainer.innerHTML = `<p class="error">Konten tidak ditemukan.</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        streamContainer.innerHTML = `<p class="error">Gagal memuat konten.</p>`;
    }
});
