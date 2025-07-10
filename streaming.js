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
            if (!response.ok) {
                console.error(`Gagal mengambil data dari ${response.url}`);
                continue;
            }
            const data = await response.json();
            allData.push(...data);
        }

        const contentData = allData.find(item => item.id === id);
        
        if (contentData) {
            document.title = `${contentData.title} - Netflik`;

            streamContainer.innerHTML = `
                <div class="video-player-wrapper">
                    <div class="video-container">
                        <iframe src="${contentData.streamUrl}?autoplay=1&modestbranding=1&rel=0" title="${contentData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                </div>
                <h1 class="stream-title">${contentData.title}</h1>
                <p class="stream-description">${contentData.description}</p>
            `;
        } else {
            streamContainer.innerHTML = `<p class="error">Konten dengan ID '${id}' tidak ditemukan.</p>`;
        }

    } catch (error) {
        console.error('Error:', error);
        streamContainer.innerHTML = `<p class="error">Terjadi kesalahan saat memuat konten.</p>`;
    }
});
