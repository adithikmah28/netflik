document.addEventListener('DOMContentLoaded', async () => {
    // ... (semua kode dari awal sampai 'adCloseBtn.addEventListener' tetap sama) ...
    // ...

    try {
        // ... (semua kode fetch data tetap sama) ...
        // ...

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            // --- KUNCI PERUBAHAN DI SINI ---
            // Buat variabel untuk tombol download
            let downloadButtonHTML = '';
            // Hanya buat tombol jika ada link download di data
            if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                const downloadUrl = `download.html?type=${contentData.type}&id=${contentData.id}`;
                downloadButtonHTML = `<a href="${downloadUrl}" class="download-page-btn"><i class="fas fa-download"></i> Download Film Ini</a>`;
            }
            // ---------------------------------

            const metadataHTML = `...`; // (kode metadata tetap sama)

            if (contentData.type === 'series' && contentData.seasons) {
                // KONTEN SERIES
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">...</div>
                    <div class="stream-controls">...</div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                        ${downloadButtonHTML} <!-- Sisipkan tombol di sini -->
                    </div>
                `;
                // ... (sisa logika series tetap sama)
            } else {
                // KONTEN MOVIE
                streamContainer.innerHTML = `
                    <div class="video-player-wrapper">...</div>
                    <div class="stream-details">
                        <h1 class="stream-title">${contentData.title}</h1>
                        <p class="stream-description">${contentData.description}</p>
                        ${metadataHTML}
                        ${downloadButtonHTML} <!-- Sisipkan tombol di sini juga -->
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
