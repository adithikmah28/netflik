document.addEventListener('DOMContentLoaded', async () => {
    // ... (semua variabel dan fungsi di awal tetap sama) ...
    const ADSTERRA_DIRECT_LINK = "https://your-adsterra-direct-link.com/script.js";
    const streamContainer = document.getElementById('stream-container');
    const adModal = document.getElementById('ad-modal');
    // ... dan seterusnya ...

    try {
        // ... (logika fetch data tetap sama) ...
        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            const metadataHTML = `...`; // (kode metadata tetap sama)
            let downloadButtonHTML = '';
            if (contentData.type === 'movie' && /*...*/) {
                // ... (logika download button tetap sama)
            }

            // --- KODE BARU UNTUK MEMBUAT KATA KUNCI ---
            let keywordsHTML = '';
            if (contentData.keywords && contentData.keywords.length > 0) {
                keywordsHTML = `
                    <div class="keywords-section">
                        <h3>Kata Kunci</h3>
                        <div class="keyword-tags">
                            ${contentData.keywords.map(keyword => `<a href="#" class="keyword-tag">${keyword}</a>`).join('')}
                        </div>
                    </div>
                `;
            }
            // ------------------------------------------

            if (contentData.type === 'series' && contentData.seasons) {
                // KONTEN SERIES
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">...</div>
                    <div class="stream-controls">...</div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <div class="title-divider"></div>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                        ${keywordsHTML} <!-- Sisipkan di sini -->
                    </div>
                `;
                // ... (sisa logika series tetap sama)
                
            } else {
                // KONTEN MOVIE
                const finalMovieUrl = buildFinalUrl(contentData.streamUrl);
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper"><div class="video-container"><iframe id="video-iframe" data-src="${finalMovieUrl}" title="${contentData.title}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <div class="title-divider"></div>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                        ${downloadButtonHTML}
                        ${keywordsHTML} <!-- Sisipkan di sini juga -->
                    </div>
                `;
                adModal.classList.add('show');
            }
            // ... (sisa kode error handling tetap sama)
        }
    } catch (error) {
        // ...
    }
});
